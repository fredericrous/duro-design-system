import type {ComponentMeta} from '../component-meta'

export const meta: ComponentMeta = {
  description:
    'Rows of date bars against a date axis (milestones, releases, sprints), with a progress fill per bar and a today marker. Dates are calendar days (YYYY-MM-DD, UTC). A bar is a toggle button (selected/onSelect), can be a DragDrop.Zone target (dropZone), and its edges are keyboard sliders whose value text is a date (onStartChange/onEndChange).',
  anatomy: {required: ['Root', 'Row', 'Bar']},
  whenToUse: [
    'Milestones or releases over weeks, where the overlap and today matter',
    'Dropping work onto a milestone (bars as DragDrop zones)',
  ],
  whenNotToUse: [
    'A schedule by hour — a calendar grid fits (timeGutterW, dayHeaderH)',
    'A dependency graph or a full Gantt chart with links — this draws bars, not edges',
    'Moving dates with the pointer — edges are keyboard sliders; give a date field for the rest',
  ],
  relatedTo: [
    {
      component: 'DragDrop',
      kind: 'composition',
      relationship: 'Pass dropZone to make a bar a DragDrop.Zone inside a DragDrop.Root',
    },
    {
      component: 'Meter',
      kind: 'contrast',
      relationship: 'Meter shows one level; Timeline places spans of time',
    },
  ],
  example: `<Timeline.Root aria-label="Milestones" start="2026-09-21" end="2026-11-08" today="2026-10-08">
  {milestones.map((m) => (
    <Timeline.Row key={m.id} label={m.title} description={\`\${m.done} of \${m.total} done\`}>
      <Timeline.Bar
        label={m.title}
        start={m.start}
        end={m.end}
        progress={m.done / m.total}
        selected={selected === m.id}
        onSelect={() => select(m.id)}
        onEndChange={(end) => reschedule(m.id, {end})}
        dropZone={{id: \`ms:\${m.id}\`, label: m.title}}
      >
        {m.done}/{m.total}
      </Timeline.Bar>
    </Timeline.Row>
  ))}
</Timeline.Root>`,
}
