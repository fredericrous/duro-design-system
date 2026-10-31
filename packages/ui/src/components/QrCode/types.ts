import type {Length} from '../../shared/length'

export interface QrCodeProps {
  /** The text the code carries: a URL, a pairing link. */
  value: string
  /** What the code is for, read by assistive tech in place of the image. */
  label: string
  /** The widest the code draws (a size token key, e.g. `"qrCode"`); it still shrinks with a narrower container. Omitted, it is as wide as its container. */
  size?: Length
}
