import type {ComponentMeta} from '../component-meta'

export const meta: ComponentMeta = {
  description:
    'A date or time in running text as a <time> element: the visible text comes from you, the exact instant goes in dateTime (an ISO string) and title. relative(date, {now, locale}) gives the text on Intl.RelativeTimeFormat ("3 days ago", "il y a 3 jours"); now is required, so the server and the client render the same string. Web only.',
  whenToUse: [
    'When something happened: "Updated 3 days ago", a commit date, a last-indexed time',
    'Any date shown as relative text whose exact value should stay available',
  ],
  whenNotToUse: [
    'A date the person edits — use an Input',
    'A live countdown or a clock — Time renders once from the now you pass',
  ],
  example: `<Time dateTime={doc.lastCommitAt} title={formatFull(doc.lastCommitAt, locale)}>
  {relative(doc.lastCommitAt, {now: loaderNow, locale})}
</Time>`,
}
