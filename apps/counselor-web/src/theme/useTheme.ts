import { useEffect, useState } from 'react'

export type Theme = 'light' | 'dark'
const storageKey = 'konkourix-counselor-theme'

const initialTheme = (): Theme => {
  try {
    const saved = window.localStorage.getItem(storageKey)
    if (saved === 'light' || saved === 'dark') return saved
  } catch {
    // Storage can be unavailable in privacy-restricted browser contexts.
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(initialTheme)
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.documentElement.style.colorScheme = theme
    try {
      window.localStorage.setItem(storageKey, theme)
    } catch {
      // The active theme still applies for the current page.
    }
  }, [theme])
  return { setTheme, theme }
}
