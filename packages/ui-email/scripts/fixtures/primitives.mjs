// Primitive fixture for the email equality harness (render-consumer-emails.mjs)
// and the packed-artifact smoke test (smoke-packed.mjs).
//
// Plain ESM with React.createElement — no JSX, no TypeScript — so it renders in
// bare Node without a loader. It exercises every ui-email primitive, each
// variant, and each style override, so a change to any emitted style shows up
// as an HTML difference.

import * as React from 'react'
import {
  Button,
  EmailShell,
  Heading,
  Hr,
  Img,
  Link,
  Preview,
  RawLink,
  Section,
  Text,
} from '@duro-app/ui-email'

const h = React.createElement
const href = 'https://example.test/path?x=1'

export function primitives() {
  return h(
    EmailShell,
    {preview: 'Fixture preview text'},
    h(Heading, null, 'Heading h1'),
    h(Heading, {as: 'h2'}, 'Heading h2'),
    h(Text, null, 'Body text'),
    h(Text, {variant: 'small'}, 'Small text'),
    h(Text, {variant: 'footer'}, 'Footer text'),
    h(Text, {style: {textAlign: 'center'}}, 'Body text, style override'),
    h(Button, {href}, 'Button centre'),
    h(Button, {href, align: 'left'}, 'Button left'),
    h(Button, {href, align: 'right'}, 'Button right'),
    h(Hr),
    h(Section, null, h(Text, null, 'Inside a section')),
    h(Section, {style: {textAlign: 'right'}}, h(Text, null, 'Section, style override')),
    h(Text, null, 'Before ', h(Link, {href}, 'a link'), ' after'),
    h(Text, null, h(Link, {href, style: {textDecoration: 'none'}}, 'Link, style override')),
    h(Text, null, h(RawLink, {href}, 'Raw link')),
    h(Img, {src: 'https://example.test/i.png', width: '1', height: '1', alt: ''}),
  )
}

export function shellWithoutPreview() {
  return h(EmailShell, null, h(Preview, null, 'Bare preview'), h(Text, null, 'No preview prop'))
}

export const fixtures = {primitives, shellWithoutPreview}
