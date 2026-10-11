import {createContext} from 'react'
import type {ColorToken} from '@duro-app/tokens/keys'
import {darkColors} from '@duro-app/tokens/raw'

/**
 * The theme styles in force where a component renders: every enclosing
 * ThemeProvider's createTheme objects, outermost first. A native Portal
 * re-applies them around its entry, because the host it draws into sits
 * outside the source's ThemeProviders.
 */
export interface ThemeScope {
  readonly styles: readonly unknown[]
}

export const ThemeScopeContext = createContext<ThemeScope>({styles: []})

/** The nearest ThemeProvider's palette as colour strings (native). */
export const ResolvedColorsContext = createContext<Record<ColorToken, string>>(darkColors)
