export type ExecutionCheck = 'CHECKING' | 'CLEAR' | 'EXECUTED' | 'UNAVAILABLE'

export type MovementLockReason = 'COUNSELOR' | Exclude<ExecutionCheck, 'CLEAR'>

type SchedulableTask = {
  id: string
  scheduledFor: string
  source: 'PERSONAL' | 'COUNSELOR'
}

export const movementLockReason = (
  task: SchedulableTask,
  executionCheck: ExecutionCheck,
): MovementLockReason | null => {
  if (task.source === 'COUNSELOR') return 'COUNSELOR'
  return executionCheck === 'CLEAR' ? null : executionCheck
}

export const replaceTaskDate = <Task extends SchedulableTask>(
  tasks: Task[],
  taskId: string,
  scheduledFor: string,
): Task[] => tasks.map((task) => task.id === taskId ? { ...task, scheduledFor } : task)

export const restoreTask = <Task extends SchedulableTask>(
  tasks: Task[],
  original: Task,
): Task[] => tasks.map((task) => task.id === original.id ? original : task)
