import {Card} from '../../../packages/ui/src/components/Card/Card'
import {EmptyState} from '../../../packages/ui/src/components/EmptyState/EmptyState'
import {Button} from '../../../packages/ui/src/components/Button/Button'
import {Icon} from '../../../packages/ui/src/components/Icon'
import type {ComponentMeta} from '../types'

export function EmptyStateRecipe() {
  return (
    <Card>
      <EmptyState
        icon={<Icon name="info-circle" size={48} />}
        message="No results found"
        action={
          <Button variant="secondary" onClick={() => console.log('clear filters')}>
            Clear filters
          </Button>
        }
      />
    </Card>
  )
}

export const recipeMeta: ComponentMeta = {
  description: 'Empty state inside a card with icon and action button.',
  whenToUse: ['Search results with no matches', 'Empty dashboard sections', 'First-run states'],
  whenNotToUse: ['Error pages — use Alert or Callout instead'],
  example: '<EmptyStateRecipe />',
}
