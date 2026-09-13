import assert from 'node:assert/strict'
import test from 'node:test'
import {
  activeSessionAfterFinish,
  activeSessionAfterSwitch,
  completedStudySummary,
  elapsedStudyMilliseconds,
  executeActiveRestore,
  executeFinish,
  executeStart,
  executeSwitch,
  executionErrorCodeMessage,
  executionStartDecision,
  formatElapsedStudyTime,
  taskExecutionAction,
  upsertStudySession,
} from './task-execution.ts'
import type { StudySession } from './planning-client.ts'

const session = (
  id: string,
  dailyTaskId: string,
  startedAt: string,
  endedAt: string | null = null,
): StudySession => ({
  createdAt: startedAt,
  dailyTaskId,
  durationMinutes: endedAt ? 25 : null,
  endedAt,
  id,
  notes: null,
  startedAt,
  subjectId: null,
  updatedAt: endedAt ?? startedAt,
})

const activeA = session('session-a1', 'task-a', '2026-09-12T08:00:00.000Z')

test('execution action uses the central active session', () => {
  assert.equal(taskExecutionAction('PENDING', 'task-a', null), 'START')
  assert.equal(taskExecutionAction('PENDING', 'task-a', activeA), 'FINISH')
  assert.equal(taskExecutionAction('PENDING', 'task-b', activeA), 'START')
  assert.equal(taskExecutionAction('COMPLETED', 'task-b', activeA), 'NONE')
  assert.equal(taskExecutionAction('SKIPPED', 'task-b', null), 'NONE')
})

test('start decisions cover normal start, restoration/continue, and switching', () => {
  assert.equal(executionStartDecision('task-a', null), 'START')
  assert.equal(executionStartDecision('task-a', activeA), 'CONTINUE')
  assert.equal(executionStartDecision('task-b', activeA), 'SWITCH')
})

test('elapsed display derives from persisted start time and clamps bad clocks', () => {
  assert.equal(
    elapsedStudyMilliseconds('2026-09-12T08:00:00.000Z', Date.parse('2026-09-12T08:25:17.000Z')),
    1_517_000,
  )
  assert.equal(formatElapsedStudyTime(1_517_000), '00:25:17')
  assert.equal(elapsedStudyMilliseconds('2026-09-12T08:00:00.000Z', Date.parse('2026-09-12T07:59:00.000Z')), 0)
  assert.equal(elapsedStudyMilliseconds('invalid', Date.now()), 0)
})

test('active sessions are excluded from completed recorded minutes', () => {
  const finishedA = session(
    'session-a0',
    'task-a',
    '2026-09-12T07:00:00.000Z',
    '2026-09-12T07:25:00.000Z',
  )
  assert.deepEqual(completedStudySummary([activeA, finishedA]), {
    completedSessions: [finishedA],
    recordedMinutes: 25,
  })
})

test('normal start delegates the target and restores the returned active state', async () => {
  const requested: string[] = []
  const result = await executeStart('task-a', async (taskId) => {
    requested.push(taskId)
    return activeA
  })
  assert.deepEqual(requested, ['task-a'])
  assert.equal(result, activeA)
})

test('refresh restoration delegates to the active-session query and accepts active or empty state', async () => {
  let calls = 0
  const restored = await executeActiveRestore(async () => {
    calls += 1
    return activeA
  })
  const empty = await executeActiveRestore(async () => {
    calls += 1
    return null
  })
  assert.equal(calls, 2)
  assert.equal(restored, activeA)
  assert.equal(empty, null)
})

test('finish delegates server-timed completion and clears matching active state', async () => {
  const finishedA = session(
    activeA.id,
    activeA.dailyTaskId ?? 'task-a',
    activeA.startedAt,
    '2026-09-12T08:25:00.000Z',
  )
  const requested: Array<[string, string | null]> = []
  const result = await executeFinish(activeA.id, null, async (id, notes) => {
    requested.push([id, notes])
    return finishedA
  })
  assert.deepEqual(requested, [[activeA.id, null]])
  assert.equal(activeSessionAfterFinish(activeA, result), null)
  assert.deepEqual(upsertStudySession([activeA], result), [finishedA])
})

test('A to B and B to A switching replaces central state with new sessions', async () => {
  const activeB = session('session-b1', 'task-b', '2026-09-12T08:25:00.000Z')
  const secondActiveA = session('session-a2', 'task-a', '2026-09-12T08:50:00.000Z')
  const firstSwitch = await executeSwitch('task-b', async () => ({
    activeSession: activeB,
    finishedSession: { ...activeA, endedAt: activeB.startedAt, durationMinutes: 25 },
  }))
  assert.equal(activeSessionAfterSwitch(firstSwitch), activeB)

  const secondSwitch = await executeSwitch('task-a', async () => ({
    activeSession: secondActiveA,
    finishedSession: { ...activeB, endedAt: secondActiveA.startedAt, durationMinutes: 25 },
  }))
  assert.equal(activeSessionAfterSwitch(secondSwitch), secondActiveA)
  assert.notEqual(secondActiveA.id, activeA.id)
})

test('switching to an already-active target reuses its state', async () => {
  const result = await executeSwitch('task-a', async () => ({
    activeSession: activeA,
    finishedSession: null,
  }))
  assert.equal(result.activeSession, activeA)
  assert.equal(result.finishedSession, null)
})

test('switch failure leaves current active state untouched', async () => {
  const current: StudySession | null = activeA
  await assert.rejects(
    executeSwitch('task-b', async () => {
      throw new Error('request failed')
    }),
    /request failed/,
  )
  assert.equal(current, activeA)
})

test('execution API conflicts have safe user-facing messages', () => {
  assert.notEqual(executionErrorCodeMessage('ACTIVE_STUDY_SESSION_EXISTS'), null)
  assert.notEqual(executionErrorCodeMessage('LIVE_SESSION_CONFLICT'), null)
  assert.equal(executionErrorCodeMessage('UNKNOWN'), null)
})
