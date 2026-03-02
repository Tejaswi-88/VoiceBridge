export function connectChatStream(conversationId: string, token: string) {
  return new WebSocket(
    `ws://127.0.0.1:8000/api/v1/chat-stream/${conversationId}?token=${encodeURIComponent(token)}`
  )
}
