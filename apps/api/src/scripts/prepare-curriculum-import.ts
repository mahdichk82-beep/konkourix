import { randomUUID } from 'node:crypto'
import { basename, dirname, join, resolve } from 'node:path'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import type { PublicUser } from '../auth/types.js'
import { convertCurriculumAuthoringYaml } from '../curriculum/authoring-conversion.js'
import {
  buildCurriculumImportManifest,
  createCurriculumAmbiguityReport,
  curriculumImportManifestSchema,
  parseCurriculumImportManifest,
  validateCurriculumImportManifest,
  validateCurriculumManifestProvenance,
} from '../curriculum/import-manifest.js'
import { createPrismaCurriculumStore } from '../curriculum/prisma-store.js'
import { createCurriculumServices } from '../curriculum/services.js'
import type { CurriculumImportManifestDraft } from '../curriculum/types.js'
import type { PrismaClient } from '../generated/prisma/client.js'

type Flags = Map<string, string>

const usage = `Curriculum initial-import preparation (draft only)

Build a checksummed manifest from an expert-reviewed draft:
  curriculum:prepare-import build --draft <records.json> --source-artifact <cori.docx> --transcription <CANONICAL_CURRICULUM.md> --out <manifest.json>

Convert an independently reviewed authoring worksheet (offline; no import):
  curriculum:prepare-import build --draft <reviewed.curriculum.yaml> --source-artifact <cori.docx> --transcription <CANONICAL_CURRICULUM.md> --out <manifest.json> [--report-dir <directory>]

Validate provenance, structure, checksums, and emit reports without database writes:
  curriculum:prepare-import preflight --manifest <manifest.json> --source-artifact <cori.docx> --transcription <CANONICAL_CURRICULUM.md> --report-dir <directory>

Create or target a draft, import it, run draft validation, and emit reports:
  curriculum:prepare-import execute --manifest <manifest.json> --source-artifact <cori.docx> --transcription <CANONICAL_CURRICULUM.md> --admin-user-id <uuid> (--create-draft-label <label> | --target-version-id <uuid>) --reason <reason> --report-dir <directory>

This tool has no publication command. Ambiguous records remain quarantined.`

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

const readJson = async (path: string): Promise<unknown> => {
  const text = await readFile(resolve(path), 'utf8')
  return JSON.parse(text.replace(/^\uFEFF/, '')) as unknown
}

const writeJson = async (path: string, value: unknown): Promise<void> => {
  await mkdir(dirname(path), { recursive: true })
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
}

const loadProvenance = async (flags: Flags) => {
  const sourcePath = resolve(required(flags, '--source-artifact'))
  const transcriptionPath = resolve(required(flags, '--transcription'))
  const [sourceArtifact, transcription] = await Promise.all([
    readFile(sourcePath),
    readFile(transcriptionPath),
  ])
  return {
    sourceArtifact,
    sourceArtifactName: basename(sourcePath),
    sourcePath,
    transcription,
    transcriptionPath,
  }
}

const writePreflightReports = async (
  reportDir: string,
  input: unknown,
  provenance: Awaited<ReturnType<typeof loadProvenance>>,
) => {
  const validation = validateCurriculumImportManifest(input)
  const shaped = curriculumImportManifestSchema.safeParse(input)
  const provenanceIssues = shaped.success
    ? validateCurriculumManifestProvenance(shaped.data, provenance)
    : []
  const combined = {
    ...validation,
    generatedAt: new Date().toISOString(),
    provenanceIssues,
    valid: validation.valid && provenanceIssues.length === 0,
  }
  await writeJson(join(reportDir, 'curriculum-import-preflight.json'), combined)
  if (shaped.success) {
    await writeJson(
      join(reportDir, 'curriculum-import-ambiguities.json'),
      createCurriculumAmbiguityReport(shaped.data),
    )
  }
  return { manifest: shaped.success ? shaped.data : null, report: combined }
}

const build = async (flags: Flags): Promise<void> => {
  const provenance = await loadProvenance(flags)
  const draftPath = required(flags, '--draft')
  if (draftPath.toLowerCase().endsWith('.curriculum.yaml')) {
    const outputPath = resolve(required(flags, '--out'))
    const yamlBytes = await readFile(resolve(draftPath))
    const yaml = new TextDecoder('utf-8', { fatal: true }).decode(yamlBytes)
    const converted = convertCurriculumAuthoringYaml(yaml, provenance)
    const reportDir = flags.get('--report-dir')
    if (reportDir) {
      await writeJson(join(resolve(reportDir), 'curriculum-authoring-conversion.json'), converted.report)
    }
    process.stdout.write(`${JSON.stringify(converted.report, null, 2)}\n`)
    if (!converted.manifest) {
      throw new Error('Authoring conversion is not ready; no manifest was written')
    }
    await writeJson(outputPath, converted.manifest)
    process.stdout.write(`Curriculum import manifest created: ${outputPath}\n`)
    return
  }
  const draft = await readJson(draftPath) as CurriculumImportManifestDraft
  const manifest = buildCurriculumImportManifest(draft, provenance)
  const report = validateCurriculumImportManifest(manifest)
  if (!report.valid) throw new Error(`Built manifest failed validation: ${report.issues.map((entry) => entry.code).join(', ')}`)
  const outputPath = resolve(required(flags, '--out'))
  await writeJson(outputPath, manifest)
  process.stdout.write(`Curriculum import manifest created: ${outputPath}\n`)
  process.stdout.write(`Manifest SHA-256: ${manifest.manifestChecksum}\n`)
}

