import {ScrollView} from 'react-native'
import {html} from 'react-strict-dom'
import {typePresets} from '@duro-app/tokens/tokens/type-presets.css'
import {DiffLines} from './DiffLines'
import {DiffRows} from './DiffRows'
import {textOf} from './diffRoles'
import {styles} from './styles.css'
import type {CodeBlockProps} from './types'

export type {CodeBlockProps} from './types'

/**
 * Native CodeBlock: selectable monospace text that scrolls sideways, with the
 * same diff line roles as the web. The copy button is web only: a phone
 * copies by selecting the text, so the labels and `onCopyError` are unused.
 * With a line action or content under lines, the diff is rows: each line's
 * button and content as on the web (no arrow-key roving on a phone).
 */
export function CodeBlock({children, language, lineAction, renderAfterLine}: CodeBlockProps) {
  const text = textOf(children)
  if (language === 'diff' && (lineAction !== undefined || renderAfterLine !== undefined)) {
    // Content under a line can hold its own controls, so the rows do not scroll sideways as one text.
    return (
      <html.div style={[styles.root, typePresets.code, styles.rows]}>
        <DiffRows text={text} lineAction={lineAction} renderAfterLine={renderAfterLine} />
      </html.div>
    )
  }
  return (
    <html.div style={styles.root}>
      <ScrollView horizontal>
        <html.div style={styles.scroll}>
          {language === 'diff' ? (
            <html.div style={[typePresets.code, styles.text]}>
              <DiffLines text={text} />
            </html.div>
          ) : (
            <html.span style={[typePresets.code, styles.text]}>{text}</html.span>
          )}
        </html.div>
      </ScrollView>
    </html.div>
  )
}
