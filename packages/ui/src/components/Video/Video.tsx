import type {Ref} from 'react'

interface VideoProps {
  /** The video's URL: a file URL, or an object URL an app made from bytes it fetched. */
  src: string
  /** Its MIME type (`video/mp4`, `video/webm`), so the browser picks a playable source. */
  type: string
  /** The accessible name: what the video shows (its file name, a caption). */
  label: string
  /** The browser's own play, seek and volume controls. Default: true. */
  controls?: boolean
  /** How much to fetch before play: metadata (duration, first frame) by default. */
  preload?: 'none' | 'metadata' | 'auto'
  /** The video element, e.g. to pause it from elsewhere. */
  ref?: Ref<HTMLVideoElement>
}

// Relative sizes only: the video is as wide as its container, never wider, at its own ratio.
const VIDEO_STYLE = {display: 'block', maxWidth: '100%', height: 'auto'} as const

/**
 * Video — a video file with the browser's controls. react-strict-dom has no video element, so
 * this is a raw <video> (as Icon is a raw <svg>). Web only: on native, host your own player.
 */
export function Video({src, type, label, controls = true, preload = 'metadata', ref}: VideoProps) {
  return (
    <video ref={ref} controls={controls} preload={preload} aria-label={label} style={VIDEO_STYLE}>
      <source src={src} type={type} />
    </video>
  )
}
