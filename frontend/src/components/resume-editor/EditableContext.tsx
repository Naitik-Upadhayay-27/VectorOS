import { createContext, useContext } from 'react'

/**
 * When editMode is true, every EditableText becomes clickable + editable.
 * onSave is called with the new value when the user blurs or presses Enter.
 */
interface EditableContextValue {
  editMode: boolean
}

export const EditableContext = createContext<EditableContextValue>({ editMode: false })

export function useEditableContext() {
  return useContext(EditableContext)
}
