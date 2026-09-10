import { useCallback, useEffect, useState } from 'react'

const normalizePath = (path: string) =>
  path.length > 1 ? path.replace(/\/+$/, '') : '/'

export function useBrowserRouter() {
  const [path, setPath] = useState(() => normalizePath(window.location.pathname))

  useEffect(() => {
    const updatePath = () => setPath(normalizePath(window.location.pathname))
    window.addEventListener('popstate', updatePath)
    return () => window.removeEventListener('popstate', updatePath)
  }, [])

  const navigate = useCallback((nextPath: string, replace = false) => {
    const normalized = normalizePath(nextPath)
    window.history[replace ? 'replaceState' : 'pushState']({}, '', normalized)
    setPath(normalized)
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [])

  return { navigate, path }
}
