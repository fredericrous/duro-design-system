# @duro-app/ui

Duro's components, written with [react-strict-dom](https://github.com/facebook/react-strict-dom):
one source for the web and for React Native. Component docs, props and
recipes: `npx @duro-app/cli <Name>`, or the repository's `CLAUDE.md`.

```sh
pnpm add @duro-app/ui @duro-app/tokens react-strict-dom react-hook-form
```

## React Native

Metro resolves the package's `react-native` export condition to
`src/index.native.ts`, a barrel of the components that have a native
variant (`npx @duro-app/cli <Name>` says `native: true`); `@duro-app/ui/form`
resolves to `src/form.native.ts`. babel-preset-expo compiles the source.

**Peers.** Metro does not tree-shake, so on native every one of these is
required, though npm lists them as optional (they are the web build's
optional peers):

| Peer                                                           | For                                                     |
| -------------------------------------------------------------- | ------------------------------------------------------- |
| `react-native` ≥ 0.81                                          | the platform                                            |
| `react-native-gesture-handler` ^2.28                           | sheet drags, Toast swipe                                |
| `react-native-reanimated` ≥ 4.1, `react-native-worklets` ≥ 0.5 | gestures and Spinner on the UI thread                   |
| `react-native-safe-area-context` ^5.6                          | insets (mount its `SafeAreaProvider`; expo-router does) |
| `react-native-svg` ^15.12                                      | Icon and the glyphs                                     |
| `react-hook-form` ^7.55                                        | Field binding (a required peer on both platforms)       |
| `@hookform/resolvers` ^5, `effect` ^3                          | only for `@duro-app/ui/form`                            |

**One copy of each.** Resolve `react`, `react-native`, the native peers,
`react-strict-dom`, `react-hook-form`, `@hookform/resolvers`, `effect` and
`@duro-app/*` from the app, so the bundle has one React renderer and one
react-strict-dom. With a linked or workspace copy of Duro, a Metro
`resolveRequest` that resolves those names from the app's `package.json`
does it; `examples/native/metro.config.mjs` in this repository is one.

**What differs on native.**

- Dialog, Drawer, Menu, Popover and the Select and Combobox sheets render in
  an RN `Modal`; Toast draws through a portal host. Mount `PortalHost` inside a
  natively presented route so toasts draw above it.
- Select and Combobox open a bottom sheet; Tooltip draws nothing and gives its
  text to the trigger as an accessibility hint.
- A `type="submit"` Button inside `Form` submits it (there is no DOM submit
  event).
- There are no arrow keys: keyboard navigation is the web's; native gets the
  screen-reader roles and states.
