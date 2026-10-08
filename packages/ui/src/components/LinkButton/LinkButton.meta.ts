import type {ComponentMeta} from '../component-meta'

export const meta: ComponentMeta = {
  description:
    'Button-styled hyperlink. Renders an <a> tag, not a <button>. Use for navigation, not actions. onNavigate(href, event) hands a plain primary click to a client router (the app calls event.preventDefault(), then navigates); modified clicks keep the browser default.',
  whenToUse: [
    'Navigation that should look like a button (e.g., "Get started", "View all")',
    'Links to external pages with button styling',
  ],
  whenNotToUse: [
    'Triggering in-page actions — use Button',
    'Plain text links — use a styled <a> tag',
  ],
  relatedTo: [
    {
      component: 'Button',
      kind: 'contrast',
      relationship: 'Button for actions; LinkButton for navigation',
    },
  ],
  example: `<LinkButton href="/signup" variant="primary">
  Get started
</LinkButton>

<LinkButton href="https://docs.example.com" target="_blank" variant="secondary">
  Read the docs
</LinkButton>`,
}
