import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { auditCurriculumAuthoringDirectory } from '../curriculum/authoring-validation.js'

if (process.argv.length > 2) {
  throw new Error('Usage: curriculum:audit-authoring')
}

const repositoryRoot = fileURLToPath(new URL('../../../../', import.meta.url))
const authoringDirectory = join(repositoryRoot, 'docs', 'curriculum', 'authoring')
const reportPath = join(repositoryRoot, 'docs', 'curriculum', 'reports', 'CURRICULUM_AUTHORING_AUDIT_REPORT.json')
const report = await auditCurriculumAuthoringDirectory(authoringDirectory, repositoryRoot)

await mkdir(dirname(reportPath), { recursive: true })
await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8')

process.stdout.write(`${JSON.stringify({
  ambiguityCount: report.ambiguityCount,
  failedCheckCount: report.failedChecks.count,
  recordCounts: report.recordCounts,
  reportPath,
  scannedFileCount: report.scannedFiles.length,
  valid: report.valid,
  warningCount: report.warnings.count,
}, null, 2)}\n`)

if (!report.valid) process.exitCode = 1
