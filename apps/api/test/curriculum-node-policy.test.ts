import assert from 'node:assert/strict'
import test from 'node:test'
import { curriculumParentTypeIsAllowed } from '../src/curriculum/node-policy.js'

test('curriculum parent policy permits explicit skipped levels without inventing nodes', () => {
  assert.equal(curriculumParentTypeIsAllowed('CURRICULUM_ROOT', null), true)
  assert.equal(curriculumParentTypeIsAllowed('SUBJECT', 'FIELD'), true)
  assert.equal(curriculumParentTypeIsAllowed('CONCEPT', 'CHAPTER'), true)
  assert.equal(curriculumParentTypeIsAllowed('SUBCONCEPT', 'CONCEPT'), true)
})

test('curriculum parent policy rejects forced or inverted hierarchy', () => {
  assert.equal(curriculumParentTypeIsAllowed('FIELD', null), false)
  assert.equal(curriculumParentTypeIsAllowed('CURRICULUM_ROOT', 'FIELD'), false)
  assert.equal(curriculumParentTypeIsAllowed('CHAPTER', 'TOPIC'), false)
  assert.equal(curriculumParentTypeIsAllowed('UNKNOWN', 'SUBJECT'), false)
})
