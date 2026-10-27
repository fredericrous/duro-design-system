import {useState} from 'react'
import {html} from 'react-strict-dom'
import {styles} from './styles.css'
import type {AvatarProps} from './types'

export type {AvatarProps, AvatarShape, AvatarSize} from './types'

/**
 * A person or entity as a picture, else an app-generated SVG, else their initials, else a neutral
 * blank. Each carries `alt` as the accessible name.
 */
export function Avatar({src, svg, alt, initials, size = 'md', shape = 'circle'}: AvatarProps) {
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
  if (svg !== undefined) {
    return (
      <html.div style={frame}>
        <html.img
          src={`data:image/svg+xml,${encodeURIComponent(svg)}`}
          alt={alt}
          style={styles.image}
        />
      </html.div>
    )
  }
  return (
    <html.div role="img" aria-label={alt} style={frame}>
      {initials ? <html.span aria-hidden={true}>{initials}</html.span> : null}
    </html.div>
  )
}
