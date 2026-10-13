import type {ComponentMeta} from '../component-meta'

export const meta: ComponentMeta = {
  description:
    'A QR code for another device to scan: dark modules on a fixed light square, as wide as its container, announced by its label as one image. The same on web and native.',
  whenToUse: [
    'Pairing or sign-in by scanning from a second device',
    'Handing a URL or a short secret to a phone camera',
  ],
  whenNotToUse: [
    'Decoration or branding: a QR code is a machine-readable payload, not an illustration',
    'The only way to reach something: also give the text or a link beside it',
  ],
  example: `<Stack gap="sm">
  <QrCode value="https://example.com/pair?key=abc" label="Scan to sign in on this device" />
  <Text>Scan with a signed-in phone</Text>
</Stack>`,
}
