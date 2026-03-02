from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.health import router as health_router
from app.api.v1.auth import router as auth_router
from app.api.v1.colleges import router as colleges_router
from app.api.v1.faqs import router as faq_router
from app.api.v1.contacts import router as contact_router
from app.api.v1.users import router as users_router
from app.api.v1.admin_users import router as admin_users_router
from app.api.v1.knowledge_base import router as knowledge_base_router
from app.api.v1.chat_stream import router as chat_stream_router
from app.api.v1.chat import router as chat_router
from app.api.v1.analytics import router as analytics_router
from app.api.v1.tickets import router as tickets_router

app = FastAPI(title="VoiceBridge")

# ✅ CORS CONFIGURATION
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Next.js frontend
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/") 
def read_root(): 
    return {"message": "Hello, VoiceBridge!"}
    
app.include_router(health_router, prefix="/api/v1")
app.include_router(auth_router, prefix="/api/v1")
app.include_router(colleges_router, prefix="/api/v1")
app.include_router(faq_router, prefix="/api/v1")
app.include_router(contact_router, prefix="/api/v1")
app.include_router(users_router, prefix="/api/v1")
app.include_router(admin_users_router, prefix="/api/v1")
app.include_router(knowledge_base_router, prefix="/api/v1")
# app.include_router(chat_stream_router, prefix="/api/v1")
app.include_router(chat_router, prefix="/api/v1")
app.include_router(analytics_router, prefix="/api/v1")
app.include_router(tickets_router, prefix="/api/v1")