import {css} from 'react-strict-dom'

// The z-index scale. Values are unitless strings so `--duro-layer-*` exists
// for plain CSS; React Native takes a number, so a native overlay reads the
// numeric LAYERS map from `@duro-app/tokens/keys` instead.
//
// They only compete inside one stacking context. Dialog, Drawer, the popups
// and the toast region all portal into the ThemeProvider mount (`portal`),
// and this is the order they keep there.
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
  // A popup's click-catcher, under the popup itself.
  popupBackdrop: '1049',
  // Popups: Select, Listbox, Menu, Popover — above a modal they open from.
  popup: '1050',
  // The toast region: above popups and modals.
  toast: '1060',
  // The ThemeProvider portal mount that holds all of the above.
  portal: '1100',
})
