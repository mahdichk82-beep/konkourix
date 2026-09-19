import { randomUUID } from 'node:crypto'
import { Prisma, type PrismaClient } from '../generated/prisma/client.js'
import type {
  CurriculumStore,
  LegacyMappingInput,
  MappingInput,
  RelationshipInput,
  StoreCommandResult,
} from './store.js'
import type {
  CreateNodeInput,
  CreateVersionInput,
  CurriculumActor,
  CurriculumAuditRecord,
  CurriculumCapability,
  CurriculumCapabilityGrantRecord,
  CurriculumImportIssueRecord,
  CurriculumImportManifest,
  CurriculumImportRecord,
  CurriculumNodeRecord,
  CurriculumNodeTypeRecord,
  CurriculumRelationshipRecord,
  CurriculumReviewRecord,
  CurriculumSourceRecord,
  CurriculumValidationRecord,
  CurriculumVersionRecord,
  Page,
  PageQuery,
  RequestContext,
  UpdateNodeInput,
  UpdateVersionInput,
  ValidationFinding,
  ValidationResult,
} from './types.js'
import { validateCurriculumImportManifest } from './import-manifest.js'
import { curriculumParentTypeIsAllowed } from './node-policy.js'

type Tx = Prisma.TransactionClient

const pageLimit = (query?: PageQuery): number => Math.min(Math.max(query?.limit ?? 50, 1), 100)
const pageById = <T extends { id: string }>(records: T[], limit: number): Page<T> => {
  const items = records.slice(0, limit)
  return { items, nextCursor: records.length > limit ? items.at(-1)?.id ?? null : null }
}

const json = (value: unknown): Prisma.InputJsonValue =>
  JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue

const optionalJson = (value: unknown): Prisma.InputJsonValue | undefined =>
  value === undefined || value === null ? undefined : json(value)

const nodeSelect = {
  availabilityStatus: true,
  createdAt: true,
  curriculumNodeId: true,
  curriculumVersionId: true,
  deprecationReason: true,
  displayName: true,
  nodeType: { select: { code: true } },
  nodeTypeId: true,
  parentNodeId: true,
  provenance: true,
  searchName: true,
  siblingPosition: true,
  sourceDisplayName: true,
  sourceOrder: true,
  updatedAt: true,
} as const

type SelectedNode = Prisma.CurriculumNodeRevisionGetPayload<{ select: typeof nodeSelect }>
const mapNode = ({ nodeType, ...record }: SelectedNode): CurriculumNodeRecord => ({
  ...record,
  availabilityStatus: record.availabilityStatus as CurriculumNodeRecord['availabilityStatus'],
  nodeTypeCode: nodeType.code,
  provenance: record.provenance,
})

const audit = async (
  transaction: Tx,
  actor: CurriculumActor | null,
  input: {
    action: string
    capability?: CurriculumCapability
    targetKind: string
    targetId?: string | null
    versionId?: string | null
    nodeId?: string | null
    importId?: string | null
    mappingId?: string | null
    grantId?: string | null
    reason?: string | null
    beforeState?: unknown
    afterState?: unknown
    outcome?: 'SUCCEEDED' | 'REJECTED' | 'FAILED'
  },
  context: RequestContext,
): Promise<void> => {
  await transaction.curriculumAuditLog.create({
    data: {
      action: input.action,
      actorKind: actor ? 'USER' : 'BOOTSTRAP',
      actorUserId: actor?.id,
      afterState: optionalJson(input.afterState),
      beforeState: optionalJson(input.beforeState),
      capability: input.capability,
      grantId: input.grantId,
      importId: input.importId,
      mappingId: input.mappingId,
      nodeId: input.nodeId,
      outcome: input.outcome ?? 'SUCCEEDED',
      reason: input.reason,
      requestId: context.requestId,
      targetId: input.targetId,
      targetKind: input.targetKind,
      versionId: input.versionId,
    },
  })
}

const versionIsPublished: Prisma.CurriculumVersionWhereInput = {
  status: { in: ['PUBLISHED', 'SUPERSEDED'] },
}

const asVersion = (value: unknown): CurriculumVersionRecord => value as CurriculumVersionRecord
const asImport = (value: unknown): CurriculumImportRecord => value as CurriculumImportRecord
const asValidation = (value: unknown): CurriculumValidationRecord => value as CurriculumValidationRecord
const asReview = (value: unknown): CurriculumReviewRecord => value as CurriculumReviewRecord
const asGrant = (value: unknown): CurriculumCapabilityGrantRecord => value as CurriculumCapabilityGrantRecord
const asRelationship = (value: unknown): CurriculumRelationshipRecord => value as CurriculumRelationshipRecord

const staleOrMissingVersion = async (
  transaction: Tx,
  versionId: string,
): Promise<StoreCommandResult<never>> => {
  const version = await transaction.curriculumVersion.findUnique({ select: { revision: true, status: true }, where: { id: versionId } })
  if (!version) return { ok: false, reason: 'VERSION_NOT_FOUND' }
  if (version.status !== 'DRAFT') return { ok: false, reason: 'VERSION_NOT_EDITABLE' }
  return { ok: false, reason: 'STALE_REVISION', currentRevision: version.revision }
}

const lockDraft = async (
  transaction: Tx,
  versionId: string,
  expectedRevision: number,
): Promise<StoreCommandResult<number>> => {
  const updated = await transaction.curriculumVersion.updateMany({
    data: { revision: { increment: 1 } },
    where: { id: versionId, revision: expectedRevision, status: 'DRAFT' },
  })
  return updated.count === 1
    ? { ok: true, value: expectedRevision + 1 }
    : staleOrMissingVersion(transaction, versionId)
}

const importFailure = (error: unknown): string => {
  if (error instanceof Error && error.message.startsWith('CURRICULUM_IMPORT_')) return error.message
  return 'CURRICULUM_IMPORT_FAILED'
}

const capabilityIsEffective = async (
  transaction: Tx,
  actor: CurriculumActor,
  capability: CurriculumCapability,
): Promise<boolean> => {
  const activeAdmin = await transaction.user.count({
    where: { id: actor.id, role: 'ADMIN', status: 'ACTIVE' },
  })
  if (activeAdmin !== 1) return false
  return (await transaction.curriculumCapabilityGrant.count({
    where: {
      capability,
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      revokedAt: null,
      userId: actor.id,
    },
  })) > 0
}

