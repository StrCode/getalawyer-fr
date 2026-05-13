const authModal = ref(false)
const authTab = ref<'signin' | 'signup'>('signin')

export const useLandingModal = () => {
  const openModal = (tab: 'signin' | 'signup' = 'signin') => {
    authTab.value = tab
    authModal.value = true
  }
  const closeModal = () => { authModal.value = false }
  return { authModal, authTab, openModal, closeModal }
}
