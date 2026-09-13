import assert from 'node:assert/strict'
import test from 'node:test'
import {
  activeSessionAfterCancel,
  activeSessionAfterFinish,
  activeSessionAfterSwitch,
  cancelStudyConsequenceMessage,
  completedStudySummary,
  elapsedStudyMilliseconds,
  executeActiveRestore,
  executeCancel,
  executeFeedbackUpdate,
  executeFinish,
  executeStart,
  executeSwitch,
  executionErrorCodeMessage,
  executionStartDecision,
  formatElapsedStudyTime,
  normalizeStudySessionRating,
  replaceStudySession,
  studySessionFeedbackLabels,
  studySessionLifecycle,
  switchExecutionChoices,
  taskExecutionAction,
  upsertStudySession,
} from './task-execution.ts'
import type { StudySession } from './planning-client.ts'

const session = (
  id: string,
  dailyTaskId: string,
  startedAt: string,
  endedAt: string | null = null,
  cancelledAt: string | null = null,
): StudySession => ({
  cancelledAt,
  createdAt: startedAt,
  dailyTaskId,
  durationMinutes: endedAt && !cancelledAt ? 25 : null,
  endedAt,
  focusRating: null,
  id,
  notes: null,
  startedAt,
  studyQualityRating: null,
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
  const cancelledA = session(
    'session-cancelled',
    'task-a',
    '2026-09-12T06:00:00.000Z',
    null,
    '2026-09-12T06:25:00.000Z',
  )
  assert.deepEqual(completedStudySummary([activeA, cancelledA, finishedA]), {
    completedSessions: [finishedA],
    recordedMinutes: 25,
  })
  assert.equal(studySessionLifecycle(cancelledA), 'CANCELLED')
  assert.equal(cancelledA.durationMinutes, null)
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

test('finish delegates optional feedback payload and clears matching active state', async () => {
  const finishedA = session(
    activeA.id,
    activeA.dailyTaskId ?? 'task-a',
    activeA.startedAt,
    '2026-09-12T08:25:00.000Z',
  )
  const requested: Array<[string, object]> = []
  const result = await executeFinish(activeA.id, {
    focusRating: 4,
    notes: null,
    studyQualityRating: 5,
  }, async (id, input) => {
    requested.push([id, input])
    return { ...finishedA, focusRating: 4, studyQualityRating: 5 }
  })
  assert.deepEqual(requested, [[activeA.id, {
    focusRating: 4,
    notes: null,
    studyQualityRating: 5,
  }]])
  assert.equal(activeSessionAfterFinish(activeA, result), null)
  assert.deepEqual(upsertStudySession([activeA], result), [result])
})

test('finish remains optional with no rating or one rating', async () => {
  const finished = session(
    activeA.id,
    'task-a',
    activeA.startedAt,
    '2026-09-12T08:25:00.000Z',
  )
  const inputs: object[] = []
  await executeFinish(activeA.id, {}, async (_id, input) => {
    inputs.push(input)
    return finished
  })
  await executeFinish(activeA.id, { focusRating: 3 }, async (_id, input) => {
    inputs.push(input)
    return { ...finished, focusRating: 3 }
  })
  assert.deepEqual(inputs, [{}, { focusRating: 3 }])
})

test('feedback helpers normalize ratings and omit absent or non-finished display values', () => {
  assert.equal(normalizeStudySessionRating('1'), 1)
  assert.equal(normalizeStudySessionRating('5'), 5)
  assert.equal(normalizeStudySessionRating(''), undefined)
  assert.equal(normalizeStudySessionRating('1.5'), undefined)
  assert.equal(normalizeStudySessionRating('6'), undefined)

  const finished = {
    ...session('rated', 'task-a', '2026-09-12T07:00:00.000Z', '2026-09-12T07:25:00.000Z'),
    focusRating: 4,
    studyQualityRating: 5,
  }
  assert.deepEqual(studySessionFeedbackLabels(finished), ['تمرکز: ۴/۵', 'کیفیت مطالعه: ۵/۵'])
  assert.deepEqual(studySessionFeedbackLabels({ ...finished, focusRating: null, studyQualityRating: null }), [])
  assert.deepEqual(studySessionFeedbackLabels({ ...finished, endedAt: null }), [])
  assert.deepEqual(studySessionFeedbackLabels({ ...finished, endedAt: null, cancelledAt: finished.startedAt }), [])
})

test('feedback edit sends only ratings and callers preserve local history on failure', async () => {
  const finished = session(
    'finished-feedback',
    'task-a',
    '2026-09-12T07:00:00.000Z',
    '2026-09-12T07:25:00.000Z',
  )
  const requested: Array<[string, object]> = []
  const updated = await executeFeedbackUpdate(finished.id, {
    focusRating: 3,
    studyQualityRating: null,
  }, async (id, input) => {
    requested.push([id, input])
    return { ...finished, ...input }
  })
  assert.deepEqual(requested, [[finished.id, { focusRating: 3, studyQualityRating: null }]])
  assert.deepEqual(replaceStudySession([finished], updated), [updated])

  const original = [finished]
  await assert.rejects(
    executeFeedbackUpdate(finished.id, { focusRating: 5 }, async () => {
      throw new Error('feedback failed')
    }),
    /feedback failed/,
  )
  assert.deepEqual(original, [finished])
})

test('cancel delegates recovery and clears matching central active state', async () => {
  const cancelledA = session(
    activeA.id,
    activeA.dailyTaskId ?? 'task-a',
    activeA.startedAt,
    null,
    '2026-09-13T08:00:00.000Z',
  )
  const requested: string[] = []
  const result = await executeCancel(activeA.id, async (id) => {
    requested.push(id)
    return cancelledA
  })
  assert.deepEqual(requested, [activeA.id])
  assert.equal(activeSessionAfterCancel(activeA, result), null)
  assert.equal(studySessionLifecycle(result), 'CANCELLED')
})

test('cancel confirmation explains the consequence and switching exposes Finish, Cancel, Continue', () => {
  assert.match(cancelStudyConsequenceMessage, /حساب نمی‌شود/)
  assert.match(cancelStudyConsequenceMessage, /وضعیت کار تغییری نمی‌کند/)
  assert.deepEqual(switchExecutionChoices, {
    CANCEL: 'CANCEL',
    CONTINUE: 'CONTINUE',
    FINISH: 'FINISH',
  })
})

test('A to B and B to A switching replaces central state with new sessions', async () => {
  const activeB = session('session-b1', 'task-b', '2026-09-12T08:25:00.000Z')
  const secondActiveA = session('session-a2', 'task-a', '2026-09-12T08:50:00.000Z')
  const actions: string[] = []
  const firstSwitch = await executeSwitch('task-b', 'FINISH', async (_id, action) => {
    actions.push(action)
    return {
    activeSession: activeB,
    cancelledSession: null,
    finishedSession: { ...activeA, endedAt: activeB.startedAt, durationMinutes: 25 },
    }
  })
  assert.equal(activeSessionAfterSwitch(firstSwitch), activeB)

  const secondSwitch = await executeSwitch('task-a', 'FINISH', async (_id, action) => {
    actions.push(action)
    return {
    activeSession: secondActiveA,
    cancelledSession: null,
    finishedSession: { ...activeB, endedAt: secondActiveA.startedAt, durationMinutes: 25 },
    }
  })
  assert.equal(activeSessionAfterSwitch(secondSwitch), secondActiveA)
  assert.notEqual(secondActiveA.id, activeA.id)
  assert.deepEqual(actions, ['FINISH', 'FINISH'])
})

test('switching to an already-active target reuses its state', async () => {
  const result = await executeSwitch('task-a', 'CANCEL', async () => ({
    activeSession: activeA,
    cancelledSession: null,
    finishedSession: null,
  }))
  assert.equal(result.activeSession, activeA)
  assert.equal(result.finishedSession, null)
})

test('switch failure leaves current active state untouched', async () => {
  const current: StudySession | null = activeA
  await assert.rejects(
    executeSwitch('task-b', 'CANCEL', async () => {
      throw new Error('request failed')
    }),
    /request failed/,
  )
  assert.equal(current, activeA)
})

test('CANCEL switch sends the controlled action and returns cancelled history plus a new active session', async () => {
  const activeB = session('session-b2', 'task-b', '2026-09-13T08:00:00.000Z')
  const cancelledA = session(
    activeA.id,
    'task-a',
    activeA.startedAt,
    null,
    activeB.startedAt,
  )
  const requests: Array<[string, string]> = []
  const result = await executeSwitch('task-b', 'CANCEL', async (id, action) => {
    requests.push([id, action])
    return {
      activeSession: activeB,
      cancelledSession: cancelledA,
      finishedSession: null,
    }
  })

  assert.deepEqual(requests, [['task-b', 'CANCEL']])
  assert.equal(result.activeSession, activeB)
  assert.equal(result.cancelledSession, cancelledA)
  assert.equal(result.finishedSession, null)
  assert.equal(completedStudySummary([cancelledA]).recordedMinutes, 0)
})

test('execution API conflicts have safe user-facing messages', () => {
  assert.notEqual(executionErrorCodeMessage('ACTIVE_STUDY_SESSION_EXISTS'), null)
  assert.notEqual(executionErrorCodeMessage('LIVE_SESSION_CONFLICT'), null)
  assert.notEqual(executionErrorCodeMessage('SESSION_ALREADY_CANCELLED'), null)
  assert.equal(executionErrorCodeMessage('UNKNOWN'), null)
})
