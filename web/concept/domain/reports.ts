/** A report includes only documents referenced by its notes, never an unsaved edit. */
export function exportDocuments(
  notes: { documentId: string }[],
  saved: Record<string, string>,
  current: { id: string; text: string }
): Record<string, string> {
  return Object.fromEntries(notes.map(note => {
    const text = saved[note.documentId] ?? (note.documentId === current.id ? current.text : undefined)
    if (text === undefined) throw new Error('A note is missing its source document')
    return [note.documentId, text]
  }))
}
