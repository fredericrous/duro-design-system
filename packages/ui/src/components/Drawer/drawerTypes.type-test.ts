import {createElement} from 'react'
import {Drawer, type SideSnapPoint, type SnapPoint} from './Drawer'

const bottomPoints: SnapPoint[] = ['medium', 'large']
const sidePoints: SideSnapPoint[] = ['compact', 'expanded']

createElement(Drawer.Root, {children: null, anchor: 'bottom', snapPoints: bottomPoints})
createElement(Drawer.Root, {children: null, anchor: 'right', snapPoints: sidePoints})
createElement(Drawer.Root, {
  children: null,
  anchor: 'left',
  snapPoints: sidePoints,
  defaultSnapPoint: 'expanded',
})
createElement(Drawer.Root, {children: null, snapPoints: sidePoints})

// @ts-expect-error a right drawer takes side detents, not bottom ones
createElement(Drawer.Root, {children: null, anchor: 'right', snapPoints: ['medium']})

// @ts-expect-error a bottom drawer takes bottom detents, not side ones
createElement(Drawer.Root, {children: null, anchor: 'bottom', snapPoints: ['compact']})
