---
id: ADR-0002
status: accepted
decisions:
  - key: components.link-navigation
    choice: Every link part renders a real `<a href>` on the web and takes an optional `onNavigate(href, event)`, called only for a plain primary click; on native it renders no `href` and follows the press through `followLink` (onNavigate, then `Linking.openURL` unless prevented); the package depends on no router
    first: true
    reason: A real link keeps what the browser does for a link (new tab, copy link) and an app's router stays the app's choice
---

# 0002 — link parts navigate through onNavigate, plain clicks only

## Context

The docs browser (kb-vision, plan
`docs/plans/2026-10-08-kb-vision-docs-browser-redesign.md`) needs `Breadcrumb`,
`TableOfContents`, `PageNav` and a `Tree` whose items are pages. Each of them
is a link. kb-vision routes with React Router; other consumers use another
router or none. `TextLink` and `LinkButton` already rendered `<a href>` and
could only do a full page load.

Two common shapes do not fit. A `component`/`as` prop that renders the app's
`Link` gives the design system no control over the element and breaks the
`html.*` rule. An import of a router makes every consumer depend on it.

## Decision

Every link part — `TextLink`, `LinkButton`, `Breadcrumb.Item`,
`TableOfContents.Item`, `PageNav.Prev` / `Next`, and `Tree.Item` with `href` —
renders a real `<a href>` and takes an optional `onNavigate(href, event)`.

The part calls `onNavigate` only for a plain primary click: `event.button` is
0, no `metaKey`, `ctrlKey`, `shiftKey` or `altKey`, the default is not
already prevented, and the link has no `target`. For every other click it does
nothing, so the browser default runs (new tab, new window, download).

The part never calls `preventDefault` itself. The app does it in
`onNavigate`, then calls its router:

```tsx
const go: OnNavigate = (href, event) => {
  event.preventDefault()
  navigate(href)
}
```

The helper is `packages/ui/src/shared/navigate.ts`; `OnNavigate` and
`LinkClickEvent` are exported types.

## Consequences

- No router is a dependency or a peer of `@duro-app/ui`.
- Without `onNavigate` a link part does a normal page load, as before.
- An app that wants a link to skip its router leaves the event alone in
  `onNavigate`.
- `Tree.Item` with `href` renders its row as a link with `tabindex="-1"`: the
  treeitem keeps the single tab stop, and Enter or Space clicks the link.
- Each part's stories check a plain click (called) and a meta-click (not
  called, default not prevented).

## Addendum — native (2026-10-15)

react-strict-dom 0.0.55 replaces the press handler of an `html.a` that has an
`href` with a dev-only "href handling is not implemented" stub
(`dist/native/index.js:3094-3100`, upstream
[react/react-strict-dom#58](https://github.com/react/react-strict-dom/issues/58)).
A link part on native therefore renders no `href`:

- `TextLink` is an `html.a` without `href` (an inline `Text`, `role="link"`).
  `Tree.Item` with `href` is a row with `role="link"`. `Menu.LinkItem` is a
  `Pressable` with the link role.
- A press goes through `followLink` (`packages/ui/src/shared/followLink.native.ts`).
  It builds a `LinkClickEvent` for a primary press with no modifier, calls
  `onNavigate`, and opens the URL with the system (`Linking.openURL`) unless
  `onNavigate` called `preventDefault()`. A link with a `target` skips
  `onNavigate`, as on the web.
- An in-app route needs `onNavigate` on native. Without it, a relative href
  goes to `Linking.openURL`, which rejects it.
- `scripts/check-native-graph.mjs` refuses an `html.a` with `href` in the
  native graph. The rule is removed once an RSD release forwards the press of
  an `html.a` with `href`.
