const port = process.env.PORT ?? '4000'
const allowedPaths = new Set(['/health/live', '/health'])
const path = process.env.HEALTHCHECK_PATH ?? '/health/live'

try {
  if (!allowedPaths.has(path)) process.exit(1)

  const response = await fetch(`http://127.0.0.1:${port}${path}`)
  if (!response.ok) process.exitCode = 1
} catch {
  process.exitCode = 1
}
