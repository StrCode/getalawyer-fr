import { io, type Socket } from 'socket.io-client'
import type { ClientToServerEvents, ServerToClientEvents } from '~/types/messaging'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const authClient = useAuthClient()
  
  let socketInstance: Socket<ServerToClientEvents, ClientToServerEvents> | null = null

  const createSocket = () => {
    if (socketInstance) return socketInstance

    const apiUrl = config.public.apiUrl as string

    socketInstance = io(apiUrl, {
      autoConnect: false,
      withCredentials: true,
      transports: ['websocket', 'polling'],
      auth: async (cb) => {
        // Get session from Better Auth using authClient
        const session = await authClient.getSession()
        // Extract token from the correct path: session.data.session.token
        const token = session?.data?.session?.token || ''
        
        cb({ token })
      }
    })

    socketInstance.on('connect_error', (error) => {
      console.error('[WS] client connect_error', error.message)
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
