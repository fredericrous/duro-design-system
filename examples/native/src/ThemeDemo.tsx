import {useEffect, useRef, useState} from 'react'
import {
  Button,
  Card,
  ColorModeProvider,
  ColorModeToggle,
  Icon,
  Inline,
  Stack,
  Text,
  ThemeProvider,
  useColorMode,
  type ColorModePreference,
  type ColorOverrides,
  type FontOverrides,
  type RadiusOverrides,
} from '@duro-app/ui'

const A: ColorOverrides = {bgCard: '#1b2433', accent: '#ff5a1f'}
const B: ColorOverrides = {bgCard: '#0a3c1e', accent: '#1e90ff'}
const MONO: FontOverrides = {fontFamily: "'Courier New', monospace"}
const SQUARE: RadiusOverrides = {xs: '2px', sm: '4px', md: '6px', lg: '8px'}
const STEPS = [
  {label: 'none', overrides: undefined, fonts: undefined, radii: undefined},
  {label: 'A', overrides: A, fonts: undefined, radii: undefined},
  {label: 'B', overrides: B, fonts: undefined, radii: undefined},
  {label: 'fonts and radii', overrides: undefined, fonts: MONO, radii: SQUARE},
] as const

/** Counts its own mounts: a re-mount on a theme change would show 2. */
function Mounts() {
  const mounts = useRef(0)
  const [count, setCount] = useState(0)
  useEffect(() => {
    mounts.current += 1
    setCount(mounts.current)
  }, [])
  return <Text>Mounts: {count}</Text>
}

function Panel() {
  const {preference, theme} = useColorMode()
  return (
    <Text>
      Mode: {preference} → {theme}
    </Text>
  )
}

/**
 * Checkpoint C scenarios for C3: overrides A → B → A and a colour-mode switch
 * on a mounted screen; RSD styles and the icon (resolved colours) follow, and
 * nothing re-mounts. The preference is controlled: native persistence is the
 * app's.
 */
export function ThemeDemo() {
  const [preference, setPreference] = useState<ColorModePreference>('dark')
  return (
    <ColorModeProvider
      preference={preference}
      onPreferenceChange={setPreference}
      modes={['dark', 'light', 'system']}
      applyTheme={false}
    >
      <Themed />
    </ColorModeProvider>
  )
}

function Themed() {
  const {theme} = useColorMode()
  const [step, setStep] = useState(0)
  const current = STEPS[step % STEPS.length]
  return (
    <ThemeProvider
      theme={theme}
      overrides={current.overrides}
      fonts={current.fonts}
      radii={current.radii}
    >
      <Card>
        <Stack gap="sm">
          <Panel />
          <Text>Overrides: {current.label}</Text>
          <Mounts />
          <Inline gap="sm" align="center">
            <Icon name="check-circle" color="accent" />
            <Button onClick={() => setStep((s) => s + 1)}>Next overrides</Button>
            <ColorModeToggle />
          </Inline>
        </Stack>
      </Card>
    </ThemeProvider>
  )
}
