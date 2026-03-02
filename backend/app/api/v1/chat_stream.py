from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from uuid import UUID

from app.db.session import SessionLocal
from app.services.chat_engine_stream import run_chat_engine_stream
from app.services.ws_auth import get_current_user_ws

router = APIRouter(prefix="/chat-stream", tags=["Chat Streaming"])


@router.websocket("/{conversation_id}")
async def websocket_chat(websocket: WebSocket, conversation_id: UUID):

    token = websocket.query_params.get("token")

    print("WS TOKEN:", token)

    # Reject BEFORE accept if token missing
    if not token:
        await websocket.close(code=4001)
        return

    db = SessionLocal()
    user = get_current_user_ws(token, db)

    print("WS USER:", user)

    # Reject BEFORE accept if invalid token
    if not user:
        await websocket.close(code=4003)
        return

    # Accept only AFTER auth passes
    await websocket.accept()

    try:
        while True:
            data = await websocket.receive_json()
            user_message = data.get("message")

            if not user_message:
                await websocket.send_text("⚠️ Empty message")
                continue

            async for chunk in run_chat_engine_stream(
                db=db,
                conversation_id=conversation_id,
                user=user,
                user_message=user_message
            ):
                await websocket.send_text(chunk)

    except WebSocketDisconnect:
        print("WebSocket disconnected")

    except Exception as e:
        print("WebSocket Error:", e)
        await websocket.close(code=1011)
