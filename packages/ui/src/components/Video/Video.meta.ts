import type {ComponentMeta} from '../component-meta'

export const meta: ComponentMeta = {
  description:
    "A video file with the browser's own controls: a <video> as wide as its container (never wider, at its own ratio) with one source of the given MIME type, named for assistive tech by label. preload is metadata by default (duration and first frame, not the whole file). Web only: on React Native, host your own player (expo-video) behind a .native.tsx leaf.",
  whenToUse: [
    'A video file the person opened: a screen recording, a clip in a file viewer',
    'A video an app turned into an object URL from bytes it fetched',
  ],
  whenNotToUse: [
    'A decorative or autoplaying background — Duro has none',
    'An image — use an img or Prose',
  ],
  example: `<Video src={objectUrl} type="video/mp4" label={fileName} />`,
}
