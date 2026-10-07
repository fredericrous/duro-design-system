import {css} from 'react-strict-dom'
import type {LayerToken} from '../keys'

// The z-index scale. Values are unitless strings so `--duro-layer-*` exists
// for plain CSS; React Native takes a number, so a native overlay reads the
// numeric LAYERS map from `@duro-app/tokens/keys` instead.
//
// They only compete inside one stacking context. Dialog, Drawer, the popups
// and the toast region all portal into the ThemeProvider mount (`portal`),
// and this is the order they keep there.
// StyleX types a var by its literal, so string values would type every layer
// as a string, which `zIndex` (a number) refuses. Typing the literals as CSS
// integers makes `zIndex: layers.popup` a number to TypeScript; the cast has
// no runtime effect (StyleX and the drift check read straight through it).
type LayerValue = ReturnType<typeof css.types.integer<number>>

export const layers = css.defineVars({
  // A focused or sticky part above its siblings (a joined group's focus ring,
  // a scrollbar, a sticky table header).
  raised: '1',
  // Floating chrome over the page: Tooltip, ActionBar.
  floating: '50',
  // A modal's backdrop.
  overlay: '1000',
  // A modal's panel (Dialog, Drawer).
  modal: '1001',
  // A Popover: above a modal it opens from, below the popups (a Select, a
  // Menu) and the Select click-catcher opened from inside it.
  popover: '1040',
  // A popup's click-catcher, under the popup itself.
  popupBackdrop: '1049',
  // Popups: Select, Listbox, Menu — above a modal or Popover they open from.
  popup: '1050',
  // The toast region: above popups and modals.
  toast: '1060',
  // The ThemeProvider portal mount that holds all of the above.
  portal: '1100',
} as unknown as Readonly<Record<LayerToken, LayerValue>>)
