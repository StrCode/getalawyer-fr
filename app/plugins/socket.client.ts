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
      withCredentials: true,
      transports: ['websocket'],
      auth: (cb) => {
        // Get token from Better Auth session
        // The session object contains the session ID (32 chars)
        // The full token with signature is sent automatically via cookies (withCredentials: true)
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
      
      // Update extraHeaders with the provided token
      socket.io.opts.extraHeaders = {
        Cookie: `__Secure-better-auth.session_token=${token}`
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
