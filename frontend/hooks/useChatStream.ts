// frontend/hooks/useChatStream.ts

import { useRef, useState } from "react"
import { connectChatStream } from "@/services/chat_stream"

export function useChatStream(conversationId: string, token: string) {
  const wsRef = useRef<WebSocket | null>(null)
  const [streamingText, setStreamingText] = useState("")
  const [isConnected, setIsConnected] = useState(false)

  const start = () => {
    if (!conversationId || !token) return
    if (wsRef.current?.readyState === WebSocket.OPEN) return

    wsRef.current = connectChatStream(conversationId, token)

    wsRef.current.onopen = () => {
      console.log("✅ WS OPEN")
      setIsConnected(true)
    }

    wsRef.current.onmessage = (event) => {
      setStreamingText(prev => prev + event.data)
    }

    wsRef.current.onerror = () => {
      console.warn("❌ WS ERROR")
      setIsConnected(false)
    }

    wsRef.current.onclose = () => {
      console.warn("⚠️ WS CLOSED")
      setIsConnected(false)
    }
  }

  const send = (message: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      setStreamingText("") // reset before new stream
      wsRef.current.send(JSON.stringify({ message }))
    }
  }

  // ✅ NEW: explicit clear function
  const clearStream = () => {
    setStreamingText("")
  }

  return {
    start,
    send,
    streamingText,
    clearStream,
    isConnected,
  }
}
