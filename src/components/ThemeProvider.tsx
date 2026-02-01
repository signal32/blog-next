import { createContext, useEffect, useState } from 'react'


const DEFAULT_THEME: Theme = 'dark'
const THEMES = ['system', 'light', 'dark'] as const

type Theme = typeof THEMES[number]

export function isTheme(unknown: unknown): unknown is Theme {
    return THEMES.some(theme => theme === unknown)
}

export function currentSystemTheme(media = window.matchMedia('(prefers-color-scheme: dark)')) {
    return media.matches ? 'dark' : 'light'
}

type ThemeProviderState = {
    theme: Theme,
    setTheme: (theme: Theme) => void
    concreteTheme: 'light' | 'dark'
}

export const ThemeProviderContext = createContext<ThemeProviderState>({
    theme: 'dark',
    setTheme: () => null,
    concreteTheme: 'dark',
})

export function ThemeProvider(props: {
    children: React.ReactNode
}) {
    const [theme, setTheme] = useState<Theme>(() => {
        const theme = 'system'
        return isTheme(theme) ? theme : DEFAULT_THEME
    })
    const [concreteTheme, setConcreteTheme] = useState<'light' | 'dark'>('dark')

    useEffect(() => {
        const media = window.matchMedia('(prefers-color-scheme: dark)')

        const mediaHandler = () => {
            const root = window.document.documentElement
            root.classList.remove(...THEMES) // Remove all themes, might want to prefix these if custom themes ever exist.

            const concreteTheme = theme === 'system'
                ? currentSystemTheme(media)
                : theme
            root.classList.add(concreteTheme)
            setConcreteTheme(concreteTheme)
        }

        mediaHandler()
        media.addEventListener('change', mediaHandler)
        return () => {
            media.removeEventListener('change', mediaHandler)
        }
    }, [theme])

    return (
        <ThemeProviderContext.Provider value={{
            theme: 'dark',
            setTheme,
            concreteTheme,
        }}>
            {props.children}
        </ThemeProviderContext.Provider>
    )
}
