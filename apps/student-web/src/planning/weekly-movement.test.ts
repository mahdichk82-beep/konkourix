import assert from 'node:assert/strict'
import test from 'node:test'
import { movementLockReason, replaceTaskDate, restoreTask } from './weekly-movement.ts'

type TestTask = {
  createdByUserId: string
  id: string
  scheduledFor: string
  source: 'PERSONAL' | 'COUNSELOR'
  studentProfileId: string
  title: string
}

const personalTask: TestTask = {
  createdByUserId: 'student-user-1',
  id: 'task-1',
  scheduledFor: '2026-09-12',
  source: 'PERSONAL',
  studentProfileId: 'student-profile-1',
  title: 'مرور ریاضی',
}

test('weekly movement enables only personal tasks with a clear execution check', () => {
  assert.equal(movementLockReason(personalTask, 'CLEAR'), null)
  assert.equal(movementLockReason(personalTask, 'EXECUTED'), 'EXECUTED')
  assert.equal(movementLockReason(personalTask, 'CHECKING'), 'CHECKING')
  assert.equal(movementLockReason(personalTask, 'UNAVAILABLE'), 'UNAVAILABLE')
  assert.equal(movementLockReason({ ...personalTask, source: 'COUNSELOR' }, 'CLEAR'), 'COUNSELOR')
})

test('optimistic weekly movement and rollback preserve task provenance and ownership', () => {
  const moved = replaceTaskDate([personalTask], personalTask.id, '2026-09-13')

  assert.equal(moved[0]?.scheduledFor, '2026-09-13')
  assert.equal(moved[0]?.studentProfileId, personalTask.studentProfileId)
  assert.equal(moved[0]?.createdByUserId, personalTask.createdByUserId)
  assert.equal(moved[0]?.source, personalTask.source)

  const restored = restoreTask(moved, personalTask)
  assert.deepEqual(restored, [personalTask])
})
