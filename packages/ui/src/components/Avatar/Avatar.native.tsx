import {useState} from 'react'
import {html} from 'react-strict-dom'
import {SvgXml} from 'react-native-svg'
import {styles} from './styles.css'
import type {AvatarProps} from './types'

export type {AvatarProps, AvatarShape, AvatarSize} from './types'

/**
 * Native Avatar: the web's precedence (src until it fails, svg, initials, blank). The svg document
 * is drawn with react-native-svg's SvgXml, since RSD has no `svg`.
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
      <html.div role="img" aria-label={alt} style={frame}>
        <SvgXml xml={svg} width="100%" height="100%" />
      </html.div>
    )
  }
  return (
    <html.div role="img" aria-label={alt} style={frame}>
      {initials ? <html.span aria-hidden={true}>{initials}</html.span> : null}
    </html.div>
  )
}
