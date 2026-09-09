const port = process.env.PORT ?? '4000'

try {
  const response = await fetch(`http://127.0.0.1:${port}/health/live`)
  if (!response.ok) process.exitCode = 1
} catch {
  process.exitCode = 1
}
