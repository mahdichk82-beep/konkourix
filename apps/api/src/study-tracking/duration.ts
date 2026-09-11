export const calculateStudySessionDurationMinutes = (
  startedAt: Date,
  endedAt: Date,
): number => Math.round((endedAt.getTime() - startedAt.getTime()) / 60_000)
