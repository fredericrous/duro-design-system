import type {Meta, StoryObj} from '@storybook/react'
import {expect, fn, waitFor, within} from 'storybook/test'
import {useCallback, useEffect, useId, useRef, useState} from 'react'
import {css, html} from 'react-strict-dom'
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {borders} from '@duro-app/tokens/tokens/borders.css'
import {sizes} from '@duro-app/tokens/tokens/sizes.css'
import {spacing, radii} from '@duro-app/tokens/tokens/spacing.css'
import {Listbox} from './Listbox'

const meta: Meta = {
  title: 'Components/Listbox',
}

export default meta
type Story = StoryObj

const page = () => within(document.body)

const styles = css.create({
  editor: {
    minHeight: sizes.editorMinH,
    padding: spacing.sm,
    borderWidth: borders.hairline,
    borderStyle: 'solid',
    borderColor: colors.border,
    borderRadius: radii.sm,
    color: colors.text,
  },
})

const PEOPLE = ['Ada', 'Grace', 'Linus', 'Margaret']
const onPick = fn()

// A contenteditable typeahead: '@' opens the list, arrows move the highlight,
// Enter picks. The editor keeps focus throughout.
function MentionEditor() {
  const id = useId()
  const editorRef = useRef<HTMLDivElement | null>(null)
  const [open, setOpen] = useState(false)
  const [highlighted, setHighlighted] = useState(0)
  const optionId = useCallback((value: string) => `${id}-${value}`, [id])
  const highlightedId = open ? optionId(PEOPLE[highlighted]!) : null

  const pick = useCallback((value: string) => {
    onPick(value)
    editorRef.current?.append(`${value} `)
    setOpen(false)
  }, [])

  // The anchor's ARIA, set on the contenteditable root like an editor would.
  useEffect(() => {
    const editor = editorRef.current
    if (!editor) return
    for (const [name, value] of Object.entries(Listbox.getAnchorProps({id, open, highlightedId}))) {
      if (value === undefined) editor.removeAttribute(name)
      else editor.setAttribute(name, String(value))
    }
  }, [id, open, highlightedId])

  useEffect(() => {
    const editor = editorRef.current
    if (!editor) return
    editor.setAttribute('contenteditable', 'true')
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === '@') {
        setOpen(true)
        setHighlighted(0)
        return
      }
      if (!openRef.current) return
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setHighlighted((i) => (i + 1) % PEOPLE.length)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setHighlighted((i) => (i - 1 + PEOPLE.length) % PEOPLE.length)
      } else if (e.key === 'Enter') {
        e.preventDefault()
        pick(PEOPLE[highlightedRef.current]!)
      } else if (e.key === 'Escape') {
        setOpen(false)
      }
    }
    editor.addEventListener('keydown', onKeyDown)
    return () => editor.removeEventListener('keydown', onKeyDown)
  }, [pick])

  const openRef = useRef(open)
  openRef.current = open
  const highlightedRef = useRef(highlighted)
  highlightedRef.current = highlighted

  return (
    <>
      <html.div
        ref={editorRef}
        role="textbox"
        aria-label="Message"
        aria-multiline={true}
        style={styles.editor}
      />
      <Listbox.Root
        id={id}
        open={open}
        anchor={() => editorRef.current?.getBoundingClientRect()}
        highlightedId={highlightedId}
        onHighlight={(next) => {
          const index = PEOPLE.findIndex((p) => optionId(p) === next)
          if (index >= 0) setHighlighted(index)
        }}
        onSelect={pick}
        getOptionId={optionId}
        aria-label="People"
      >
        {PEOPLE.map((person) => (
          <Listbox.Option key={person} value={person}>
            {person}
          </Listbox.Option>
        ))}
      </Listbox.Root>
    </>
  )
}

export const EditorTypeahead: Story = {
  beforeEach: () => {
    onPick.mockClear()
  },
  render: () => <MentionEditor />,
  play: async ({canvas, userEvent}) => {
    const editor = canvas.getByRole('textbox', {name: 'Message'})
    await userEvent.click(editor)
    await userEvent.keyboard('@')
    const list = await page().findByRole('listbox', {name: 'People'})
    await expect(editor).toHaveFocus()
    await expect(editor).toHaveAttribute('aria-expanded', 'true')
    await expect(editor).toHaveAttribute('aria-controls', list.id)

    await userEvent.keyboard('{ArrowDown}')
    const grace = page().getByRole('option', {name: 'Grace'})
    await expect(editor).toHaveAttribute('aria-activedescendant', grace.id)
    await expect(editor).toHaveFocus()

    // A press on an option picks it and leaves focus in the editor.
    await userEvent.click(page().getByRole('option', {name: 'Linus'}))
    await expect(onPick).toHaveBeenCalledWith('Linus')
    await waitFor(() => expect(page().queryByRole('listbox')).not.toBeInTheDocument())
    await expect(editor).toHaveFocus()
    await expect(editor).toHaveAttribute('aria-expanded', 'false')
    await expect(editor).not.toHaveAttribute('aria-activedescendant')
  },
}

export const EmptyList: Story = {
  render: () => (
    <Listbox.Root
      id="empty-list"
      open
      anchor={() => new DOMRect(16, 16, 200, 24)}
      highlightedId={null}
      aria-label="Results"
    >
      <Listbox.Empty>No match</Listbox.Empty>
    </Listbox.Root>
  ),
  play: async () => {
    await expect(await page().findByText('No match')).toBeVisible()
  },
}
