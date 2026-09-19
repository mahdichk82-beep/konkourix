import { randomUUID } from 'node:crypto'
import { basename, dirname, join, resolve } from 'node:path'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import type { PublicUser } from '../auth/types.js'
import {
  buildCurriculumImportManifest,
  createCurriculumAmbiguityReport,
  validateCurriculumImportManifest,
  validateCurriculumManifestProvenance,
} from '../curriculum/import-manifest.js'
import { createPrismaCurriculumStore } from '../curriculum/prisma-store.js'
import { createCurriculumServices } from '../curriculum/services.js'
import type {
  CurriculumImportManifestDraft,
  CurriculumRelationshipRecord,
  CurriculumSourceRecord,
} from '../curriculum/types.js'
import type { PrismaClient } from '../generated/prisma/client.js'

type Flags = Map<string, string>
type Services = ReturnType<typeof createCurriculumServices>

type CatalogRecord = Readonly<{
  ref: string
  sourceRecordKey: string
}>

type Applicability = Readonly<{
  sourceRef: string
  targetRef: string
  type: 'APPLICABILITY'
}>

export type StructuralCurriculumImportConfig = Readonly<{
  commandName: string
  displayName: string
  reportPrefix: string
  requestPrefix: string
  catalog: readonly CatalogRecord[]
  applicability: readonly Applicability[]
  record: (ref: string) => CatalogRecord
  assertTranscription: (transcription: string) => void
  createManifestDraft: (input: {
    expectedRevision: number
    idempotencyKey: string
  }) => CurriculumImportManifestDraft
}>

const usage = (config: StructuralCurriculumImportConfig): string => `${config.displayName} curriculum structural import (draft only)

Validate source fidelity and the generated in-memory manifest without database writes:
  ${config.commandName} preflight --source-artifact <cori.docx> --transcription <CANONICAL_CURRICULUM.md> --expected-revision <revision> --idempotency-key <key> --report-dir <directory>

Import into an authorized DRAFT CurriculumVersion and create shared-subject applicability relationships:
  ${config.commandName} execute --source-artifact <cori.docx> --transcription <CANONICAL_CURRICULUM.md> --admin-user-id <uuid> (--create-draft-label <label> | --target-version-id <uuid>) --expected-revision <revision> --idempotency-key <key> --reason <reason> --report-dir <directory>

This command imports no concepts or sub-concepts and never reviews or publishes a CurriculumVersion.`

const parseFlags = (values: string[]): Flags => {
  const flags = new Map<string, string>()
  for (let index = 0; index < values.length; index += 2) {
    const name = values[index]
    const value = values[index + 1]
    if (!name?.startsWith('--') || !value || value.startsWith('--')) {
      throw new Error(`Invalid argument near ${name ?? '<end>'}`)
    }
    if (flags.has(name)) throw new Error(`Duplicate argument ${name}`)
    flags.set(name, value)
  }
  return flags
}

const required = (flags: Flags, name: string): string => {
  const value = flags.get(name)?.trim()
  if (!value) throw new Error(`Missing required argument ${name}`)
  return value
}

const expectedRevision = (flags: Flags): number => {
  const value = Number(required(flags, '--expected-revision'))
  if (!Number.isSafeInteger(value) || value < 0) throw new Error('--expected-revision must be a non-negative integer')
  return value
}

const writeJson = async (path: string, value: unknown): Promise<void> => {
  await mkdir(dirname(path), { recursive: true })
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
}

const loadPreparedManifest = async (
  config: StructuralCurriculumImportConfig,
  flags: Flags,
) => {
  const sourcePath = resolve(required(flags, '--source-artifact'))
  const transcriptionPath = resolve(required(flags, '--transcription'))
  const [sourceArtifact, transcription] = await Promise.all([
    readFile(sourcePath),
    readFile(transcriptionPath),
  ])
  config.assertTranscription(transcription.toString('utf8'))
  const provenance = {
    sourceArtifact,
    sourceArtifactName: basename(sourcePath),
    transcription,
  }
  const manifest = buildCurriculumImportManifest(config.createManifestDraft({
    expectedRevision: expectedRevision(flags),
    idempotencyKey: required(flags, '--idempotency-key'),
  }), provenance)
  const validation = validateCurriculumImportManifest(manifest)
  const provenanceIssues = validateCurriculumManifestProvenance(manifest, provenance)
  return {
    manifest,
    report: {
      ...validation,
      generatedAt: new Date().toISOString(),
      provenanceIssues,
      valid: validation.valid && provenanceIssues.length === 0,
    },
  }
}

