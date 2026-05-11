// Side-effect-only module: registers `@duro-app/ui`'s additions to
// TanStack's `ColumnMeta` so consumers can write
//   meta: { stackLabel: 'X', isActions: true }
// on column defs and have it type-check, regardless of whether they
// import from Table/FromTanstack in that particular file.
//
// `index.ts` re-exports this module so the augmentation registers as
// soon as any file in the consumer's TS program imports from
// `@duro-app/ui`. Keeping the augmentation in a standalone file (instead
// of co-located with `FromTanstack.tsx`) also keeps it from being
// tree-shaken out of the published types.

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends unknown, TValue> {
    /** Override the stack-mode label when columnDef.header is JSX (icon + text, etc). */
    stackLabel?: string
    /**
     * Marks this column as the actions column. In stack mode the cells
     * render as a full-width footer instead of a labelled key/value row.
     */
    isActions?: boolean
  }
}

// Empty export so this file is treated as a module by TS and ts-up/vite.
export {}
