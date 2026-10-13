export interface QrCodeProps {
  /** The text the code carries: a URL, a pairing link. */
  value: string
  /** What the code is for, read by assistive tech in place of the image. */
  label: string
}