const writePreflightReports = async (
  config: StructuralCurriculumImportConfig,
  reportDir: string,
  prepared: Awaited<ReturnType<typeof loadPreparedManifest>>,
): Promise<void> => {
  await writeJson(join(reportDir, `${config.reportPrefix}-import-preflight.json`), prepared.report)
  await writeJson(
    join(reportDir, `${config.reportPrefix}-import-ambiguities.json`),
    createCurriculumAmbiguityReport(prepared.manifest),
  )
}

const findActor = async (prisma: PrismaClient, userId: string): Promise<PublicUser> => {
  const user = await prisma.user.findFirst({
    select: { createdAt: true, email: true, id: true, phone: true, role: true, status: true, updatedAt: true },
    where: { id: userId, role: 'ADMIN', status: 'ACTIVE' },
  })
  if (!user) throw new Error('An active ADMIN actor is required')
  return user
}

const allSourceRecords = async (
  services: Services,
  actor: PublicUser,
  importId: string,
): Promise<CurriculumSourceRecord[]> => {
  const records: CurriculumSourceRecord[] = []
  let cursor: string | undefined
  do {
    const page = await services.listSourceRecords(actor, importId, { cursor, limit: 100 })
    records.push(...page.items)
    cursor = page.nextCursor ?? undefined
  } while (cursor)
  return records
}

const allRelationships = async (
  services: Services,
  actor: PublicUser,
  versionId: string,
): Promise<CurriculumRelationshipRecord[]> => {
  const relationships: CurriculumRelationshipRecord[] = []
  let cursor: string | undefined
  do {
    const page = await services.listRelationships(actor, versionId, { cursor, limit: 100 })
    relationships.push(...page.items)
    cursor = page.nextCursor ?? undefined
  } while (cursor)
  return relationships
}

const preflight = async (
  config: StructuralCurriculumImportConfig,
  flags: Flags,
): Promise<void> => {
  const prepared = await loadPreparedManifest(config, flags)
  const reportDir = resolve(required(flags, '--report-dir'))
  await writePreflightReports(config, reportDir, prepared)
  if (!prepared.report.valid) {
    throw new Error(`${config.displayName} curriculum preflight failed; see ${join(reportDir, `${config.reportPrefix}-import-preflight.json`)}`)
  }
  process.stdout.write(`${config.displayName} curriculum preflight passed: ${join(reportDir, `${config.reportPrefix}-import-preflight.json`)}\n`)
}

