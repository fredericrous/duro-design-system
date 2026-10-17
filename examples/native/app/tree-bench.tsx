import {useCallback, useLayoutEffect, useRef, useState} from 'react'
import {ScrollView} from 'react-native'
import {Badge, Inline, Stack, Text, ThemeProvider, Tree} from '@duro-app/ui'

const BRANCHES = Array.from({length: 20}, (_, b) => b)
const LEAVES = Array.from({length: 15}, (_, l) => l)

/**
 * Tree cost benchmark (plan 2026-10-15, section 3): 20 branches of 15 links,
 * all expanded, Happier-shaped meta (a relative time and a badge). Open
 * /tree-bench on a release build; the mount time is printed here and logged.
 * Scroll is measured by hand on the device (`dumpsys gfxinfo` / Instruments).
 */
export default function TreeBench() {
  const [result, setResult] = useState('')
  const startedAt = useRef(performance.now())

  const report = useCallback((line: string) => {
    console.log(`[duro-bench] tree ${line}`)
    setResult((previous) => `${previous}\n${line}`)
  }, [])

  useLayoutEffect(() => {
    requestAnimationFrame(() =>
      report(`mount ${(performance.now() - startedAt.current).toFixed(1)} ms`),
    )
  }, [report])

  return (
    <ThemeProvider theme="dark">
      <Stack gap="sm">
        <Text>{result}</Text>
        <ScrollView>
          <Tree.Root aria-label="Sessions" defaultExpanded={BRANCHES.map((b) => `branch-${b}`)}>
            {BRANCHES.map((b) => (
              <Tree.Item key={b} value={`branch-${b}`} label={`Project ${b}`}>
                {LEAVES.map((l) => {
                  const i = b * LEAVES.length + l
                  return (
                    <Tree.Item
                      key={i}
                      value={`leaf-${i}`}
                      label={`Session ${i}`}
                      href={`/s/${i}`}
                      onNavigate={(_href, event) => event.preventDefault()}
                      meta={
                        <Inline gap="sm">
                          <Text variant="caption" color="muted">{`${i}m ago`}</Text>
                          <Badge size="sm">Running</Badge>
                        </Inline>
                      }
                    />
                  )
                })}
              </Tree.Item>
            ))}
          </Tree.Root>
        </ScrollView>
      </Stack>
    </ThemeProvider>
  )
}
