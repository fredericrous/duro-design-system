import type {ComponentMeta} from '../component-meta'

export const meta: ComponentMeta = {
  description:
    'Tells assistive tech about a change that has no focus move: a polite (role="status") or assertive (role="alert") region. Always mounted — render it empty and change its content to announce; visuallyHidden keeps it off screen.',
  whenToUse: [
    'Confirming an action that leaves focus where it is ("Link copied", "Saved")',
    'A result that arrives later ("12 results", "Answer ready")',
    'An error the person must hear now — politeness="assertive"',
  ],
  whenNotToUse: [
    'A message that also needs to be seen and dismissed — use Toast (it announces itself)',
    'An inline field error — use Field.Error',
  ],
  relatedTo: [
    {
      component: 'VisuallyHidden',
      kind: 'contrast',
      relationship:
        'VisuallyHidden hides static text; LiveRegion visuallyHidden announces changing text',
    },
    {
      component: 'CodeBlock',
      kind: 'composition',
      relationship: 'CodeBlock announces "copied" through a LiveRegion',
    },
  ],
  example: `<LiveRegion visuallyHidden>{copied ? 'Link copied' : ''}</LiveRegion>`,
}
