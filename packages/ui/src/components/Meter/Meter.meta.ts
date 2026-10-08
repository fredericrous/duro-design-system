import type {ComponentMeta} from '../component-meta'

export const meta: ComponentMeta = {
  description:
    'A scalar inside a known range — WIP 2 of 3, a milestone 40% done — as role="meter" with a value text, drawn as a thin bar (the meterH token). The label is the accessible name; valueText says the value in words.',
  whenToUse: [
    'A level against a limit or a total: WIP against its limit, tasks done in a milestone, quota used',
    'Beside a count, when the proportion matters more than the number',
  ],
  whenNotToUse: [
    'Progress of a task that is still running — use Spinner (or a determinate progress pattern)',
    'Picking a value — use an input; a meter has no thumb',
    'A status with no range (ok/failing) — use Badge or StatusIcon',
  ],
  relatedTo: [
    {
      component: 'Badge',
      kind: 'contrast',
      relationship: 'Badge states a status or a count; Meter shows a level within a range',
    },
  ],
  example: `<Meter label="In progress WIP" value={2} max={3} valueText="2 of 3" />
<Meter label="Milestone done" value={0.4} tone="success" />`,
}
