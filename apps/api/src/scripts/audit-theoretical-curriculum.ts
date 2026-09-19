import { mkdir, writeFile } from 'node:fs/promises'
import { resolve, join } from 'node:path'
import {
  theoreticalCurriculumAuditReport,
  theoreticalCurriculumFreezeManifest,
} from '../curriculum/data/theoretical-curriculum-freeze.js'

const values = process.argv.slice(2)
let reportDir: string | null = null
if (values.length > 0) {
  if (values.length !== 2 || values[0] !== '--report-dir' || !values[1]?.trim()) {
    throw new Error('Usage: curriculum:audit-theoretical [--report-dir <directory>]')
  }
  reportDir = resolve(values[1])
}

if (reportDir) {
  await mkdir(reportDir, { recursive: true })
  await Promise.all([
    writeFile(join(reportDir, 'curriculum-audit-report.json'), `${JSON.stringify(theoreticalCurriculumAuditReport, null, 2)}\n`, 'utf8'),
    writeFile(join(reportDir, 'curriculum-freeze-candidate.json'), `${JSON.stringify(theoreticalCurriculumFreezeManifest, null, 2)}\n`, 'utf8'),
  ])
}

process.stdout.write(`${JSON.stringify({
  valid: theoreticalCurriculumAuditReport.valid,
  totals: theoreticalCurriculumAuditReport.totals,
  sharedSubjectCount: theoreticalCurriculumAuditReport.sharedSubjects.length,
  scopeSpecificSubjectCount: theoreticalCurriculumAuditReport.scopeSpecificSubjects.length,
  unresolvedReviewItemCount: theoreticalCurriculumAuditReport.unresolvedReviewItems.length,
  issueCount: theoreticalCurriculumAuditReport.issues.length,
  catalogSha256: theoreticalCurriculumFreezeManifest.catalogSha256,
  snapshotId: theoreticalCurriculumFreezeManifest.snapshotId,
  reportDir,
}, null, 2)}\n`)

if (!theoreticalCurriculumAuditReport.valid) process.exitCode = 1
