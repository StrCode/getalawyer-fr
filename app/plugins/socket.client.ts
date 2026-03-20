import { io, type Socket } from 'socket.io-client'
import type { ClientToServerEvents, ServerToClientEvents } from '~/types/messaging'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const { session } = useAuth()
  
  let socketInstance: Socket<ServerToClientEvents, ClientToServerEvents> | null = null

  const createSocket = () => {
    if (socketInstance) return socketInstance

    const apiUrl = config.public.apiUrl as string

    socketInstance = io(apiUrl, {
      autoConnect: false,
      withCredentials: true, // Critical: sends cookies cross-origin
      transports: ['websocket', 'polling'], // Try polling first for cookie handshake
      auth: (cb) => {
        // Send token in auth for backend fallback
        const token = session.value?.session?.token || ''
        cb({ token })
      }
    })

    socketInstance.on('connect', () => {
      console.log('[Socket] Connected:', socketInstance?.id)
    })

    socketInstance.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason)
    })

    socketInstance.on('connect_error', (error) => {
      console.error('[Socket] Connection error:', error.message)
    })

    return socketInstance
  }

  const connectSocket = (token?: string) => {
    const socket = createSocket()

    if (token) {
      // Update auth callback to use provided token
      socket.auth = (cb: (data: { token: string }) => void) => {
        cb({ token })
      }
    }

    if (socket.connected) {
      socket.disconnect()
    }

    socket.connect()
  }

  const disconnectSocket = () => {
    if (socketInstance?.connected) {
      socketInstance.disconnect()
    }
  }

  return {
    provide: {
      get socket() {
        return createSocket()
      },
      connectSocket,
      disconnectSocket
    }
  }
})
