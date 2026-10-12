import {useCallback, useLayoutEffect, useRef, useState} from 'react'
import {FlatList} from 'react-native'
import {useLocalSearchParams} from 'expo-router'
import {Button, Icon, Inline, Stack, Text, ThemeProvider, type IconName} from '@duro-app/ui'
import {SkiaIcon} from '../src/bench/SkiaIcon'

const NAMES: IconName[] = ['server', 'check-circle', 'git-branch', 'lock-filled', 'users', 'clock']
const ROWS = Array.from({length: 500}, (_, i) => i)

/**
 * Icon renderer benchmark (plan N0, Decision 9): 500 rows of 3 icons, drawn by
 * Duro's Icon (react-native-svg) or the Skia candidate. Open /bench?renderer=svg
 * or /bench?renderer=skia on a release build; frame times come from
 * `dumpsys gfxinfo` / Instruments while flinging, mount and theme-switch times
 * are printed here and logged.
 */
export default function Bench() {
  const {renderer = 'svg'} = useLocalSearchParams<{renderer?: 'svg' | 'skia'}>()
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [result, setResult] = useState('')
  const startedAt = useRef(performance.now())
  const switchedAt = useRef<number | null>(null)

  const report = useCallback(
    (line: string) => {
      console.log(`[duro-bench] ${renderer} ${line}`)
      setResult((previous) => `${previous}\n${line}`)
    },
    [renderer],
  )

  useLayoutEffect(() => {
    requestAnimationFrame(() =>
      report(`mount ${(performance.now() - startedAt.current).toFixed(1)} ms`),
    )
  }, [report])

  useLayoutEffect(() => {
    if (switchedAt.current === null) return
    const at = switchedAt.current
    requestAnimationFrame(() => report(`theme ${(performance.now() - at).toFixed(1)} ms`))
    switchedAt.current = null
  }, [theme, report])

  const Glyph = renderer === 'skia' ? SkiaIcon : Icon
  return (
    <ThemeProvider theme={theme}>
      <Stack gap="sm">
        <Inline gap="sm">
          <Text>{renderer}</Text>
          <Button
            onClick={() => {
              switchedAt.current = performance.now()
              setTheme((t) => (t === 'dark' ? 'light' : 'dark'))
            }}
          >
            Switch theme
          </Button>
        </Inline>
        <Text>{result}</Text>
        <FlatList
          data={ROWS}
          keyExtractor={(row) => String(row)}
          renderItem={({item}) => (
            <Inline gap="sm">
              {[0, 1, 2].map((k) => (
                <Glyph key={k} name={NAMES[(item + k) % NAMES.length]} size="md" />
              ))}
              <Text>Row {item}</Text>
            </Inline>
          )}
        />
      </Stack>
    </ThemeProvider>
  )
}
