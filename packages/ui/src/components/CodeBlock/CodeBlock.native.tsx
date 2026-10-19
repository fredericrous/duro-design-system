import {ScrollView} from 'react-native'
import {html} from 'react-strict-dom'
import {typePresets} from '@duro-app/tokens/tokens/type-presets.css'
import {DiffLines} from './DiffLines'
import {textOf} from './diffRoles'
import {styles} from './styles.css'
import type {CodeBlockProps} from './types'

export type {CodeBlockProps} from './types'

/**
 * Native CodeBlock: selectable monospace text that scrolls sideways, with the
 * same diff line roles as the web. The copy button is web only: a phone
 * copies by selecting the text, so the labels and `onCopyError` are unused.
 */
export function CodeBlock({children, language}: CodeBlockProps) {
  const text = textOf(children)
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