const preflight = async (flags: Flags): Promise<void> => {
  const provenance = await loadProvenance(flags)
  const input = await readJson(required(flags, '--manifest'))
  const reportDir = resolve(required(flags, '--report-dir'))
  const { report } = await writePreflightReports(reportDir, input, provenance)
  if (!report.valid) {
    throw new Error(`Curriculum manifest preflight failed; see ${join(reportDir, 'curriculum-import-preflight.json')}`)
  }
  process.stdout.write(`Curriculum manifest preflight passed: ${join(reportDir, 'curriculum-import-preflight.json')}\n`)
}

const findActor = async (prisma: PrismaClient, userId: string): Promise<PublicUser> => {
  const user = await prisma.user.findFirst({
    select: { createdAt: true, email: true, id: true, phone: true, role: true, status: true, updatedAt: true },
    where: { id: userId, role: 'ADMIN', status: 'ACTIVE' },
  })
  if (!user) throw new Error('An active ADMIN actor is required')
  return user
}

const execute = async (flags: Flags): Promise<void> => {
  const provenance = await loadProvenance(flags)
  const input = await readJson(required(flags, '--manifest'))
  const reportDir = resolve(required(flags, '--report-dir'))
  const preflightResult = await writePreflightReports(reportDir, input, provenance)
  if (!preflightResult.report.valid || !preflightResult.manifest) {
    throw new Error(`Curriculum manifest preflight failed; no database write occurred. See ${join(reportDir, 'curriculum-import-preflight.json')}`)
  }
  const manifest = parseCurriculumImportManifest(preflightResult.manifest)
  const { prisma } = await import('../lib/prisma.js')
  const actor = await findActor(prisma, required(flags, '--admin-user-id'))
  const createDraftLabel = flags.get('--create-draft-label')?.trim()
  const targetVersionId = flags.get('--target-version-id')?.trim()
  if ((createDraftLabel ? 1 : 0) + (targetVersionId ? 1 : 0) !== 1) {
    throw new Error('Choose exactly one of --create-draft-label or --target-version-id')
  }
  const reason = required(flags, '--reason')
  if (reason.length < 3) throw new Error('--reason must contain at least three characters')
  const services = createCurriculumServices(createPrismaCurriculumStore(prisma))
  const context = { requestId: `curriculum-import-cli:${randomUUID()}` }

  try {
    let version
    if (createDraftLabel) {
      if (manifest.expectedRevision !== 0) {
        throw new Error('A newly created draft requires manifest expectedRevision 0')
      }
      version = await services.createVersion(actor, {
        reason,
        sourceSummary: `Initial curriculum preparation from ${manifest.transcriptionId}; manifest ${manifest.manifestChecksum}`,
        versionLabel: createDraftLabel,
      }, context)
    } else {
      version = await services.getVersion(actor, targetVersionId!)
      if (version.status !== 'DRAFT') throw new Error('Initial import preparation can target only a DRAFT CurriculumVersion')
    }
    const imported = await services.executeImport(actor, version.id, manifest, context)
    const validation = await services.validateVersion(actor, version.id, context)
    await writeJson(join(reportDir, 'curriculum-import-execution.json'), {
      draftVersion: { id: version.id, status: version.status, versionLabel: version.versionLabel },
      generatedAt: new Date().toISOString(),
      import: imported,
      publicationAttempted: false,
      validation,
    })
    process.stdout.write(`Curriculum draft prepared: ${version.id}\n`)
    process.stdout.write(`Import result: ${imported.id} (${imported.status})\n`)
    process.stdout.write(`Validation result: ${validation.id} (${validation.status})\n`)
  } catch (error) {
    await writeJson(join(reportDir, 'curriculum-import-execution.json'), {
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

const main = async (): Promise<void> => {
  const [command, ...values] = process.argv.slice(2)
  if (!command || command === 'help' || command === '--help') {
    process.stdout.write(`${usage}\n`)
    return
  }
  const flags = parseFlags(values)
  if (command === 'build') return build(flags)
  if (command === 'preflight') return preflight(flags)
  if (command === 'execute') return execute(flags)
  throw new Error(`Unknown command ${command}\n\n${usage}`)
}

await main()
