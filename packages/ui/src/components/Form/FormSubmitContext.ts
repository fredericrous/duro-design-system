import {createContext, useContext} from 'react'

/**
 * How a `type="submit"` Button submits its Form where there is no DOM submit
 * event: on native, Form provides its validated submit here. The web Form
 * provides nothing; the browser's form submission does it.
 */
export const FormSubmitContext = createContext<(() => void) | null>(null)

export function useFormSubmit() {
  return useContext(FormSubmitContext)
}
