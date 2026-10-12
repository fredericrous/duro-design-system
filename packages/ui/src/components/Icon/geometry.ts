import type {IconName} from './types'

/**
 * Icon glyphs as renderer-independent geometry on a 24-unit grid (plan N0,
 * Decision 9): the web draws them as SVG elements, native with the renderer
 * the icon benchmark picks. Generated once from the JSX tables Icon.tsx held
 * through 5.11; edit the data here.
 *
 * A `stroke` glyph is drawn with a 2-unit stroke, round caps and joins, and no
 * fill. A `fill` glyph is filled, with even-odd cutouts where `fillRule` says;
 * a shape inside it may carry its own stroke (`lock-filled`'s shackle).
 */
/** `currentColor` is the icon's colour (the text colour on the web, `color` on native). */
export type Paint = 'currentColor' | 'none'

export type Shape =
  | {
      tag: 'path'
      d: string
      fillRule?: 'evenodd'
      /** Paint override for this shape: the icon's colour, or none. */
      fill?: Paint
      stroke?: Paint
      strokeWidth?: number
      strokeLinecap?: 'round'
    }
  | {tag: 'circle'; cx: number; cy: number; r: number}
  | {tag: 'ellipse'; cx: number; cy: number; rx: number; ry: number}
  | {tag: 'line'; x1: number; y1: number; x2: number; y2: number}
  | {tag: 'rect'; x: number; y: number; width: number; height: number; rx?: number; ry?: number}
  | {tag: 'polyline'; points: string}
  | {tag: 'polygon'; points: string}

export interface Glyph {
  readonly style: 'stroke' | 'fill'
  readonly shapes: readonly Shape[]
}

