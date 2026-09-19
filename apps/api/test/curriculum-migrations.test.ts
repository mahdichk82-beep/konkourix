import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const migration = async (name: string) => readFile(
  new URL(`../../../database/prisma/migrations/${name}/migration.sql`, import.meta.url),
  'utf8',
)

test('Phase 20 migrations create exactly the fourteen contracted additive tables', async () => {
  const sql = [
    await migration('20260918010000_add_curriculum_governance_core'),
    await migration('20260918010100_add_curriculum_import_mapping'),
    await migration('20260918010200_refine_curriculum_mapping_supersession'),
    await migration('20260918010300_enforce_curriculum_decision_immutability'),
  ].join('\n')
  const expected = [
    'curriculum_versions', 'curriculum_node_types', 'curriculum_nodes',
    'curriculum_node_revisions', 'curriculum_node_relationships',
    'curriculum_imports', 'curriculum_source_records', 'curriculum_import_issues',
    'curriculum_validation_runs', 'curriculum_review_decisions',
    'curriculum_audit_logs', 'curriculum_node_mappings',
    'legacy_curriculum_mappings', 'curriculum_capability_grants',
  ]
  const created = [...sql.matchAll(/CREATE TABLE "([^"]+)"/g)].map((match) => match[1]).sort()
  assert.deepEqual(created, [...expected].sort())
})

test('Phase 20 migrations do not alter frozen M19 table definitions', async () => {
  const sql = [
    await migration('20260918010000_add_curriculum_governance_core'),
    await migration('20260918010100_add_curriculum_import_mapping'),
    await migration('20260918010200_refine_curriculum_mapping_supersession'),
    await migration('20260918010300_enforce_curriculum_decision_immutability'),
  ].join('\n')
  const frozen = [
    'users', 'auth_sessions', 'student_profiles', 'counselor_profiles',
    'student_counselor_relationships', 'study_subjects', 'study_topics',
    'study_plans', 'daily_tasks', 'study_sessions', 'assessment_attempts', 'student_goals',
  ]
  for (const table of frozen) {
    assert.doesNotMatch(sql, new RegExp(`(?:CREATE|DROP|TRUNCATE) TABLE "${table}"`))
    assert.doesNotMatch(sql, new RegExp(`ALTER TABLE "${table}"`))
    assert.doesNotMatch(sql, new RegExp(`(?:UPDATE|DELETE FROM) "${table}"`))
  }
})

test('Phase 20 migration constraints retain immutable evidence and effective-only mapping uniqueness', async () => {
  const core = await migration('20260918010000_add_curriculum_governance_core')
  const importAndMapping = await migration('20260918010100_add_curriculum_import_mapping')
  const refinement = await migration('20260918010200_refine_curriculum_mapping_supersession')
  const immutability = await migration('20260918010300_enforce_curriculum_decision_immutability')
  assert.match(core, /curriculum_versions_immutable/)
  assert.match(core, /curriculum_review_decisions_append_only/)
  assert.match(core, /curriculum_audit_logs_append_only/)
  assert.match(importAndMapping, /curriculum_source_records_immutable/)
  assert.match(importAndMapping, /curriculum_import_issues_immutable/)
  assert.match(refinement, /WHERE "status" <> 'SUPERSEDED'/)
  assert.match(immutability, /curriculum_node_mappings_immutable/)
  assert.match(immutability, /legacy_curriculum_mappings_immutable/)
  assert.match(immutability, /curriculum_capability_grants_immutable/)
})
