import type {ComponentMeta} from '../component-meta'

export const meta: ComponentMeta = {
  description:
    'Stacked bars, vertical (a column per day) or row (a bar per item), with a visible legend naming each series, a gap labelled "no report" for missing data, and a visually hidden data table beside the role="img" drawing. Fills are solid tone tokens that hold 3:1 against the card; the vertical height is the chartH token.',
  whenToUse: [
    'A short series of stacked counts, such as resolved against escalated per day',
    'One-row stacked bars in a list, comparing parts of a total per item',
  ],
  whenNotToUse: [
    'A single level against a limit — use Meter',
    'Long or dense time series, or charts needing axes, zoom or tooltips — use a charting library',
    'Exact values the reader must scan — use Table',
  ],
  relatedTo: [
    {
      component: 'Meter',
      kind: 'contrast',
      relationship:
        'Meter shows one level in a range; BarChart compares stacked parts across entries',
    },
  ],
  example: `<BarChart
  aria-label="Resolved and escalated per day"
  series={[
    {key: 'resolved', label: 'Resolved', tone: 'success'},
    {key: 'escalated', label: 'Escalated', tone: 'error'},
  ]}
  data={[
    {label: '25 Sep', values: {resolved: 145, escalated: 152}},
    {label: '26 Sep', values: {}, missing: true},
  ]}
  labelEvery={2}
  emphasis="last"
  categoryLabel="Day"
/>`,
}
