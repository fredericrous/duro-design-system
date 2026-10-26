import {useState} from 'react'
import {html} from 'react-strict-dom'
import {styles} from './styles.css'

export type AvatarSize = 'sm' | 'md' | 'lg'
export type AvatarShape = 'circle' | 'square'

export interface AvatarProps {
  /** Image URL. Without it, or when it fails to load, the initials show. */
  src?: string
  /** The accessible name: who or what this avatar stands for. Never empty. */
  alt: string
  /** Shown when there is no image; one or two characters. */
  initials?: string
  /** sm 28, md 40, lg 48 (the controlSm, thumbSm and iconXxl size tokens). Default md. */
  size?: AvatarSize
  /** Default circle. */
  shape?: AvatarShape
}

/**
 * A person or entity as a picture, else their initials, else a neutral blank. The image, the
 * initials and the blank all carry `alt` as the accessible name.
 */
export function Avatar({src, alt, initials, size = 'md', shape = 'circle'}: AvatarProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const showImage = src !== undefined && src !== failedSrc
  const frame = [styles.base, styles[size], styles[shape]]

  if (showImage) {
    return (
      <html.div style={frame}>
        <html.img src={src} alt={alt} onError={() => setFailedSrc(src)} style={styles.image} />
      </html.div>
    )
  }
  return (
    <html.div role="img" aria-label={alt} style={frame}>
      {initials ? <html.span aria-hidden={true}>{initials}</html.span> : null}
    </html.div>
  )
}