const execute = async (
  config: StructuralCurriculumImportConfig,
  flags: Flags,
): Promise<void> => {
  const prepared = await loadPreparedManifest(config, flags)
  const reportDir = resolve(required(flags, '--report-dir'))
  await writePreflightReports(config, reportDir, prepared)
  if (!prepared.report.valid) {
    throw new Error(`${config.displayName} curriculum preflight failed; no database write occurred. See ${join(reportDir, `${config.reportPrefix}-import-preflight.json`)}`)
  }

  const { prisma } = await import('../lib/prisma.js')
  const actor = await findActor(prisma, required(flags, '--admin-user-id'))
  const services = createCurriculumServices(createPrismaCurriculumStore(prisma))
  const createDraftLabel = flags.get('--create-draft-label')?.trim()
  const targetVersionId = flags.get('--target-version-id')?.trim()
  const reason = required(flags, '--reason')
  if ((createDraftLabel ? 1 : 0) + (targetVersionId ? 1 : 0) !== 1) {
    throw new Error('Choose exactly one of --create-draft-label or --target-version-id')
  }
  if (reason.length < 3) throw new Error('--reason must contain at least three characters')
  const context = { requestId: `${config.requestPrefix}:${randomUUID()}` }

  try {
    let version
    if (createDraftLabel) {
      if (prepared.manifest.expectedRevision !== 0) {
        throw new Error('A newly created draft requires --expected-revision 0')
      }
      version = await services.createVersion(actor, {
        reason,
        sourceSummary: `${config.displayName} structural import from ${prepared.manifest.transcriptionId}; manifest ${prepared.manifest.manifestChecksum}`,
        versionLabel: createDraftLabel,
      }, context)
    } else {
      version = await services.getVersion(actor, targetVersionId!)
      if (version.status !== 'DRAFT') throw new Error(`${config.displayName} import can target only a DRAFT CurriculumVersion`)
    }

    const imported = await services.executeImport(actor, version.id, prepared.manifest, context)
    if (imported.ambiguousCount || imported.rejectedCount) {
      throw new Error(`${config.displayName} import produced ambiguous or rejected records; relationships were not created`)
    }

    const sourceRecords = await allSourceRecords(services, actor, imported.id)
    const nodeBySourceKey = new Map(sourceRecords.flatMap((record) =>
      record.matchedCurriculumNodeId ? [[record.sourceRecordKey, record.matchedCurriculumNodeId] as const] : []))
    if (nodeBySourceKey.size !== config.catalog.length) {
      throw new Error(`Expected ${config.catalog.length} matched curriculum nodes, found ${nodeBySourceKey.size}`)
    }

    const existingRelationships = await allRelationships(services, actor, version.id)
    const relationshipKeys = new Set(existingRelationships.map((relationship) =>
      `${relationship.sourceVersionId}:${relationship.sourceNodeId}:${relationship.targetVersionId}:${relationship.targetNodeId}:${relationship.type}`))
    let applicabilityCreated = 0
    let applicabilityReused = 0
    for (const relationship of config.applicability) {
      const sourceNodeId = nodeBySourceKey.get(config.record(relationship.sourceRef).sourceRecordKey)
      const targetNodeId = nodeBySourceKey.get(config.record(relationship.targetRef).sourceRecordKey)
      if (!sourceNodeId || !targetNodeId) throw new Error(`Unresolved applicability endpoint: ${relationship.sourceRef} -> ${relationship.targetRef}`)
      const key = `${version.id}:${sourceNodeId}:${version.id}:${targetNodeId}:${relationship.type}`
      if (relationshipKeys.has(key)) {
        applicabilityReused += 1
        continue
      }
      const current = await services.getVersion(actor, version.id)
      await services.createRelationship(actor, version.id, {
        expectedRevision: current.revision,
        rationale: 'Shared theoretical-course applicability; ownership remains in the shared curriculum scope.',
        reason,
        sourceNodeId,
        sourceVersionId: version.id,
        targetNodeId,
        targetVersionId: version.id,
        type: relationship.type,
      }, context)
      relationshipKeys.add(key)
      applicabilityCreated += 1
    }

    const validation = await services.validateVersion(actor, version.id, context)
    const finalVersion = await services.getVersion(actor, version.id)
    await writeJson(join(reportDir, `${config.reportPrefix}-import-execution.json`), {
      applicability: {
        created: applicabilityCreated,
        expected: config.applicability.length,
        reused: applicabilityReused,
      },
      generatedAt: new Date().toISOString(),
      import: imported,
      publicationAttempted: false,
      version: {
        id: finalVersion.id,
        revision: finalVersion.revision,
        status: finalVersion.status,
        versionLabel: finalVersion.versionLabel,
      },
      validation,
    })
    process.stdout.write(`${config.displayName} curriculum imported into draft ${version.id}\n`)
    process.stdout.write(`Import result: ${imported.id} (${imported.status})\n`)
    process.stdout.write(`Applicability relationships: ${applicabilityCreated} created, ${applicabilityReused} reused\n`)
    process.stdout.write(`Validation result: ${validation.id} (${validation.status})\n`)
  } catch (error) {
    await writeJson(join(reportDir, `${config.reportPrefix}-import-execution.json`), {
      error: error instanceof Error ? { message: error.message, name: error.name } : { message: 'Unknown error' },
      generatedAt: new Date().toISOString(),
      publicationAttempted: false,
      status: 'FAILED',
    })
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

export const runStructuralCurriculumImport = async (
  config: StructuralCurriculumImportConfig,
): Promise<void> => {
  const [command, ...values] = process.argv.slice(2)
  if (!command || command === 'help' || command === '--help') {
    process.stdout.write(`${usage(config)}\n`)
    return
  }
  const flags = parseFlags(values)
  if (command === 'preflight') return preflight(config, flags)
  if (command === 'execute') return execute(config, flags)
  throw new Error(`Unknown command ${command}\n\n${usage(config)}`)
}
