// Compile-only checks that 5.5's additions are on the package root, where a
// consumer imports them. `pnpm typecheck` fails if one is dropped from
// index.ts or changes shape. Never imported at runtime.

import type {ButtonSize, ControlSize, ToggleSize, useInModal} from '../index'

type Same<T, U> = [T] extends [U] ? ([U] extends [T] ? true : false) : false

// A floating surface that is not a Popover picks its layer with it.
export const useInModalIsBoolean: Same<ReturnType<typeof useInModal>, boolean> = true
export const useInModalTakesNothing: Same<Parameters<typeof useInModal>, []> = true

// The shared size, and the two sizes that alias it.
export const controlSizes: Same<ControlSize, 'default' | 'small'> = true
export const buttonSizeIsControlSize: Same<ButtonSize, ControlSize> = true
export const toggleSizeIsControlSize: Same<ToggleSize, ControlSize> = true