export const createPrismaCurriculumStore = (prisma: PrismaClient): CurriculumStore => ({
  async hasCapability(userId, capability, at) {
    return (await prisma.curriculumCapabilityGrant.count({
      where: {
        capability,
        expiresAt: { gt: at },
        revokedAt: null,
        userId,
      },
    })) > 0 || (await prisma.curriculumCapabilityGrant.count({
      where: { capability, expiresAt: null, revokedAt: null, userId },
    })) > 0
  },

  async findActiveAdmin(userId) {
    return prisma.user.findFirst({ select: { id: true }, where: { id: userId, role: 'ADMIN', status: 'ACTIVE' } })
  },

  async listCapabilityGrants(query) {
    const limit = pageLimit(query)
    const records = await prisma.curriculumCapabilityGrant.findMany({
      cursor: query?.cursor ? { id: query.cursor } : undefined,
      orderBy: [{ grantedAt: 'desc' }, { id: 'desc' }],
      skip: query?.cursor ? 1 : undefined,
      take: limit + 1,
      where: { userId: query?.userId },
    })
    return pageById(records.map(asGrant), limit)
  },

  async grantCapability(actor, input, context) {
    if (actor.id === input.userId) return { ok: false, reason: 'SELF_GRANT_FORBIDDEN' }
    return prisma.$transaction(async (transaction) => {
      if (!await capabilityIsEffective(transaction, actor, 'CURRICULUM_PERMISSION_MANAGE')) return { ok: false, reason: 'CAPABILITY_REVOKED' }
      const existing = await transaction.curriculumCapabilityGrant.findFirst({
        where: { capability: input.capability, revokedAt: null, scope: 'GLOBAL', userId: input.userId },
      })
      if (existing) return { ok: false, reason: 'ACTIVE_GRANT_EXISTS', existing }
      const grant = await transaction.curriculumCapabilityGrant.create({
        data: {
          capability: input.capability,
          expiresAt: input.expiresAt,
          grantReason: input.reason,
          grantedById: actor.id,
          userId: input.userId,
        },
      })
      await audit(transaction, actor, {
        action: 'CURRICULUM_CAPABILITY_GRANTED', capability: 'CURRICULUM_PERMISSION_MANAGE',
        grantId: grant.id, reason: input.reason, targetId: grant.id, targetKind: 'CURRICULUM_CAPABILITY_GRANT',
        afterState: { capability: grant.capability, expiresAt: grant.expiresAt, userId: grant.userId },
      }, context)
      return { ok: true, value: asGrant(grant) }
    })
  },

  async revokeCapability(actor, grantId, reason, context) {
    return prisma.$transaction(async (transaction) => {
      if (!await capabilityIsEffective(transaction, actor, 'CURRICULUM_PERMISSION_MANAGE')) return { ok: false, reason: 'CAPABILITY_REVOKED' }
      const grant = await transaction.curriculumCapabilityGrant.findUnique({ where: { id: grantId } })
      if (!grant || grant.revokedAt) return { ok: false, reason: 'GRANT_NOT_FOUND' }
      if (grant.userId === actor.id && grant.capability === 'CURRICULUM_PERMISSION_MANAGE') {
        const active = await transaction.curriculumCapabilityGrant.count({
          where: { capability: 'CURRICULUM_PERMISSION_MANAGE', revokedAt: null, userId: actor.id },
        })
        if (active <= 1) return { ok: false, reason: 'SOLE_PERMISSION_GRANT_REVOKE_FORBIDDEN' }
      }
      const updated = await transaction.curriculumCapabilityGrant.update({
        data: { revokeReason: reason, revokedAt: new Date(), revokedById: actor.id },
        where: { id: grantId },
      })
      await audit(transaction, actor, {
        action: 'CURRICULUM_CAPABILITY_REVOKED', capability: 'CURRICULUM_PERMISSION_MANAGE',
        grantId, reason, targetId: grantId, targetKind: 'CURRICULUM_CAPABILITY_GRANT',
        beforeState: { capability: grant.capability, userId: grant.userId },
      }, context)
      return { ok: true, value: asGrant(updated) }
    })
  },

  async bootstrapPermissionAdministrator(operatorAdminUserId, adminUserId, reason) {
    return prisma.$transaction(async (transaction) => {
      const [operator, admin] = await Promise.all([
        transaction.user.findFirst({ where: { id: operatorAdminUserId, role: 'ADMIN', status: 'ACTIVE' } }),
        transaction.user.findFirst({ where: { id: adminUserId, role: 'ADMIN', status: 'ACTIVE' } }),
      ])
      if (!operator || !admin || operatorAdminUserId === adminUserId) return { ok: false, reason: 'ADMIN_NOT_FOUND' }
      const existingManager = await transaction.curriculumCapabilityGrant.findFirst({
        where: { capability: 'CURRICULUM_PERMISSION_MANAGE', revokedAt: null },
      })
      if (existingManager) {
        if (existingManager.userId === adminUserId && existingManager.grantReason === reason) {
          return { ok: true, value: asGrant(existingManager) }
        }
        return { ok: false, reason: 'BOOTSTRAP_ALREADY_COMPLETED' }
      }
      const grant = await transaction.curriculumCapabilityGrant.create({
        data: {
          capability: 'CURRICULUM_PERMISSION_MANAGE', grantReason: reason,
          grantedById: operatorAdminUserId, userId: adminUserId,
        },
      })
      await audit(transaction, null, {
        action: 'CURRICULUM_PERMISSION_BOOTSTRAPPED', grantId: grant.id, reason,
        targetId: grant.id, targetKind: 'CURRICULUM_CAPABILITY_GRANT',
        afterState: { capability: grant.capability, userId: grant.userId },
      }, { requestId: `bootstrap:${grant.id}` })
      return { ok: true, value: asGrant(grant) }
    })
  },

  async findCurrentPublishedVersion() {
    const value = await prisma.curriculumVersion.findFirst({ where: { status: 'PUBLISHED' } })
    return value ? asVersion(value) : null
  },
  async findPublishedVersion(id) {
    const value = await prisma.curriculumVersion.findFirst({ where: { id, ...versionIsPublished } })
    return value ? asVersion(value) : null
  },
  async findVersion(id) {
    const value = await prisma.curriculumVersion.findUnique({ where: { id } })
    return value ? asVersion(value) : null
  },
  async listVersions(query) {
    const limit = pageLimit(query)
    const records = await prisma.curriculumVersion.findMany({
      cursor: query?.cursor ? { id: query.cursor } : undefined,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], skip: query?.cursor ? 1 : undefined,
      take: limit + 1, where: { status: query?.status },
    })
    return pageById(records.map(asVersion), limit)
  },

  async createVersion(actor, input, context) {
    try {
      return await prisma.$transaction(async (transaction) => {
        if (!await capabilityIsEffective(transaction, actor, 'CURRICULUM_DRAFT_EDIT')) return { ok: false, reason: 'CAPABILITY_REVOKED' }
        const base = input.basedOnVersionId
          ? await transaction.curriculumVersion.findFirst({ where: { id: input.basedOnVersionId, status: { in: ['PUBLISHED', 'SUPERSEDED'] } } })
          : null
        if (input.basedOnVersionId && !base) return { ok: false, reason: 'VERSION_NOT_FOUND' }
        const version = await transaction.curriculumVersion.create({
          data: {
            basedOnVersionId: input.basedOnVersionId,
            createdById: actor.id,
            effectiveFrom: input.effectiveFrom,
            sourceSummary: input.sourceSummary,
            versionLabel: input.versionLabel,
          },
        })
        if (base) {
          const revisions = await transaction.curriculumNodeRevision.findMany({ where: { curriculumVersionId: base.id } })
          if (revisions.length) {
            await transaction.curriculumNodeRevision.createMany({
              data: revisions.map(({ curriculumVersionId: _versionId, createdAt: _createdAt, updatedAt: _updatedAt, ...revision }) => ({
                ...revision,
                curriculumVersionId: version.id,
                provenance: revision.provenance === null ? Prisma.JsonNull : revision.provenance,
              })),
            })
          }
          const relationships = await transaction.curriculumNodeRelationship.findMany({
            where: { curriculumVersionId: base.id },
          })
          if (relationships.length) {
            await transaction.curriculumNodeRelationship.createMany({
              data: relationships.map((relationship) => ({
                approvedAt: relationship.approvedAt,
                approvedById: relationship.approvedById,
                createdById: relationship.createdById,
                curriculumVersionId: version.id,
                rationale: relationship.rationale,
                sourceNodeId: relationship.sourceNodeId,
                sourceVersionId: relationship.sourceVersionId === base.id ? version.id : relationship.sourceVersionId,
                status: relationship.status === 'SUPERSEDED' ? 'SUPERSEDED' : relationship.status,
                targetNodeId: relationship.targetNodeId,
                targetVersionId: relationship.targetVersionId === base.id ? version.id : relationship.targetVersionId,
                type: relationship.type,
              })),
            })
          }
        }
        await audit(transaction, actor, {
          action: 'CURRICULUM_VERSION_CREATED', capability: 'CURRICULUM_DRAFT_EDIT', reason: input.reason,
          targetId: version.id, targetKind: 'CURRICULUM_VERSION', versionId: version.id,
          afterState: { basedOnVersionId: version.basedOnVersionId, versionLabel: version.versionLabel },
        }, context)
        return { ok: true, value: asVersion(version) }
      })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') return { ok: false, reason: 'DUPLICATE_LABEL' }
      throw error
    }
  },

  async updateVersion(actor, versionId, input, context) {
    try {
      return await prisma.$transaction(async (transaction) => {
        if (!await capabilityIsEffective(transaction, actor, 'CURRICULUM_DRAFT_EDIT')) return { ok: false, reason: 'CAPABILITY_REVOKED' }
        const before = await transaction.curriculumVersion.findUnique({ where: { id: versionId } })
        if (!before) return { ok: false, reason: 'VERSION_NOT_FOUND' }
        if (before.status !== 'DRAFT') return { ok: false, reason: 'VERSION_NOT_EDITABLE' }
        const updated = await transaction.curriculumVersion.updateMany({
          data: {
            effectiveFrom: input.effectiveFrom,
            revision: { increment: 1 },
            sourceSummary: input.sourceSummary,
            versionLabel: input.versionLabel,
          },
          where: { id: versionId, revision: input.expectedRevision, status: 'DRAFT' },
        })
        if (updated.count !== 1) return staleOrMissingVersion(transaction, versionId)
        const value = await transaction.curriculumVersion.findUniqueOrThrow({ where: { id: versionId } })
        await audit(transaction, actor, {
          action: 'CURRICULUM_VERSION_UPDATED', capability: 'CURRICULUM_DRAFT_EDIT', reason: input.reason,
          targetId: versionId, targetKind: 'CURRICULUM_VERSION', versionId,
          beforeState: before, afterState: value,
        }, context)
        return { ok: true, value: asVersion(value) }
      })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') return { ok: false, reason: 'DUPLICATE_LABEL' }
      throw error
    }
  },

  async listNodeTypes() {
    return (await prisma.curriculumNodeType.findMany({ orderBy: { code: 'asc' } })) as CurriculumNodeTypeRecord[]
  },
  async listRoots(versionId, publishedOnly) {
    const records = await prisma.curriculumNodeRevision.findMany({
      orderBy: [{ siblingPosition: 'asc' }, { curriculumNodeId: 'asc' }],
      select: nodeSelect,
      where: {
        curriculumVersionId: versionId, parentNodeId: null,
        version: publishedOnly ? { is: versionIsPublished } : undefined,
      },
    })
    return records.map(mapNode)
  },
  async findNode(versionId, nodeId, publishedOnly) {
    const record = await prisma.curriculumNodeRevision.findFirst({
      select: nodeSelect,
      where: {
        curriculumNodeId: nodeId, curriculumVersionId: versionId,
        version: publishedOnly ? { is: versionIsPublished } : undefined,
      },
    })
    return record ? mapNode(record) : null
  },
  async listChildren(versionId, nodeId, publishedOnly, query) {
    const limit = pageLimit(query)
    const records = await prisma.curriculumNodeRevision.findMany({
      cursor: query?.cursor ? { curriculumVersionId_curriculumNodeId: { curriculumNodeId: query.cursor, curriculumVersionId: versionId } } : undefined,
      orderBy: [{ siblingPosition: 'asc' }, { curriculumNodeId: 'asc' }],
      select: nodeSelect, skip: query?.cursor ? 1 : undefined, take: limit + 1,
      where: { curriculumVersionId: versionId, parentNodeId: nodeId, version: publishedOnly ? { is: versionIsPublished } : undefined },
    })
    const items = records.slice(0, limit).map(mapNode)
    return { items, nextCursor: records.length > limit ? items.at(-1)?.curriculumNodeId ?? null : null }
  },
  async getPath(versionId, nodeId, publishedOnly) {
    const path: CurriculumNodeRecord[] = []
    const seen = new Set<string>()
    let currentId: string | null = nodeId
    while (currentId) {
      if (seen.has(currentId)) return null
      seen.add(currentId)
      const record = await prisma.curriculumNodeRevision.findFirst({
        select: nodeSelect,
        where: { curriculumNodeId: currentId, curriculumVersionId: versionId, version: publishedOnly ? { is: versionIsPublished } : undefined },
      })
      if (!record) return null
      const node = mapNode(record)
      path.unshift(node)
      currentId = node.parentNodeId
    }
    return path
  },
  async getPaths(versionId, nodeIds, publishedOnly) {
    const records = await prisma.curriculumNodeRevision.findMany({
      select: nodeSelect,
      where: {
        curriculumVersionId: versionId,
        version: publishedOnly ? { is: versionIsPublished } : undefined,
      },
    })
    const nodes = new Map(records.map((record) => {
      const node = mapNode(record)
      return [node.curriculumNodeId, node]
    }))
    const paths = new Map<string, CurriculumNodeRecord[]>()
    for (const nodeId of nodeIds) {
      const path: CurriculumNodeRecord[] = []
      const seen = new Set<string>()
      let currentId: string | null = nodeId
      while (currentId && !seen.has(currentId)) {
        seen.add(currentId)
        const node = nodes.get(currentId)
        if (!node) break
        path.unshift(node)
        currentId = node.parentNodeId
      }
      if (path.at(-1)?.curriculumNodeId === nodeId) paths.set(nodeId, path)
    }
    return paths
  },
  async searchNodes(versionId, search, publishedOnly, query) {
    const limit = pageLimit(query)
    const records = await prisma.curriculumNodeRevision.findMany({
      cursor: query?.cursor ? { curriculumVersionId_curriculumNodeId: { curriculumNodeId: query.cursor, curriculumVersionId: versionId } } : undefined,
      orderBy: [{ searchName: 'asc' }, { curriculumNodeId: 'asc' }], select: nodeSelect,
      skip: query?.cursor ? 1 : undefined, take: limit + 1,
      where: {
        curriculumVersionId: versionId, searchName: { contains: search, mode: 'insensitive' },
        version: publishedOnly ? { is: versionIsPublished } : undefined,
      },
    })
    const items = records.slice(0, limit).map(mapNode)
    return { items, nextCursor: records.length > limit ? items.at(-1)?.curriculumNodeId ?? null : null }
  },

  async createNode(actor, versionId, input, context) {
    try {
      return await prisma.$transaction(async (transaction) => {
        if (!await capabilityIsEffective(transaction, actor, 'CURRICULUM_DRAFT_EDIT')) return { ok: false, reason: 'CAPABILITY_REVOKED' }
        const locked = await lockDraft(transaction, versionId, input.expectedRevision)
        if (!locked.ok) return locked
        const type = await transaction.curriculumNodeType.findUnique({ where: { code: input.nodeTypeCode } })
        if (!type) return { ok: false, reason: 'NODE_TYPE_NOT_FOUND' }
        if (!type.isActive) return { ok: false, reason: 'NODE_TYPE_INACTIVE' }
        const parent = input.parentNodeId
          ? await transaction.curriculumNodeRevision.findUnique({
              select: { nodeType: { select: { code: true } } },
              where: { curriculumVersionId_curriculumNodeId: { curriculumNodeId: input.parentNodeId, curriculumVersionId: versionId } },
            })
          : null
        if (input.parentNodeId && !parent) {
          return { ok: false, reason: 'PARENT_NOT_FOUND' }
        }
        if (!curriculumParentTypeIsAllowed(type.code, parent?.nodeType.code ?? null)) {
          return { ok: false, reason: 'PARENT_TYPE_INVALID' }
        }
        const node = await transaction.curriculumNode.create({ data: { createdById: actor.id, identityNote: input.identityNote } })
        const revision = await transaction.curriculumNodeRevision.create({
          data: {
            availabilityStatus: input.availabilityStatus,
            curriculumNodeId: node.id, curriculumVersionId: versionId,
            deprecationReason: input.deprecationReason, displayName: input.displayName,
            nodeTypeId: type.id, parentNodeId: input.parentNodeId,
            provenance: optionalJson(input.provenance), searchName: input.searchName,
            siblingPosition: input.siblingPosition, sourceDisplayName: input.sourceDisplayName,
            sourceOrder: input.sourceOrder,
          }, select: nodeSelect,
        })
        await audit(transaction, actor, {
          action: 'CURRICULUM_NODE_CREATED', capability: 'CURRICULUM_DRAFT_EDIT', nodeId: node.id,
          reason: input.reason, targetId: node.id, targetKind: 'CURRICULUM_NODE', versionId,
          afterState: revision,
        }, context)
        return { ok: true, value: mapNode(revision) }
      })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') return { ok: false, reason: 'DUPLICATE_POSITION' }
      throw error
    }
  },

  async updateNode(actor, versionId, nodeId, input, context) {
    try {
      return await prisma.$transaction(async (transaction) => {
        if (!await capabilityIsEffective(transaction, actor, 'CURRICULUM_DRAFT_EDIT')) return { ok: false, reason: 'CAPABILITY_REVOKED' }
        const before = await transaction.curriculumNodeRevision.findUnique({
          where: { curriculumVersionId_curriculumNodeId: { curriculumNodeId: nodeId, curriculumVersionId: versionId } },
        })
        if (!before) return { ok: false, reason: 'NODE_NOT_FOUND' }
        const locked = await lockDraft(transaction, versionId, input.expectedRevision)
        if (!locked.ok) return locked
        const effectiveParentNodeId = input.parentNodeId === undefined ? before.parentNodeId : input.parentNodeId
        if (effectiveParentNodeId === nodeId) return { ok: false, reason: 'PARENT_CYCLE' }
        let parentTypeCode: string | null = null
        if (effectiveParentNodeId) {
          let ancestor: string | null = effectiveParentNodeId
          const seen = new Set<string>()
          while (ancestor) {
            if (ancestor === nodeId || seen.has(ancestor)) return { ok: false, reason: 'PARENT_CYCLE' }
            seen.add(ancestor)
            const parent: { parentNodeId: string | null; nodeType: { code: string } } | null = await transaction.curriculumNodeRevision.findUnique({
              select: { nodeType: { select: { code: true } }, parentNodeId: true },
              where: { curriculumVersionId_curriculumNodeId: { curriculumNodeId: ancestor, curriculumVersionId: versionId } },
            })
            if (!parent) return { ok: false, reason: 'PARENT_NOT_FOUND' }
            if (ancestor === effectiveParentNodeId) parentTypeCode = parent.nodeType.code
            ancestor = parent.parentNodeId
          }
        }
        const type = input.nodeTypeCode
          ? await transaction.curriculumNodeType.findUnique({ where: { code: input.nodeTypeCode } })
          : null
        if (input.nodeTypeCode && !type) return { ok: false, reason: 'NODE_TYPE_NOT_FOUND' }
        if (type && !type.isActive) return { ok: false, reason: 'NODE_TYPE_INACTIVE' }
        const effectiveTypeCode = type?.code ?? (await transaction.curriculumNodeType.findUniqueOrThrow({
          select: { code: true }, where: { id: before.nodeTypeId },
        })).code
        if (!curriculumParentTypeIsAllowed(effectiveTypeCode, parentTypeCode)) {
          return { ok: false, reason: 'PARENT_TYPE_INVALID' }
        }
        const revision = await transaction.curriculumNodeRevision.update({
          data: {
            availabilityStatus: input.availabilityStatus,
            deprecationReason: input.deprecationReason,
            displayName: input.displayName,
            nodeTypeId: type?.id,
            parentNodeId: input.parentNodeId,
            provenance: optionalJson(input.provenance),
            searchName: input.searchName,
            siblingPosition: input.siblingPosition,
            sourceDisplayName: input.sourceDisplayName,
            sourceOrder: input.sourceOrder,
          },
          select: nodeSelect,
          where: { curriculumVersionId_curriculumNodeId: { curriculumNodeId: nodeId, curriculumVersionId: versionId } },
        })
        await audit(transaction, actor, {
          action: 'CURRICULUM_NODE_UPDATED', capability: 'CURRICULUM_DRAFT_EDIT', nodeId,
          reason: input.reason, targetId: nodeId, targetKind: 'CURRICULUM_NODE', versionId,
          beforeState: before, afterState: revision,
        }, context)
        return { ok: true, value: mapNode(revision) }
      })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') return { ok: false, reason: 'DUPLICATE_POSITION' }
      throw error
    }
  },

  async deleteNode(actor, versionId, nodeId, expectedRevision, reason, context) {
    return prisma.$transaction(async (transaction) => {
      if (!await capabilityIsEffective(transaction, actor, 'CURRICULUM_DRAFT_EDIT')) return { ok: false, reason: 'CAPABILITY_REVOKED' }
      const before = await transaction.curriculumNodeRevision.findUnique({ where: { curriculumVersionId_curriculumNodeId: { curriculumNodeId: nodeId, curriculumVersionId: versionId } } })
      if (!before) return { ok: false, reason: 'NODE_NOT_FOUND' }
      const dependents = await transaction.curriculumNodeRevision.count({ where: { curriculumVersionId: versionId, parentNodeId: nodeId } })
      const relationshipRefs = await transaction.curriculumNodeRelationship.count({ where: { OR: [{ sourceNodeId: nodeId, sourceVersionId: versionId }, { targetNodeId: nodeId, targetVersionId: versionId }] } })
      if (dependents || relationshipRefs) return { ok: false, reason: 'NODE_HAS_DEPENDENTS' }
      const locked = await lockDraft(transaction, versionId, expectedRevision)
      if (!locked.ok) return locked
      await transaction.curriculumNodeRevision.delete({ where: { curriculumVersionId_curriculumNodeId: { curriculumNodeId: nodeId, curriculumVersionId: versionId } } })
      if (await transaction.curriculumNodeRevision.count({ where: { curriculumNodeId: nodeId } }) === 0) {
        await transaction.curriculumNode.delete({ where: { id: nodeId } })
      }
      await audit(transaction, actor, {
        action: 'CURRICULUM_NODE_DELETED', capability: 'CURRICULUM_DRAFT_EDIT', nodeId, reason,
        targetId: nodeId, targetKind: 'CURRICULUM_NODE', versionId, beforeState: before,
      }, context)
      return { ok: true, value: { id: nodeId } }
    })
  },

  async listRelationships(versionId, query) {
    const limit = pageLimit(query)
    const records = await prisma.curriculumNodeRelationship.findMany({
      cursor: query?.cursor ? { id: query.cursor } : undefined,
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }], skip: query?.cursor ? 1 : undefined,
      take: limit + 1, where: { curriculumVersionId: versionId },
    })
    return pageById(records.map(asRelationship), limit)
  },
  async createRelationship(actor, versionId, input, context) {
    try {
      return await prisma.$transaction(async (transaction) => {
        if (!await capabilityIsEffective(transaction, actor, 'CURRICULUM_DRAFT_EDIT')) return { ok: false, reason: 'CAPABILITY_REVOKED' }
        const locked = await lockDraft(transaction, versionId, input.expectedRevision)
        if (!locked.ok) return locked
        const [source, target] = await Promise.all([
          transaction.curriculumNodeRevision.findUnique({ where: { curriculumVersionId_curriculumNodeId: { curriculumNodeId: input.sourceNodeId, curriculumVersionId: input.sourceVersionId } } }),
          transaction.curriculumNodeRevision.findUnique({ where: { curriculumVersionId_curriculumNodeId: { curriculumNodeId: input.targetNodeId, curriculumVersionId: input.targetVersionId } } }),
        ])
        if (!source || !target) return { ok: false, reason: 'NODE_NOT_FOUND' }
        const relationship = await transaction.curriculumNodeRelationship.create({
          data: {
            createdById: actor.id,
            curriculumVersionId: versionId,
            rationale: input.rationale,
            sourceNodeId: input.sourceNodeId,
            sourceVersionId: input.sourceVersionId,
            targetNodeId: input.targetNodeId,
            targetVersionId: input.targetVersionId,
            type: input.type,
          },
        })
        await audit(transaction, actor, {
          action: 'CURRICULUM_RELATIONSHIP_CREATED', capability: 'CURRICULUM_DRAFT_EDIT', reason: input.reason,
          targetId: relationship.id, targetKind: 'CURRICULUM_RELATIONSHIP', versionId, afterState: relationship,
        }, context)
        return { ok: true, value: asRelationship(relationship) }
      })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') return { ok: false, reason: 'DUPLICATE_RELATIONSHIP' }
      throw error
    }
  },
  async updateRelationship(actor, versionId, relationshipId, input, context) {
    return prisma.$transaction(async (transaction) => {
      if (!await capabilityIsEffective(transaction, actor, 'CURRICULUM_DRAFT_EDIT')) return { ok: false, reason: 'CAPABILITY_REVOKED' }
      const before = await transaction.curriculumNodeRelationship.findFirst({ where: { curriculumVersionId: versionId, id: relationshipId } })
      if (!before) return { ok: false, reason: 'RELATIONSHIP_NOT_FOUND' }
      const locked = await lockDraft(transaction, versionId, input.expectedRevision)
      if (!locked.ok) return locked
      const value = await transaction.curriculumNodeRelationship.update({
        data: { rationale: input.rationale, type: input.type }, where: { id: relationshipId },
      })
      await audit(transaction, actor, {
        action: 'CURRICULUM_RELATIONSHIP_UPDATED', capability: 'CURRICULUM_DRAFT_EDIT', reason: input.reason,
        targetId: relationshipId, targetKind: 'CURRICULUM_RELATIONSHIP', versionId,
        beforeState: before, afterState: value,
      }, context)
      return { ok: true, value: asRelationship(value) }
    })
  },
  async deleteRelationship(actor, versionId, relationshipId, expectedRevision, reason, context) {
    return prisma.$transaction(async (transaction) => {
      if (!await capabilityIsEffective(transaction, actor, 'CURRICULUM_DRAFT_EDIT')) return { ok: false, reason: 'CAPABILITY_REVOKED' }
      const before = await transaction.curriculumNodeRelationship.findFirst({ where: { curriculumVersionId: versionId, id: relationshipId } })
      if (!before) return { ok: false, reason: 'RELATIONSHIP_NOT_FOUND' }
      const locked = await lockDraft(transaction, versionId, expectedRevision)
      if (!locked.ok) return locked
      await transaction.curriculumNodeRelationship.delete({ where: { id: relationshipId } })
      await audit(transaction, actor, {
        action: 'CURRICULUM_RELATIONSHIP_DELETED', capability: 'CURRICULUM_DRAFT_EDIT', reason,
        targetId: relationshipId, targetKind: 'CURRICULUM_RELATIONSHIP', versionId, beforeState: before,
      }, context)
      return { ok: true, value: { id: relationshipId } }
    })
  },

  async executeImport(actor, versionId, manifest, context) {
    const authorized = await prisma.$transaction((transaction) =>
      capabilityIsEffective(transaction, actor, 'CURRICULUM_IMPORT_OPERATE'))
    if (!authorized) return { ok: false, reason: 'CAPABILITY_REVOKED' }
    const manifestValidation = validateCurriculumImportManifest(manifest)
    if (!manifestValidation.valid) {
      return { ok: false, reason: 'IMPORT_MANIFEST_INVALID', existing: manifestValidation }
    }
    const existing = await prisma.curriculumImport.findUnique({
      where: { targetVersionId_idempotencyKey: { idempotencyKey: manifest.idempotencyKey, targetVersionId: versionId } },
    })
    if (existing) {
      return existing.payloadChecksum === manifest.payloadChecksum
        && existing.manifestChecksum === manifest.manifestChecksum
        ? { ok: true, value: asImport(existing) }
        : { ok: false, reason: 'IMPORT_PAYLOAD_CONFLICT' }
    }
    const version = await prisma.curriculumVersion.findUnique({ where: { id: versionId } })
    if (!version) return { ok: false, reason: 'VERSION_NOT_FOUND' }
    if (version.status !== 'DRAFT') return { ok: false, reason: 'VERSION_NOT_EDITABLE' }
    if (version.revision !== manifest.expectedRevision) return { ok: false, reason: 'STALE_REVISION', currentRevision: version.revision }

    let importRecord
    try {
      importRecord = await prisma.curriculumImport.create({
        data: {
          idempotencyKey: manifest.idempotencyKey, importedById: actor.id,
          manifestChecksum: manifest.manifestChecksum, manifestSchemaVersion: manifest.manifestSchemaVersion,
          payloadChecksum: manifest.payloadChecksum, sourceArtifactName: manifest.sourceArtifactName,
          sourceArtifactSha256: manifest.sourceArtifactSha256, targetVersionId: versionId,
          transcriptionId: manifest.transcriptionId, transcriptionSha256: manifest.transcriptionSha256,
        },
      })
    } catch (error) {
      if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== 'P2002') throw error
      const concurrent = await prisma.curriculumImport.findUnique({
        where: { targetVersionId_idempotencyKey: { idempotencyKey: manifest.idempotencyKey, targetVersionId: versionId } },
      })
      if (!concurrent
        || concurrent.payloadChecksum !== manifest.payloadChecksum
        || concurrent.manifestChecksum !== manifest.manifestChecksum) {
        return { ok: false, reason: 'IMPORT_PAYLOAD_CONFLICT' }
      }
      return { ok: true, value: asImport(concurrent) }
    }
    try {
      return await prisma.$transaction(async (transaction) => {
        if (!await capabilityIsEffective(transaction, actor, 'CURRICULUM_IMPORT_OPERATE')) throw new Error('CURRICULUM_IMPORT_CAPABILITY_REVOKED')
        await transaction.curriculumImport.update({ data: { status: 'VALIDATING' }, where: { id: importRecord.id } })
        const locked = await lockDraft(transaction, versionId, manifest.expectedRevision)
        if (!locked.ok) throw new Error(`CURRICULUM_IMPORT_${locked.reason}`)
        const keyToNode = new Map<string, string>()
        let acceptedCount = 0
        let unchangedCount = 0
        let ambiguousCount = 0
        let rejectedCount = 0
        const issueCounts: Record<string, number> = {}
        for (const record of [...manifest.records].sort((a, b) => a.sourceOrder - b.sourceOrder)) {
          const prior = await transaction.curriculumSourceRecord.findFirst({
            orderBy: { createdAt: 'desc' },
            where: {
              matchedCurriculumNodeId: { not: null }, sourceRecordKey: record.sourceRecordKey,
              curriculumImport: { targetVersionId: versionId },
            },
          })
          const automaticMarkers = record.rawText.includes('⭐') || record.displayLabel.includes('⭐')
            ? ['STAR_MARKER_UNRESOLVED']
            : []
          const ambiguityMarkers = [...(record.ambiguityMarkers ?? []), ...automaticMarkers]
          const hasAmbiguity = ambiguityMarkers.length > 0
          const nodeType = record.proposedNodeTypeCode
            ? await transaction.curriculumNodeType.findFirst({ where: { code: record.proposedNodeTypeCode, isActive: true } })
            : null
          const parentNodeId = record.parentSourceRecordKey ? keyToNode.get(record.parentSourceRecordKey) : null
          let issue: { code: string; details: unknown } | null = null
          if (hasAmbiguity) issue = { code: 'SOURCE_AMBIGUITY', details: { markers: [...new Set(ambiguityMarkers)] } }
          else if (prior && (prior.checksum !== record.checksum || prior.rawText !== record.rawText)) {
            issue = {
              code: 'SOURCE_RECORD_CHANGED',
              details: {
                previousChecksum: prior.checksum,
                sourceRecordKey: record.sourceRecordKey,
              },
            }
          }
          else if (!nodeType) issue = { code: 'NODE_TYPE_UNRESOLVED', details: { proposedNodeTypeCode: record.proposedNodeTypeCode ?? null } }
          else if (record.parentSourceRecordKey && !parentNodeId) issue = { code: 'PARENT_UNRESOLVED', details: { parentSourceRecordKey: record.parentSourceRecordKey } }
          else {
            const parentType = parentNodeId
              ? await transaction.curriculumNodeRevision.findUnique({
                  select: { nodeType: { select: { code: true } } },
                  where: { curriculumVersionId_curriculumNodeId: { curriculumNodeId: parentNodeId, curriculumVersionId: versionId } },
                })
              : null
            if (nodeType && !curriculumParentTypeIsAllowed(nodeType.code, parentType?.nodeType.code ?? null)) {
              issue = { code: 'PARENT_TYPE_INVALID', details: { nodeTypeCode: nodeType.code, parentTypeCode: parentType?.nodeType.code ?? null } }
            }
          }

          let matchedNodeId: string | null = null
          let disposition: 'ACCEPTED' | 'UNCHANGED' | 'AMBIGUOUS' = 'AMBIGUOUS'
          if (!issue && nodeType) {
            matchedNodeId = prior?.matchedCurriculumNodeId ?? (await transaction.curriculumNode.create({
              data: { createdById: actor.id, identityNote: `Imported from ${record.sourceRecordKey}` },
            })).id
            await transaction.curriculumNodeRevision.upsert({
              create: {
                curriculumNodeId: matchedNodeId, curriculumVersionId: versionId,
                displayName: record.displayLabel, nodeTypeId: nodeType.id, parentNodeId,
                provenance: json({ checksum: record.checksum, sourceLocator: record.sourceLocator, sourceRecordKey: record.sourceRecordKey }),
                searchName: record.displayLabel.normalize('NFKC').trim().toLocaleLowerCase('fa-IR'),
                siblingPosition: record.sourceOrder, sourceDisplayName: record.displayLabel, sourceOrder: record.sourceOrder,
              },
              update: {
                displayName: record.displayLabel, nodeTypeId: nodeType.id, parentNodeId,
                provenance: json({ checksum: record.checksum, sourceLocator: record.sourceLocator, sourceRecordKey: record.sourceRecordKey }),
                searchName: record.displayLabel.normalize('NFKC').trim().toLocaleLowerCase('fa-IR'),
                siblingPosition: record.sourceOrder, sourceDisplayName: record.displayLabel, sourceOrder: record.sourceOrder,
              },
              where: { curriculumVersionId_curriculumNodeId: { curriculumNodeId: matchedNodeId, curriculumVersionId: versionId } },
            })
            keyToNode.set(record.sourceRecordKey, matchedNodeId)
            disposition = prior?.checksum === record.checksum && prior.rawText === record.rawText ? 'UNCHANGED' : 'ACCEPTED'
            if (disposition === 'UNCHANGED') unchangedCount += 1
            else acceptedCount += 1
          } else {
            ambiguousCount += 1
          }
          const source = await transaction.curriculumSourceRecord.create({
            data: {
              ambiguityMarkers: optionalJson([...new Set(ambiguityMarkers)]), checksum: record.checksum,
              displayLabel: record.displayLabel, disposition, importId: importRecord.id,
              matchedCurriculumNodeId: matchedNodeId, matchedCurriculumVersionId: matchedNodeId ? versionId : null,
              parentSourceRecordKey: record.parentSourceRecordKey, proposedNodeTypeCode: record.proposedNodeTypeCode,
              rawText: record.rawText, sourceLocator: record.sourceLocator, sourceOrder: record.sourceOrder,
              sourceRecordKey: record.sourceRecordKey, structuralHints: optionalJson(record.structuralHints),
            },
          })
          if (issue) {
            issueCounts[issue.code] = (issueCounts[issue.code] ?? 0) + 1
            await transaction.curriculumImportIssue.create({
              data: { code: issue.code, details: json(issue.details), importId: importRecord.id, isBlocking: true, severity: 'ERROR', sourceRecordId: source.id },
            })
          }
        }
        const completed = await transaction.curriculumImport.update({
          data: {
            acceptedCount, ambiguousCount, completedAt: new Date(), rejectedCount,
            report: json({
              acceptedCount,
              ambiguityMarkerCounts: manifestValidation.ambiguityCounts,
              ambiguousCount,
              excludedCount: 0,
              issueCounts,
              manifestChecksum: manifest.manifestChecksum,
              payloadChecksum: manifest.payloadChecksum,
              recordCount: manifest.records.length,
              rejectedCount,
              sourceArtifactName: manifest.sourceArtifactName,
              sourceArtifactSha256: manifest.sourceArtifactSha256,
              transcriptionId: manifest.transcriptionId,
              transcriptionSha256: manifest.transcriptionSha256,
              unchangedCount,
            }),
            status: 'COMPLETED', unchangedCount,
          }, where: { id: importRecord.id },
        })
        await audit(transaction, actor, {
          action: 'CURRICULUM_IMPORT_COMPLETED', capability: 'CURRICULUM_IMPORT_OPERATE', importId: importRecord.id,
          reason: 'Authorized manifest import', targetId: importRecord.id, targetKind: 'CURRICULUM_IMPORT', versionId,
          afterState: { acceptedCount, ambiguousCount, rejectedCount, unchangedCount },
        }, context)
        return { ok: true, value: asImport(completed) }
      })
    } catch (error) {
      const code = importFailure(error)
      const failed = await prisma.$transaction(async (transaction) => {
        const record = await transaction.curriculumImport.update({
          data: { failedAt: new Date(), failureCode: code, status: 'FAILED' }, where: { id: importRecord.id },
        })
        await audit(transaction, actor, {
          action: 'CURRICULUM_IMPORT_FAILED', capability: 'CURRICULUM_IMPORT_OPERATE',
          importId: importRecord.id, outcome: 'FAILED', reason: code,
          targetId: importRecord.id, targetKind: 'CURRICULUM_IMPORT', versionId,
          afterState: { failureCode: code, status: 'FAILED' },
        }, context)
        return record
      })
      if (code.includes('STALE_REVISION')) return { ok: false, reason: 'STALE_REVISION' }
      if (code.includes('CAPABILITY_REVOKED')) return { ok: false, reason: 'CAPABILITY_REVOKED' }
      return {
        ok: false,
        reason: 'IMPORT_FAILED',
        existing: { id: failed.id, status: failed.status },
      }
    }
  },

  async listImports(versionId, query) {
    const limit = pageLimit(query)
    const records = await prisma.curriculumImport.findMany({
      cursor: query?.cursor ? { id: query.cursor } : undefined,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], skip: query?.cursor ? 1 : undefined,
      take: limit + 1, where: { targetVersionId: versionId },
    })
    return pageById(records.map(asImport), limit)
  },
  async findImport(importId) {
    const record = await prisma.curriculumImport.findUnique({ where: { id: importId } })
    return record ? asImport(record) : null
  },
  async listSourceRecords(importId, query) {
    const limit = pageLimit(query)
    const records = await prisma.curriculumSourceRecord.findMany({
      cursor: query?.cursor ? { id: query.cursor } : undefined,
      orderBy: [{ sourceOrder: 'asc' }, { id: 'asc' }], skip: query?.cursor ? 1 : undefined,
      take: limit + 1, where: { importId },
    })
    return pageById(records as CurriculumSourceRecord[], limit)
  },
  async listImportIssues(importId, query) {
    const limit = pageLimit(query)
    const records = await prisma.curriculumImportIssue.findMany({
      cursor: query?.cursor ? { id: query.cursor } : undefined,
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }], skip: query?.cursor ? 1 : undefined,
      take: limit + 1,
      where: { disposition: query?.disposition as 'OPEN' | undefined, importId, isBlocking: query?.blocking },
    })
    return pageById(records as CurriculumImportIssueRecord[], limit)
  },
  async resolveImportIssue(actor, importId, issueId, input, context) {
    return prisma.$transaction(async (transaction) => {
      if (!await capabilityIsEffective(transaction, actor, 'CURRICULUM_ISSUE_RESOLVE')) return { ok: false, reason: 'CAPABILITY_REVOKED' }
      const issue = await transaction.curriculumImportIssue.findFirst({ where: { id: issueId, importId } })
      if (!issue) return { ok: false, reason: 'ISSUE_NOT_FOUND' }
      const updated = issue.disposition === 'OPEN'
        ? await transaction.curriculumImportIssue.update({
            data: {
              disposition: input.disposition, resolution: json(input.resolution), resolutionReason: input.reason,
              resolvedAt: new Date(), resolvedById: actor.id,
            }, where: { id: issueId },
          })
        : await transaction.curriculumImportIssue.create({
            data: {
              code: issue.code,
              details: json({ originalDetails: issue.details, supersedesIssueId: issue.id }),
              disposition: input.disposition,
              importId,
              isBlocking: issue.isBlocking,
              resolution: json(input.resolution),
              resolutionReason: input.reason,
              resolvedAt: new Date(),
              resolvedById: actor.id,
              severity: issue.severity,
              sourceRecordId: issue.sourceRecordId,
            },
          })
      const imported = await transaction.curriculumImport.findUniqueOrThrow({ select: { targetVersionId: true }, where: { id: importId } })
      await transaction.curriculumVersion.updateMany({
        data: { reviewedAt: null, revision: { increment: 1 }, status: 'DRAFT' },
        where: { id: imported.targetVersionId, status: { in: ['DRAFT', 'IN_REVIEW'] } },
      })
      await audit(transaction, actor, {
        action: 'CURRICULUM_IMPORT_ISSUE_RESOLVED', capability: 'CURRICULUM_ISSUE_RESOLVE', importId,
        reason: input.reason, targetId: updated.id, targetKind: 'CURRICULUM_IMPORT_ISSUE', versionId: imported.targetVersionId,
        beforeState: issue, afterState: updated,
      }, context)
      return { ok: true, value: updated as CurriculumImportIssueRecord }
    })
  },

  async collectValidation(versionId) {
    const [nodes, issueRows] = await Promise.all([
      prisma.curriculumNodeRevision.findMany({
        select: { curriculumNodeId: true, nodeType: { select: { code: true } }, parentNodeId: true },
        where: { curriculumVersionId: versionId },
      }),
      prisma.curriculumImportIssue.findMany({
        select: { code: true, details: true, disposition: true, id: true },
        where: { curriculumImport: { targetVersionId: versionId }, isBlocking: true },
      }),
    ])
    const supersededIssueIds = new Set(issueRows.flatMap((issue) => {
      const details = issue.details && typeof issue.details === 'object' && !Array.isArray(issue.details)
        ? issue.details as Record<string, unknown>
        : null
      return typeof details?.supersedesIssueId === 'string' ? [details.supersedesIssueId] : []
    }))
    const blockingIssues = issueRows.filter((issue) =>
      ['OPEN', 'MORE_EVIDENCE_REQUIRED'].includes(issue.disposition)
      && !supersededIssueIds.has(issue.id))
    const findings: ValidationFinding[] = blockingIssues.map((issue) => ({
      code: issue.code, issueId: issue.id, message: 'Blocking import issue remains unresolved', severity: 'BLOCKER',
    }))
    const nodeIds = new Set(nodes.map((node) => node.curriculumNodeId))
    for (const node of nodes) {
      if (node.parentNodeId && !nodeIds.has(node.parentNodeId)) {
        findings.push({ code: 'ORPHAN_NODE', message: 'Parent does not resolve in this version', nodeId: node.curriculumNodeId, severity: 'BLOCKER' })
      }
      const parentType = node.parentNodeId
        ? nodes.find((candidate) => candidate.curriculumNodeId === node.parentNodeId)?.nodeType.code ?? null
        : null
      if (!curriculumParentTypeIsAllowed(node.nodeType.code, parentType)) {
        findings.push({ code: 'PARENT_TYPE_INVALID', message: 'Node type is not allowed under its parent type', nodeId: node.curriculumNodeId, severity: 'BLOCKER' })
      }
      const seen = new Set<string>([node.curriculumNodeId])
      let parentId = node.parentNodeId
      while (parentId) {
        if (seen.has(parentId)) {
          findings.push({ code: 'NODE_CYCLE', message: 'Cycle detected in curriculum hierarchy', nodeId: node.curriculumNodeId, severity: 'BLOCKER' })
          break
        }
        seen.add(parentId)
        parentId = nodes.find((candidate) => candidate.curriculumNodeId === parentId)?.parentNodeId ?? null
      }
    }
    const rootCount = nodes.filter((node) => !node.parentNodeId).length
    if (rootCount === 0) findings.push({ code: 'ROOT_REQUIRED', message: 'At least one curriculum root is required', severity: 'BLOCKER' })
    return { findings, nodeCount: nodes.length, rootCount }
  },

  async validateVersion(actor, versionId, context) {
    const authorized = await prisma.$transaction((transaction) =>
      capabilityIsEffective(transaction, actor, 'CURRICULUM_DRAFT_READ'))
    if (!authorized) return { ok: false, reason: 'CAPABILITY_REVOKED' }
    const version = await prisma.curriculumVersion.findUnique({ where: { id: versionId } })
    if (!version) return { ok: false, reason: 'VERSION_NOT_FOUND' }
    if (version.status !== 'DRAFT' && version.status !== 'IN_REVIEW') return { ok: false, reason: 'VERSION_NOT_EDITABLE' }
    const validation = await prisma.curriculumValidationRun.create({ data: { draftRevision: version.revision, initiatedById: actor.id, versionId } })
    const result = await this.collectValidation(versionId)
    const blockerCount = result.findings.filter((finding) => finding.severity === 'BLOCKER').length
    const warningCount = result.findings.filter((finding) => finding.severity === 'WARNING').length
    const completed = await prisma.curriculumValidationRun.update({
      data: { blockerCount, completedAt: new Date(), result: json(result), status: blockerCount ? 'FAILED' : 'PASSED', warningCount },
      where: { id: validation.id },
    })
    await prisma.$transaction(async (transaction) => audit(transaction, actor, {
      action: 'CURRICULUM_VALIDATED', capability: 'CURRICULUM_DRAFT_READ', reason: 'Explicit validation run',
      targetId: validation.id, targetKind: 'CURRICULUM_VALIDATION', versionId,
      afterState: { blockerCount, draftRevision: version.revision, status: completed.status, warningCount },
    }, context))
    return { ok: true, value: asValidation(completed) }
  },
  async listValidations(versionId, query) {
    const limit = pageLimit(query)
    const records = await prisma.curriculumValidationRun.findMany({
      cursor: query?.cursor ? { id: query.cursor } : undefined,
      orderBy: [{ startedAt: 'desc' }, { id: 'desc' }], skip: query?.cursor ? 1 : undefined,
      take: limit + 1, where: { versionId },
    })
    return pageById(records.map(asValidation), limit)
  },
  async findValidation(validationId) {
    const record = await prisma.curriculumValidationRun.findUnique({ where: { id: validationId } })
    return record ? asValidation(record) : null
  },
  async submitReview(actor, versionId, expectedRevision, validationId, reason, context) {
    return prisma.$transaction(async (transaction) => {
      if (!await capabilityIsEffective(transaction, actor, 'CURRICULUM_DRAFT_EDIT')) return { ok: false, reason: 'CAPABILITY_REVOKED' }
      const version = await transaction.curriculumVersion.findUnique({ where: { id: versionId } })
      if (!version) return { ok: false, reason: 'VERSION_NOT_FOUND' }
      if (version.status !== 'DRAFT') return { ok: false, reason: 'VERSION_NOT_EDITABLE' }
      if (version.revision !== expectedRevision) return { ok: false, reason: 'STALE_REVISION', currentRevision: version.revision }
      const validation = await transaction.curriculumValidationRun.findFirst({
        where: { draftRevision: expectedRevision, id: validationId, status: 'PASSED', versionId },
      })
      if (!validation) return { ok: false, reason: 'VALIDATION_NOT_CURRENT' }
      const updated = await transaction.curriculumVersion.update({ data: { status: 'IN_REVIEW' }, where: { id: versionId } })
      await audit(transaction, actor, {
        action: 'CURRICULUM_REVIEW_SUBMITTED', capability: 'CURRICULUM_DRAFT_EDIT', reason,
        targetId: versionId, targetKind: 'CURRICULUM_VERSION', versionId,
        afterState: { draftRevision: expectedRevision, validationId },
      }, context)
      return { ok: true, value: asVersion(updated) }
    })
  },
  async recordReviewDecision(actor, versionId, input, context) {
    return prisma.$transaction(async (transaction) => {
      if (!await capabilityIsEffective(transaction, actor, 'CURRICULUM_REVIEW_DECIDE')) return { ok: false, reason: 'CAPABILITY_REVOKED' }
      const version = await transaction.curriculumVersion.findUnique({ where: { id: versionId } })
      if (!version) return { ok: false, reason: 'VERSION_NOT_FOUND' }
      if (version.status !== 'IN_REVIEW') return { ok: false, reason: 'VERSION_NOT_IN_REVIEW' }
      if (version.revision !== input.expectedRevision) return { ok: false, reason: 'STALE_REVISION', currentRevision: version.revision }
      const validation = await transaction.curriculumValidationRun.findFirst({
        where: { draftRevision: input.expectedRevision, id: input.validationId, status: 'PASSED', versionId },
      })
      if (!validation) return { ok: false, reason: 'VALIDATION_NOT_CURRENT' }
      const decision = await transaction.curriculumReviewDecision.create({
        data: {
          decision: input.decision, draftRevision: input.expectedRevision, findings: input.findings,
          reviewerId: actor.id, validationRunId: input.validationId, versionId,
        },
      })
      await transaction.curriculumVersion.update({
        data: input.decision === 'APPROVED' ? { reviewedAt: new Date() } : { reviewedAt: null, status: 'DRAFT' },
        where: { id: versionId },
      })
      await audit(transaction, actor, {
        action: 'CURRICULUM_REVIEW_DECIDED', capability: 'CURRICULUM_REVIEW_DECIDE', reason: input.findings,
        targetId: decision.id, targetKind: 'CURRICULUM_REVIEW_DECISION', versionId,
        afterState: { decision: input.decision, draftRevision: input.expectedRevision, validationId: input.validationId },
      }, context)
      return { ok: true, value: asReview(decision) }
    })
  },
  async listReviewDecisions(versionId, query) {
    const limit = pageLimit(query)
    const records = await prisma.curriculumReviewDecision.findMany({
      cursor: query?.cursor ? { id: query.cursor } : undefined,
      orderBy: [{ decidedAt: 'desc' }, { id: 'desc' }], skip: query?.cursor ? 1 : undefined,
      take: limit + 1, where: { versionId },
    })
    return pageById(records.map(asReview), limit)
  },
  async publishVersion(actor, versionId, input, context) {
    return prisma.$transaction(async (transaction) => {
      if (!await capabilityIsEffective(transaction, actor, 'CURRICULUM_PUBLISH')) return { ok: false, reason: 'CAPABILITY_REVOKED' }
      await transaction.$queryRaw(
        Prisma.sql`SELECT "id" FROM "curriculum_versions" WHERE "id" = CAST(${versionId} AS uuid) FOR UPDATE`,
      )
      const priorAudit = await transaction.curriculumAuditLog.findFirst({
        where: { action: 'CURRICULUM_VERSION_PUBLISHED', requestId: `publish:${input.idempotencyKey}`, targetId: versionId },
      })
      if (priorAudit) {
        const current = await transaction.curriculumVersion.findUnique({ where: { id: versionId } })
        return current?.status === 'PUBLISHED' || current?.status === 'SUPERSEDED'
          ? { ok: true, value: asVersion(current) }
          : { ok: false, reason: 'PUBLICATION_ALREADY_COMMITTED' }
      }
      const version = await transaction.curriculumVersion.findUnique({ where: { id: versionId } })
      if (!version) return { ok: false, reason: 'VERSION_NOT_FOUND' }
      if (version.status !== 'IN_REVIEW') return { ok: false, reason: 'VERSION_NOT_IN_REVIEW' }
      if (version.revision !== input.expectedRevision) return { ok: false, reason: 'STALE_REVISION', currentRevision: version.revision }
      const validation = await transaction.curriculumValidationRun.findFirst({ where: { draftRevision: input.expectedRevision, id: input.validationId, status: 'PASSED', versionId } })
      if (!validation) return { ok: false, reason: 'VALIDATION_NOT_CURRENT' }
      const review = await transaction.curriculumReviewDecision.findFirst({
        where: { decision: 'APPROVED', draftRevision: input.expectedRevision, id: input.reviewDecisionId, invalidatedAt: null, validationRunId: input.validationId, versionId },
      })
      if (!review) return { ok: false, reason: 'REVIEW_NOT_APPROVED' }
      const issueRows = await transaction.curriculumImportIssue.findMany({
        select: { details: true, disposition: true, id: true },
        where: { curriculumImport: { targetVersionId: versionId }, isBlocking: true },
      })
      const supersededIssueIds = new Set(issueRows.flatMap((issue) => {
        const details = issue.details && typeof issue.details === 'object' && !Array.isArray(issue.details)
          ? issue.details as Record<string, unknown>
          : null
        return typeof details?.supersedesIssueId === 'string' ? [details.supersedesIssueId] : []
      }))
      const unresolved = issueRows.some((issue) =>
        ['OPEN', 'MORE_EVIDENCE_REQUIRED'].includes(issue.disposition)
        && !supersededIssueIds.has(issue.id))
      if (unresolved) return { ok: false, reason: 'BLOCKING_IMPORT_ISSUES' }
      const actorEdited = await transaction.curriculumAuditLog.count({
        where: {
          actorUserId: actor.id,
          action: { in: [
            'CURRICULUM_VERSION_CREATED', 'CURRICULUM_VERSION_UPDATED',
            'CURRICULUM_NODE_CREATED', 'CURRICULUM_NODE_UPDATED', 'CURRICULUM_NODE_DELETED',
            'CURRICULUM_RELATIONSHIP_CREATED', 'CURRICULUM_RELATIONSHIP_UPDATED', 'CURRICULUM_RELATIONSHIP_DELETED',
            'CURRICULUM_IMPORT_COMPLETED', 'CURRICULUM_IMPORT_ISSUE_RESOLVED',
          ] },
          versionId,
        },
      })
      if ((actorEdited > 0 || version.createdById === actor.id || review.reviewerId === actor.id) && !input.separationOfDutyExceptionReason?.trim()) {
        return { ok: false, reason: 'SEPARATION_OF_DUTY_EXCEPTION_REQUIRED' }
      }
      const publishedAt = new Date()
      await transaction.curriculumVersion.updateMany({
        data: { status: 'SUPERSEDED', supersededAt: publishedAt }, where: { status: 'PUBLISHED' },
      })
      await transaction.curriculumNodeRelationship.updateMany({
        data: {
          approvedAt: review.decidedAt,
          approvedById: review.reviewerId,
          status: 'APPROVED',
        },
        where: { curriculumVersionId: versionId, status: 'PROPOSED' },
      })
      const published = await transaction.curriculumVersion.update({
        data: { publishedAt, publishedById: actor.id, status: 'PUBLISHED' }, where: { id: versionId },
      })
      await audit(transaction, actor, {
        action: 'CURRICULUM_VERSION_PUBLISHED', capability: 'CURRICULUM_PUBLISH', reason: input.reason,
        targetId: versionId, targetKind: 'CURRICULUM_VERSION', versionId,
        afterState: {
          draftRevision: input.expectedRevision, reviewDecisionId: input.reviewDecisionId,
          separationOfDutyExceptionReason: input.separationOfDutyExceptionReason ?? null,
          validationId: input.validationId,
        },
      }, { requestId: `publish:${input.idempotencyKey}` })
      return { ok: true, value: asVersion(published) }
    })
  },

  async listNodeMappings(query) {
    const limit = pageLimit(query)
    const records = await prisma.curriculumNodeMapping.findMany({
      cursor: query?.cursor ? { id: query.cursor } : undefined,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], skip: query?.cursor ? 1 : undefined,
      take: limit + 1, where: { fromVersionId: query?.fromVersionId, toVersionId: query?.toVersionId },
    })
    return pageById(records, limit)
  },
  async createNodeMapping(actor, input, context) {
    try {
      return await prisma.$transaction(async (transaction) => {
        if (!await capabilityIsEffective(transaction, actor, 'CURRICULUM_MAPPING_APPROVE')) return { ok: false, reason: 'CAPABILITY_REVOKED' }
        const [from, to] = await Promise.all([
          transaction.curriculumNodeRevision.findFirst({
            where: {
              curriculumNodeId: input.fromNodeId, curriculumVersionId: input.fromVersionId,
              version: { status: { in: ['PUBLISHED', 'SUPERSEDED'] } },
            },
          }),
          transaction.curriculumNodeRevision.findFirst({
            where: {
              curriculumNodeId: input.toNodeId, curriculumVersionId: input.toVersionId,
              version: { status: { in: ['PUBLISHED', 'SUPERSEDED'] } },
            },
          }),
        ])
        if (!from || !to) return { ok: false, reason: 'NODE_NOT_FOUND' }
        const id = randomUUID()
        if (input.supersedesMappingId) {
          const prior = await transaction.curriculumNodeMapping.findUnique({ where: { id: input.supersedesMappingId } })
          if (!prior) return { ok: false, reason: 'MAPPING_NOT_FOUND' }
          await transaction.curriculumNodeMapping.update({
            data: { status: 'SUPERSEDED', supersededById: id },
            where: { id: prior.id },
          })
        }
        const mapping = await transaction.curriculumNodeMapping.create({
          data: {
            approvedAt: new Date(), approvedById: actor.id, confidence: input.confidence,
            createdById: actor.id, fromNodeId: input.fromNodeId, fromVersionId: input.fromVersionId,
            id, mappingType: input.mappingType, rationale: input.rationale, status: 'APPROVED',
            toNodeId: input.toNodeId, toVersionId: input.toVersionId,
          },
        })
        await audit(transaction, actor, {
          action: 'CURRICULUM_MAPPING_APPROVED', capability: 'CURRICULUM_MAPPING_APPROVE', mappingId: id,
          reason: input.rationale, targetId: id, targetKind: 'CURRICULUM_NODE_MAPPING', afterState: mapping,
        }, context)
        return { ok: true, value: mapping }
      })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') return { ok: false, reason: 'DUPLICATE_MAPPING' }
      throw error
    }
  },
  async listLegacyMappings(query) {
    const limit = pageLimit(query)
    const kind = query?.legacyKind ?? 'STUDY_SUBJECT'
    if (kind === 'STUDY_SUBJECT') {
      const rows = await prisma.studySubject.findMany({
        cursor: query?.cursor ? { id: query.cursor } : undefined,
        include: { legacyCurriculumMappings: { orderBy: { createdAt: 'desc' }, take: 1, where: { supersededById: null } } },
        orderBy: { id: 'asc' }, skip: query?.cursor ? 1 : undefined, take: limit + 1,
      })
      return pageById(rows.map(({ legacyCurriculumMappings, ...record }) => ({
        id: record.id, legacyKind: kind, legacyRecord: record,
        mapping: legacyCurriculumMappings[0] ?? null,
        state: legacyCurriculumMappings[0]?.decision ?? 'UNMAPPED',
      })), limit)
    }
    const rows = await prisma.topic.findMany({
      cursor: query?.cursor ? { id: query.cursor } : undefined,
      include: { legacyCurriculumMappings: { orderBy: { createdAt: 'desc' }, take: 1, where: { supersededById: null } } },
      orderBy: { id: 'asc' }, skip: query?.cursor ? 1 : undefined, take: limit + 1,
    })
    return pageById(rows.map(({ legacyCurriculumMappings, ...record }) => ({
      id: record.id, legacyKind: kind, legacyRecord: record,
      mapping: legacyCurriculumMappings[0] ?? null,
      state: legacyCurriculumMappings[0]?.decision ?? 'UNMAPPED',
    })), limit)
  },
  async createLegacyMapping(actor, input, context) {
    return prisma.$transaction(async (transaction) => {
      if (!await capabilityIsEffective(transaction, actor, 'CURRICULUM_MAPPING_APPROVE')) return { ok: false, reason: 'CAPABILITY_REVOKED' }
      const legacyExists = input.legacyKind === 'STUDY_SUBJECT'
        ? await transaction.studySubject.count({ where: { id: input.legacyId } })
        : await transaction.topic.count({ where: { id: input.legacyId } })
      if (!legacyExists) return { ok: false, reason: 'LEGACY_RECORD_NOT_FOUND' }
      if (input.curriculumVersionId && input.curriculumNodeId && !await transaction.curriculumNodeRevision.findFirst({
        where: {
          curriculumNodeId: input.curriculumNodeId,
          curriculumVersionId: input.curriculumVersionId,
          version: { status: { in: ['PUBLISHED', 'SUPERSEDED'] } },
        },
      })) return { ok: false, reason: 'NODE_NOT_FOUND' }
      const id = randomUUID()
      if (input.supersedesMappingId) {
        const prior = await transaction.legacyCurriculumMapping.findUnique({ where: { id: input.supersedesMappingId } })
        if (!prior) return { ok: false, reason: 'MAPPING_NOT_FOUND' }
        await transaction.legacyCurriculumMapping.update({ data: { supersededById: id }, where: { id: prior.id } })
      }
      const reviewed = input.decision !== 'PROPOSED'
      const mapping = await transaction.legacyCurriculumMapping.create({
        data: {
          createdById: actor.id, curriculumNodeId: input.curriculumNodeId,
          curriculumVersionId: input.curriculumVersionId, decision: input.decision, id,
          legacyKind: input.legacyKind, rationale: input.rationale,
          reviewedAt: reviewed ? new Date() : null, reviewedById: reviewed ? actor.id : null,
          studySubjectId: input.legacyKind === 'STUDY_SUBJECT' ? input.legacyId : null,
          topicId: input.legacyKind === 'TOPIC' ? input.legacyId : null,
        },
      })
      await audit(transaction, actor, {
        action: 'LEGACY_CURRICULUM_MAPPING_RECORDED', capability: 'CURRICULUM_MAPPING_APPROVE', mappingId: id,
        reason: input.rationale, targetId: id, targetKind: 'LEGACY_CURRICULUM_MAPPING', afterState: mapping,
      }, context)
      return { ok: true, value: mapping }
    })
  },
  async listAudit(query) {
    const limit = pageLimit(query)
    const records = await prisma.curriculumAuditLog.findMany({
      cursor: query?.cursor ? { id: query.cursor } : undefined,
      orderBy: [{ occurredAt: 'desc' }, { id: 'desc' }], skip: query?.cursor ? 1 : undefined,
      take: limit + 1, where: { action: query?.action, actorUserId: query?.actorUserId, versionId: query?.versionId },
    })
    return pageById(records as CurriculumAuditRecord[], limit)
  },
})
