import {html} from 'react-strict-dom'
import {styles} from './styles.css'
import {Menu} from '../Menu/Menu'

export interface SortValue {
  readonly id: string
  readonly desc: boolean
}

export interface SortChipProps {
  readonly options: ReadonlyArray<{readonly id: string; readonly label: string}>
  readonly value: SortValue | null
  readonly onChange: (next: SortValue | null) => void
  /** Visible label preceding the sort field, e.g. "Sort by". */
  readonly label?: string
}

/**
 * Sort selector for stack-mode Tables. Hidden in default/compact via
 * `@container` query — see styles.sortChip. Consumers render this inside
 * a `Table.Container` so the same query target reaches it.
 *
 * The chip is a simple controlled wrapper around `Menu`. It does NOT
 * couple to @tanstack/react-table — the consumer wires `value` and
 * `onChange` from whatever sort state they manage.
 */
export function SortChip({options, value, onChange, label = 'Sort by'}: SortChipProps) {
  const current = value ? options.find((o) => o.id === value.id) : null
  const triggerLabel = current ? `${label}: ${current.label} ${value!.desc ? '↓' : '↑'}` : label

  return (
    <html.div style={styles.sortChip}>
      <Menu.Root>
        <Menu.Trigger>{triggerLabel}</Menu.Trigger>
        <Menu.Popup>
          {options.map((opt) => {
            const isCurrent = value?.id === opt.id
            const nextDesc = isCurrent ? !value!.desc : false
            return (
              <Menu.Item key={opt.id} onClick={() => onChange({id: opt.id, desc: nextDesc})}>
                {opt.label}
                {isCurrent ? ` ${value!.desc ? '↓' : '↑'}` : ''}
              </Menu.Item>
            )
          })}
          {value !== null && <Menu.Item onClick={() => onChange(null)}>Clear sort</Menu.Item>}
        </Menu.Popup>
      </Menu.Root>
    </html.div>
  )
}
SortChip.displayName = 'SortChip'
