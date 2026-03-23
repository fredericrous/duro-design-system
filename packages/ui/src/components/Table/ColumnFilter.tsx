import type {Column} from '@tanstack/react-table'
import {html} from 'react-strict-dom'
import {css} from 'react-strict-dom'
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {spacing, radii} from '@duro-app/tokens/tokens/spacing.css'
import {typography} from '@duro-app/tokens/tokens/typography.css'

const styles = css.create({
  input: {
    width: '100%',
    paddingTop: 2,
    paddingBottom: 2,
    paddingLeft: spacing.xs,
    paddingRight: spacing.xs,
    marginTop: spacing.xs,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.border,
    borderRadius: radii.xs,
    backgroundColor: colors.bg,
    color: colors.text,
    fontSize: typography.fontSizeXs,
    outline: 'none',
  },
})

interface ColumnFilterProps<TData> {
  column: Column<TData, unknown>
  placeholder?: string
}

export function ColumnFilter<TData>({column, placeholder}: ColumnFilterProps<TData>) {
  if (!column.getCanFilter()) return null

  const filterValue = (column.getFilterValue() as string) ?? ''

  return (
    <html.input
      style={styles.input}
      type="text"
      value={filterValue}
      onChange={(e: any) => column.setFilterValue(e.target.value || undefined)}
      placeholder={placeholder ?? `Filter...`}
    />
  )
}