export const GLYPHS: Record<IconName, Glyph> = {
  'x-circle': {
    style: 'stroke',
    shapes: [
      {tag: 'circle', cx: 12, cy: 12, r: 10},
      {tag: 'line', x1: 15, y1: 9, x2: 9, y2: 15},
      {tag: 'line', x1: 9, y1: 9, x2: 15, y2: 15},
    ],
  },
  'check-circle': {
    style: 'stroke',
    shapes: [
      {tag: 'circle', cx: 12, cy: 12, r: 10},
      {tag: 'polyline', points: '16 10 11 15 8 12'},
    ],
  },
  'check-done': {
    style: 'stroke',
    shapes: [
      {tag: 'path', d: 'M22 11.08V12a10 10 0 1 1-5.93-9.14'},
      {tag: 'polyline', points: '22 4 12 14.01 9 11.01'},
    ],
  },
  clock: {
    style: 'stroke',
    shapes: [
      {tag: 'circle', cx: 12, cy: 12, r: 10},
      {tag: 'polyline', points: '12 6 12 12 16 14'},
    ],
  },
  forbidden: {
    style: 'stroke',
    shapes: [
      {tag: 'circle', cx: 12, cy: 12, r: 10},
      {tag: 'line', x1: 4.93, y1: 4.93, x2: 19.07, y2: 19.07},
    ],
  },
  'info-circle': {
    style: 'stroke',
    shapes: [
      {tag: 'circle', cx: 12, cy: 12, r: 10},
      {tag: 'line', x1: 12, y1: 16, x2: 12, y2: 12},
      {tag: 'line', x1: 12, y1: 8, x2: 12.01, y2: 8},
    ],
  },
  'alert-triangle': {
    style: 'stroke',
    shapes: [
      {
        tag: 'path',
        d: 'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z',
      },
      {tag: 'line', x1: 12, y1: 9, x2: 12, y2: 13},
      {tag: 'line', x1: 12, y1: 17, x2: 12.01, y2: 17},
    ],
  },
  shield: {
    style: 'stroke',
    shapes: [{tag: 'path', d: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'}],
  },
  lock: {
    style: 'stroke',
    shapes: [
      {tag: 'rect', x: 3, y: 11, width: 18, height: 11, rx: 2, ry: 2},
      {tag: 'path', d: 'M7 11V7a5 5 0 0 1 10 0v4'},
    ],
  },
  key: {
    style: 'stroke',
    shapes: [
      {
        tag: 'path',
        d: 'M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.78 7.78 5.5 5.5 0 0 1 7.78-7.78zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4',
      },
    ],
  },
  map: {
    style: 'stroke',
    shapes: [
      {tag: 'polygon', points: '1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6'},
      {tag: 'line', x1: 8, y1: 2, x2: 8, y2: 18},
      {tag: 'line', x1: 16, y1: 6, x2: 16, y2: 22},
    ],
  },
  layers: {
    style: 'stroke',
    shapes: [
      {tag: 'polygon', points: '12 2 2 7 12 12 22 7 12 2'},
      {tag: 'polyline', points: '2 17 12 22 22 17'},
      {tag: 'polyline', points: '2 12 12 17 22 12'},
    ],
  },
  repeat: {
    style: 'stroke',
    shapes: [
      {tag: 'polyline', points: '17 1 21 5 17 9'},
      {tag: 'path', d: 'M3 11V9a4 4 0 0 1 4-4h14'},
      {tag: 'polyline', points: '7 23 3 19 7 15'},
      {tag: 'path', d: 'M21 13v2a4 4 0 0 1-4 4H3'},
    ],
  },
  database: {
    style: 'stroke',
    shapes: [
      {tag: 'ellipse', cx: 12, cy: 5, rx: 9, ry: 3},
      {tag: 'path', d: 'M21 12c0 1.66-4 3-9 3s-9-1.34-9-3'},
      {tag: 'path', d: 'M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5'},
    ],
  },
  'shield-check': {
    style: 'stroke',
    shapes: [
      {tag: 'path', d: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'},
      {tag: 'polyline', points: '9 12 11 14 15 10'},
    ],
  },
  route: {
    style: 'stroke',
    shapes: [
      {tag: 'circle', cx: 6, cy: 19, r: 3},
      {tag: 'path', d: 'M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15'},
      {tag: 'circle', cx: 18, cy: 5, r: 3},
    ],
  },
  'git-branch': {
    style: 'stroke',
    shapes: [
      {tag: 'line', x1: 6, y1: 3, x2: 6, y2: 15},
      {tag: 'circle', cx: 18, cy: 6, r: 3},
      {tag: 'circle', cx: 6, cy: 18, r: 3},
      {tag: 'path', d: 'M18 9a9 9 0 0 1-9 9'},
    ],
  },
  menu: {
    style: 'stroke',
    shapes: [
      {tag: 'line', x1: 3, y1: 6, x2: 21, y2: 6},
      {tag: 'line', x1: 3, y1: 12, x2: 21, y2: 12},
      {tag: 'line', x1: 3, y1: 18, x2: 21, y2: 18},
    ],
  },
  server: {
    style: 'stroke',
    shapes: [
      {tag: 'rect', x: 2, y: 2, width: 20, height: 8, rx: 2, ry: 2},
      {tag: 'rect', x: 2, y: 14, width: 20, height: 8, rx: 2, ry: 2},
      {tag: 'line', x1: 6, y1: 6, x2: 6.01, y2: 6},
      {tag: 'line', x1: 6, y1: 18, x2: 6.01, y2: 18},
    ],
  },
  'hard-drive': {
    style: 'stroke',
    shapes: [
      {tag: 'line', x1: 22, y1: 12, x2: 2, y2: 12},
      {
        tag: 'path',
        d: 'M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z',
      },
      {tag: 'line', x1: 6, y1: 16, x2: 6.01, y2: 16},
      {tag: 'line', x1: 10, y1: 16, x2: 10.01, y2: 16},
    ],
  },
  box: {
    style: 'stroke',
    shapes: [
      {
        tag: 'path',
        d: 'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z',
      },
      {tag: 'polyline', points: '3.27 6.96 12 12.01 20.73 6.96'},
      {tag: 'line', x1: 12, y1: 22.08, x2: 12, y2: 12},
    ],
  },
  image: {
    style: 'stroke',
    shapes: [
      {tag: 'rect', x: 3, y: 3, width: 18, height: 18, rx: 2, ry: 2},
      {tag: 'circle', cx: 8.5, cy: 8.5, r: 1.5},
      {tag: 'polyline', points: '21 15 16 10 5 21'},
    ],
  },
  tag: {
    style: 'stroke',
    shapes: [
      {
        tag: 'path',
        d: 'M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z',
      },
      {tag: 'line', x1: 7, y1: 7, x2: 7.01, y2: 7},
    ],
  },
  'pie-chart': {
    style: 'stroke',
    shapes: [
      {tag: 'path', d: 'M21.21 15.89A10 10 0 1 1 8 2.83'},
      {tag: 'path', d: 'M22 12A10 10 0 0 0 12 2v10z'},
    ],
  },
  users: {
    style: 'stroke',
    shapes: [
      {tag: 'path', d: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2'},
      {tag: 'circle', cx: 9, cy: 7, r: 4},
      {tag: 'path', d: 'M23 21v-2a4 4 0 0 0-3-3.87'},
      {tag: 'path', d: 'M16 3.13a4 4 0 0 1 0 7.75'},
    ],
  },
  'user-plus': {
    style: 'stroke',
    shapes: [
      {tag: 'path', d: 'M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2'},
      {tag: 'circle', cx: 8.5, cy: 7, r: 4},
      {tag: 'line', x1: 20, y1: 8, x2: 20, y2: 14},
      {tag: 'line', x1: 23, y1: 11, x2: 17, y2: 11},
    ],
  },
  mail: {
    style: 'stroke',
    shapes: [
      {
        tag: 'path',
        d: 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z',
      },
      {tag: 'polyline', points: '22,6 12,13 2,6'},
    ],
  },
  'file-text': {
    style: 'stroke',
    shapes: [
      {tag: 'path', d: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z'},
      {tag: 'polyline', points: '14 2 14 8 20 8'},
      {tag: 'line', x1: 16, y1: 13, x2: 8, y2: 13},
      {tag: 'line', x1: 16, y1: 17, x2: 8, y2: 17},
      {tag: 'polyline', points: '10 9 9 9 8 9'},
    ],
  },
  plug: {
    style: 'stroke',
    shapes: [
      {tag: 'path', d: 'M12 22v-5'},
      {tag: 'path', d: 'M9 8V2'},
      {tag: 'path', d: 'M15 8V2'},
      {tag: 'path', d: 'M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z'},
    ],
  },
  pin: {
    style: 'stroke',
    shapes: [
      {tag: 'line', x1: 12, y1: 17, x2: 12, y2: 22},
      {
        tag: 'path',
        d: 'M9 10.76V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v6.76a2 2 0 0 0 .55 1.38l1.68 1.78A1 1 0 0 1 16.5 16h-9a1 1 0 0 1-.73-1.68l1.68-1.78A2 2 0 0 0 9 10.76z',
      },
    ],
  },
  search: {
    style: 'stroke',
    shapes: [
      {tag: 'circle', cx: 11, cy: 11, r: 8},
      {tag: 'line', x1: 21, y1: 21, x2: 16.65, y2: 16.65},
    ],
  },
  x: {
    style: 'stroke',
    shapes: [
      {tag: 'line', x1: 18, y1: 6, x2: 6, y2: 18},
      {tag: 'line', x1: 6, y1: 6, x2: 18, y2: 18},
    ],
  },
  mic: {
    style: 'stroke',
    shapes: [
      {tag: 'path', d: 'M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z'},
      {tag: 'path', d: 'M19 10v2a7 7 0 0 1-14 0v-2'},
      {tag: 'line', x1: 12, y1: 19, x2: 12, y2: 23},
      {tag: 'line', x1: 8, y1: 23, x2: 16, y2: 23},
    ],
  },
  sun: {
    style: 'stroke',
    shapes: [
      {tag: 'circle', cx: 12, cy: 12, r: 5},
      {tag: 'line', x1: 12, y1: 1, x2: 12, y2: 3},
      {tag: 'line', x1: 12, y1: 21, x2: 12, y2: 23},
      {tag: 'line', x1: 4.22, y1: 4.22, x2: 5.64, y2: 5.64},
      {tag: 'line', x1: 18.36, y1: 18.36, x2: 19.78, y2: 19.78},
      {tag: 'line', x1: 1, y1: 12, x2: 3, y2: 12},
      {tag: 'line', x1: 21, y1: 12, x2: 23, y2: 12},
      {tag: 'line', x1: 4.22, y1: 19.78, x2: 5.64, y2: 18.36},
      {tag: 'line', x1: 18.36, y1: 5.64, x2: 19.78, y2: 4.22},
    ],
  },
  moon: {
    style: 'stroke',
    shapes: [{tag: 'path', d: 'M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z'}],
  },
  monitor: {
    style: 'stroke',
    shapes: [
      {tag: 'rect', x: 2, y: 3, width: 20, height: 14, rx: 2, ry: 2},
      {tag: 'line', x1: 8, y1: 21, x2: 16, y2: 21},
      {tag: 'line', x1: 12, y1: 17, x2: 12, y2: 21},
    ],
  },
  contrast: {
    style: 'stroke',
    shapes: [
      {tag: 'circle', cx: 12, cy: 12, r: 10},
      {tag: 'path', d: 'M12 2a10 10 0 0 1 0 20z', fill: 'currentColor', stroke: 'none'},
    ],
  },
  signal: {
    style: 'stroke',
    shapes: [
      {tag: 'line', x1: 4, y1: 20, x2: 4, y2: 16},
      {tag: 'line', x1: 9, y1: 20, x2: 9, y2: 12},
      {tag: 'line', x1: 14, y1: 20, x2: 14, y2: 8},
      {tag: 'line', x1: 19, y1: 20, x2: 19, y2: 4},
    ],
  },
  battery: {
    style: 'stroke',
    shapes: [
      {tag: 'rect', x: 2, y: 7, width: 17, height: 10, rx: 2},
      {tag: 'line', x1: 22, y1: 11, x2: 22, y2: 13},
    ],
  },
  video: {
    style: 'stroke',
    shapes: [
      {tag: 'rect', x: 2, y: 6, width: 14, height: 12, rx: 2},
      {tag: 'path', d: 'M16 10l6-3v10l-6-3z'},
    ],
  },
  music: {
    style: 'stroke',
    shapes: [
      {tag: 'path', d: 'M9 18V5l12-2v13'},
      {tag: 'circle', cx: 6, cy: 18, r: 3},
      {tag: 'circle', cx: 18, cy: 16, r: 3},
    ],
  },
  play: {
    style: 'stroke',
    shapes: [{tag: 'path', d: 'M6 4l14 8-14 8z'}],
  },
  pause: {
    style: 'stroke',
    shapes: [
      {tag: 'rect', x: 6, y: 4, width: 4, height: 16},
      {tag: 'rect', x: 14, y: 4, width: 4, height: 16},
    ],
  },
  'info-circle-filled': {
    style: 'fill',
    shapes: [
      {
        tag: 'path',
        fillRule: 'evenodd',
        d: 'M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm-.75 6a.75.75 0 1 1 1.5 0 .75.75 0 0 1-1.5 0zM11 11a1 1 0 1 1 2 0v5a1 1 0 1 1-2 0v-5z',
      },
    ],
  },
  'alert-triangle-filled': {
    style: 'fill',
    shapes: [
      {
        tag: 'path',
        fillRule: 'evenodd',
        d: 'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM11 10a1 1 0 1 1 2 0v3a1 1 0 1 1-2 0v-3zm.25 6a.75.75 0 1 1 1.5 0 .75.75 0 0 1-1.5 0z',
      },
    ],
  },
  'check-circle-filled': {
    style: 'fill',
    shapes: [
      {
        tag: 'path',
        fillRule: 'evenodd',
        d: 'M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.707 8.707a1 1 0 0 0-1.414-1.414L11 13.586l-2.293-2.293a1 1 0 0 0-1.414 1.414l3 3a1 1 0 0 0 1.414 0l5-5z',
      },
    ],
  },
  'x-circle-filled': {
    style: 'fill',
    shapes: [
      {
        tag: 'path',
        fillRule: 'evenodd',
        d: 'M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zM9.707 8.293a1 1 0 0 0-1.414 1.414L10.586 12l-2.293 2.293a1 1 0 1 0 1.414 1.414L12 13.414l2.293 2.293a1 1 0 0 0 1.414-1.414L13.414 12l2.293-2.293a1 1 0 0 0-1.414-1.414L12 10.586 9.707 8.293z',
      },
    ],
  },
  'shield-filled': {
    style: 'fill',
    shapes: [
      {
        tag: 'path',
        fillRule: 'evenodd',
        d: 'M12 1L3 5v7c0 6.5 8.5 10.5 9 10.73.5-.23 9-4.23 9-10.73V5l-9-4zm3.707 8.707a1 1 0 0 0-1.414-1.414L11 11.586l-1.293-1.293a1 1 0 0 0-1.414 1.414l2 2a1 1 0 0 0 1.414 0l4-4z',
      },
    ],
  },
  'lock-filled': {
    style: 'fill',
    shapes: [
      {
        tag: 'path',
        d: 'M7 11V7a5 5 0 0 1 10 0v4',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 2,
        strokeLinecap: 'round',
      },
      {tag: 'rect', x: 3, y: 11, width: 18, height: 11, rx: 2, ry: 2},
    ],
  },
}
