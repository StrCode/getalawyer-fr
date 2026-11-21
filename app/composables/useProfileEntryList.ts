/**
 * The open-and-close state every list on the profile shares (experience,
 * education, licences, skills, articles): the dialog that adds or edits one
 * entry, and the question asked before one is removed. The form itself belongs
 * to the section; `seed` puts it back to an entry's values, or to blanks.
 */
export function useProfileEntryList<TItem extends { id: string }>(options: {
  seed: (item: TItem | null) => void
  remove: (id: string) => Promise<void>
}) {
  const dialogOpen = ref(false)
  const editingId = ref<string | null>(null)
  const deleteOpen = ref(false)
  const deleteId = ref<string | null>(null)

  function openCreate() {
    editingId.value = null
    options.seed(null)
    dialogOpen.value = true
  }

  function openEdit(item: TItem) {
    editingId.value = item.id
    options.seed(item)
    dialogOpen.value = true
  }

  function openDelete(id: string) {
    deleteId.value = id
    deleteOpen.value = true
  }

  async function confirmDelete() {
    if (!deleteId.value) return
    try {
      await options.remove(deleteId.value)
      deleteOpen.value = false
      deleteId.value = null
    }
    catch {
      // the page shows the message; the question stays open to try again
    }
  }

  return { dialogOpen, editingId, deleteOpen, deleteId, openCreate, openEdit, openDelete, confirmDelete }
}
