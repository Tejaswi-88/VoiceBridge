// frontend/services/chat_api.ts

export async function sendChatMessageREST(
  conversationId: string,
  token: string,
  message: string
) {
  try {
    const res = await fetch(
      `http://127.0.0.1:8000/api/v1/chat/${conversationId}/message`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message }),
      }
    );

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text);
    }

    return await res.json();
  } catch (err) {
    console.error("REST chat failed:", err);
    throw err;
  }
}

