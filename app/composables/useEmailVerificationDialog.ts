export function useEmailVerificationDialog() {
  const open = useState('email-verification-dialog-open', () => false)

  function openDialog() {
    open.value = true
  }

  function closeDialog() {
    open.value = false
  }

  return {
    open,
    openDialog,
    closeDialog,
  }
}
