/** The slice of an <input type=file> the picker logic touches. */
export interface FileInputLike {
  files: ArrayLike<File> | null
  value: string
  click: () => void
}

/** Open the native file picker. */
export function openPicker(input: Pick<FileInputLike, 'click'> | null) {
  input?.click()
}

/**
 * Hand the chosen files to `onSelect`, then reset the input so picking the
 * same file again still fires a change event.
 */
export function takeFiles(input: FileInputLike, onSelect: (files: File[]) => void) {
  const files = input.files ? Array.from(input.files) : []
  input.value = ''
  if (files.length > 0) onSelect(files)
}
