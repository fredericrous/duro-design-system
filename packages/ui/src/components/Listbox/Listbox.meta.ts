import type {ComponentMeta} from '../component-meta'

export const meta: ComponentMeta = {
  description:
    'Popup list of options for an input that keeps focus — an editor typeahead (mentions, slash commands) or a custom combobox. The anchor owns focus and the keyboard: it sets the controlled highlightedId and spreads Listbox.getAnchorProps() for aria-controls / aria-expanded / aria-activedescendant. A press on an option never takes focus from the anchor. Portalled and placed against anchor() (an input rect or a caret rect), capped at a size-token maxHeight (default listMaxH).',
  whenToUse: [
    'Typeahead inside a rich-text editor, where focus must stay in the editor',
    'A custom combobox whose input is not Combobox.Input',
  ],
  whenNotToUse: [
    'Picking a value from a filterable list in a form — use Combobox (built on Listbox)',
    'A short fixed list — use Select',
    'Actions — use Menu',
  ],
  anatomy: {
    required: ['Root', 'Option'],
    optional: ['Empty'],
  },
  relatedTo: [
    {
      component: 'Combobox',
      kind: 'contrast',
      relationship:
        'Combobox is a ready-made input + Listbox; Listbox alone serves an anchor you own (an editor)',
    },
    {
      component: 'Menu',
      kind: 'contrast',
      relationship:
        'Menu takes focus and triggers actions; Listbox leaves focus on its anchor and offers values',
    },
  ],
  example: `const id = useId()
const [highlightedId, setHighlightedId] = useState<string | null>(null)
const optionId = (value: string) => \`\${id}-\${value}\`
// On the editor root: Object.entries(Listbox.getAnchorProps({id, open, highlightedId}))
<Listbox.Root
  id={id}
  open={open}
  anchor={() => caretRect()}
  highlightedId={highlightedId}
  onHighlight={setHighlightedId}
  onSelect={(value) => insertMention(value)}
  getOptionId={optionId}
  aria-label="Mentions"
>
  {people.map((p) => (
    <Listbox.Option key={p.id} value={p.id}>{p.name}</Listbox.Option>
  ))}
  {people.length === 0 && <Listbox.Empty>No match</Listbox.Empty>}
</Listbox.Root>`,
}
