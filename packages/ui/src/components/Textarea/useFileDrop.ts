import {useEffect, useState, type RefObject} from 'react'

const carriesFiles = (event: DragEvent) =>
  Array.from(event.dataTransfer?.types ?? []).includes('Files')

/**
 * Files dropped on the field go to `onFiles`, and `over` says files are
 * being dragged over it (for the drop ring). A listener on the element:
 * react-strict-dom passes no drag events through. Text drags stay the
 * browser's.
 */
export function useFileDrop(
  ref: RefObject<HTMLTextAreaElement | null>,
  onFiles: ((files: readonly File[]) => void) | undefined,
): boolean {
  const [over, setOver] = useState(false)
  useEffect(() => {
    const field = ref.current
    if (!field || !onFiles) return
    const enter = (event: DragEvent) => {
      if (!carriesFiles(event)) return
      // Claimed, or the browser opens the file instead of dropping it here.
      event.preventDefault()
      setOver(true)
    }
    const leave = () => setOver(false)
    const drop = (event: DragEvent) => {
      if (!carriesFiles(event)) return
      event.preventDefault()
      setOver(false)
      const files = Array.from(event.dataTransfer?.files ?? [])
      if (files.length > 0) onFiles(files)
    }
    field.addEventListener('dragenter', enter)
    field.addEventListener('dragover', enter)
    field.addEventListener('dragleave', leave)
    field.addEventListener('drop', drop)
    return () => {
      field.removeEventListener('dragenter', enter)
      field.removeEventListener('dragover', enter)
      field.removeEventListener('dragleave', leave)
      field.removeEventListener('drop', drop)
    }
  }, [onFiles, ref])
  return over
}
