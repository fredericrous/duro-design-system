export {EmailShell, Heading, Text, Button, Hr, Link, Section, type TextVariant} from './components'
export {palette, space, radius, font, cls, darkModeCss, type EmailRoles} from './theme'

// Re-export the unstyled primitives apps still need (tracking pixel, raw
// preview/links) so an email only imports from one place.
export {Img, Preview, Link as RawLink} from '@react-email/components'
