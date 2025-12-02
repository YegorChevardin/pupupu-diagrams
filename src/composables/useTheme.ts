import { ref, watch } from 'vue'

export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'pupupu-theme'

const theme = ref<Theme>('light')

const loadTheme = () => {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved === 'dark' || saved === 'light') {
    theme.value = saved
  } else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    theme.value = prefersDark ? 'dark' : 'light'
  }
  applyTheme()
}

const applyTheme = () => {
  if (theme.value === 'dark') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

export function useTheme() {
  const toggleTheme = () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
    localStorage.setItem(STORAGE_KEY, theme.value)
    applyTheme()
  }

  const setTheme = (newTheme: Theme) => {
    theme.value = newTheme
    localStorage.setItem(STORAGE_KEY, theme.value)
    applyTheme()
  }

  return {
    theme,
    toggleTheme,
    setTheme,
    loadTheme
  }
}

