import { createContext, useContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext'
import toast from 'react-hot-toast'

const SocketContext = createContext(null)

export const useSocket = () => {
    const context = useContext(SocketContext)
    return context
}

export function SocketProvider({ children }) {
    const [socket, setSocket] = useState(null)
    const { user } = useAuth()

    useEffect(() => {
        if (!user) {
            if (socket) {
                socket.disconnect()
                setSocket(null)
            }
            return
        }

        const token = localStorage.getItem('accessToken')
        if (!token) return

        const socketUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000'
        const newSocket = io(socketUrl, {
            auth: { token },
            transports: ['websocket', 'polling'],
        })

        newSocket.on('connect', () => {
            console.log('[Socket] Connected')
        })

        newSocket.on('complaintUpdated', (data) => {
            toast.success(`Complaint status updated to: ${data.status}`, {
                duration: 5000,
                icon: '🔔',
            })
        })

        newSocket.on('connect_error', (err) => {
            console.error('[Socket] Connection error:', err.message)
        })

        setSocket(newSocket)

        return () => {
            newSocket.disconnect()
        }
    }, [user])

    return (
        <SocketContext.Provider value={{ socket }}>
            {children}
        </SocketContext.Provider>
    )
}
