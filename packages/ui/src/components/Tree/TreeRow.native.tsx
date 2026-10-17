import {html} from 'react-strict-dom'
import {SPACING_PX} from '@duro-app/tokens/keys'
import {styles} from './styles.css'
import type {TreeRowProps} from './TreeRowProps'
import {devWarnOnce} from '../../shared/devWarnOnce'
// Explicit suffix: a native-only module has no web file for moduleSuffixes to pair.
import {followLink} from '../../shared/followLink.native'

/* The native row of a Tree.Item, for both variants (with and without href).
 *
 * The row is a plain View holding two SIBLINGS: a branch's chevron control and
 * the press target. react-strict-dom turns an `html.div` with `onClick` into an
 * accessible Pressable that hides its descendants from VoiceOver, so the
 * chevron can never sit inside the press target. The native `li` and group
 * `ul` take role="none" (RSD defaults them to listitem/list), so nothing is
 * announced twice. Label and meta are each a View container: no View inside a
 * Text. Hook-free: Tree.Item owns the state. */
export function TreeRow({
  level,
  label,
  meta,
  text,
  href,
  onNavigate,
  hasChildren,
  open,
  selected,
  onSelect,
  onToggle,
  expandLabel,
  branch,
}: TreeRowProps) {
  if (href !== undefined && onNavigate === undefined) {
    devWarnOnce(
      'Tree',
      'href-without-onNavigate',
      'Tree.Item has an href but no onNavigate: on native a relative href goes to the system (Linking.openURL) and leaves the app. Pass onNavigate to route in-app.',
    )
  }
  const chevronLabel = expandLabel ? expandLabel(text) : text
  if (hasChildren && chevronLabel === '') {
    devWarnOnce(
      'Tree',
      'empty-expand-label',
      'A Tree.Item branch has no text for its expand control: give it a string label or textValue, or Tree.Root an expandLabel.',
    )
  }

  const press = () => {
    onSelect()
    if (href !== undefined) followLink(href, onNavigate, 'Tree.Item')
    // a branch with no link toggles on its row (a folder), as on the web
    else if (hasChildren) onToggle()
  }

  return (
    <html.li role="none" style={styles.item}>
      <html.div
        style={[
          styles.nativeRow,
          styles.indentPx(SPACING_PX.sm + Math.max(0, level - 1) * SPACING_PX.lg),
          selected && styles.rowSelected,
        ]}
      >
        {hasChildren ? (
          <html.div
            role="button"
            aria-expanded={open}
            aria-label={chevronLabel}
            onClick={onToggle}
            style={styles.chevronControl}
          >
            <html.span style={[styles.chevronGlyph, open && styles.chevronOpen]}>▸</html.span>
          </html.div>
        ) : null}
        <html.div
          role={href !== undefined ? 'link' : 'button'}
          aria-selected={selected}
          onClick={press}
          style={styles.pressTarget}
        >
          {hasChildren ? null : <html.div style={styles.chevronSpacer} />}
          <html.div style={styles.labelBox}>
            <html.span>{label}</html.span>
          </html.div>
          {meta != null ? <html.div style={styles.metaBox}>{meta}</html.div> : null}
        </html.div>
      </html.div>
      {open ? (
        <html.ul role="none" style={styles.group}>
          {branch}
        </html.ul>
      ) : null}
    </html.li>
  )
}
