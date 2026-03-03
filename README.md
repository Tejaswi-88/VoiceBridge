# 📘 VoiceBridge
**Multilingual AI Voice & Chat Assistant for Educational Institutions**

---

## 🧠 Overview
VoiceBridge is a multilingual, AI-powered institutional assistant designed to automate student, faculty, and administrative queries using a **Retrieval-Augmented Generation (RAG)** architecture.

The system integrates:
- Large Language Models (LLMs)
- Vector-based semantic search (**pgvector**)
- Role-aware conversational context
- Real-time analytics dashboard
- Multilingual normalization pipeline

VoiceBridge reduces administrative workload while providing **24/7 intelligent institutional support**.

---

## 🚀 Key Features

### 🔹 Multilingual Support
- Automatic language detection  
- Query normalization to English  
- Response translation back to user language  
- Mid-conversation language switching  

### 🔹 Retrieval-Augmented Generation (RAG)
- Knowledge base ingestion (PDF, TXT)  
- Semantic chunking  
- Vector embeddings  
- Cosine similarity search  
- Context-grounded responses  

### 🔹 Role-Based Intelligence
- Student  
- Parent  
- Faculty  
- Admin  
- Volunteer  

Role-aware contextual responses and access control.

### 🔹 Analytics Dashboard
- Conversations per role  
- Messages per role  
- Category breakdown per role  
- Role vs Category interaction graph  
- Top 10 most asked questions  
- Language usage distribution  
- Response time tracking  
- Unanswered ticket monitoring  

### 🔹 Secure Authentication
- JWT-based authentication  
- Role-based access control  

---

## 🏗 System Architecture
```
User
↓
Language Detection
↓
Translation to English
↓
Intent Classification
↓
Vector Embedding
↓
Similarity Search (pgvector)
↓
Context Construction
↓
LLM Response Generation
↓
Translation to User Language
↓
Analytics Logging
↓
Dashboard Insights
```

---

## 🧩 Tech Stack

### 🔹 AI & NLP
- LLM API (Transformer-based)  
- Retrieval-Augmented Generation (RAG)  
- Vector Embeddings (1536-dim)  
- Cosine Similarity  
- LangDetect  
- Translation Service  

### 🔹 Backend
- FastAPI  
- Uvicorn  
- SQLAlchemy ORM  
- PostgreSQL  
- pgvector extension  
- JWT Authentication  

### 🔹 Frontend
- Next.js (App Router)  
- React  
- TypeScript  
- Bootstrap 5  
- Chart.js  

### 🔹 Database Schema Highlights
- ChatConversation  
- ChatMessage  
- KnowledgeChunks  
- CategoryUsage  
- LanguageUsage  
- UnansweredTicket  

---

## 📂 Project Structure
```
voicebridge/
│
├── backend/
│   ├── app/
│   │   ├── __pycache__/
│   │   │   ├── __init__.cpython-311.pyc
│   │   │   ├── config.cpython-311.pyc
│   │   │   └──main.cpython-311.pyc
│   │   ├── api/
│   │   │   ├── __pycache__/.pyc
│   │   │   ├── __init__.py
│   │   │   ├── deps.py
│   │   │   └──  v1/
│   │   │       ├── __pycache__/.pyc
│   │   │       ├── __init__.py
│   │   │       ├── admin_users.py
│   │   │       ├── auth.py
│   │   │       ├── colleges.py
│   │   │       ├── contacts.py
│   │   │       ├── faqs.py
│   │   │       ├── users.py
│   │   │       ├── ..... .py
│   │   │       └── health.py
│   │   │
│   │   ├── models/
│   │   │   ├── __pycache__/.pyc
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── role.py
│   │   │   ├── college.py
│   │   │   ├── contact.py
│   │   │   ├── ..... .py
│   │   │   └── faq.py
│   │   │
│   │   ├── schemas/
│   │   │   ├── __pycache__/.pyc
│   │   │   ├── admin_user.py
│   │   │   ├── auth.py
│   │   │   ├── college.py
│   │   │   ├── contact.py
│   │   │   ├── faq.py
│   │   │   ├── role.py
│   │   │   ├── ..... .py
│   │   │   └── user.py
│   │   │
│   │   ├── utils/
│   │   │   ├── __pycache__/.pyc
│   │   │   ├── __init__.py
│   │   │   ├── security.py
│   │   │   └── jwt.py
│   │   │
│   │   ├── db/
│   │   │   ├── __pycache__/.pyc
│   │   │   ├── __init__.py
│   │   │   └── session.py
│   │   │
│   │   ├── config.py
│   │   ├── __init__.py
│   │   └── main.py
│   │
│   ├── storage/knowledge_files/
│   ├── .env
│   ├── requirements-dev.txt
│   ├── requirements-fastapi.txt
│   └── requirements.txt
│
├── frontend/
│   ├── .next
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.tsx    
│   │   │
│   │   ├── login/
│   │   │   └── page.tsx
│   │   │
│   │   ├── signup/
│   │   │   └── page.tsx
│   │   │
│   │   ├── chat/        
│   │   │   └── page.tsx  
│   │   │
│   │   ├── dashboard/
│   │   │   └── [collegeId]/
│   │   │       ├── layout.tsx
│   │   │       ├── analysis/
│   │   │       │   └── page.tsx
│   │   │       ├── logs/
│   │   │       │   └── page.tsx  
│   │   │       ├── kb/
│   │   │       │   └── page.tsx
│   │   │       ├── faq/
│   │   │       │   └── page.tsx
│   │   │       ├── contacts/
│   │   │       │   └── page.tsx
│   │   │       ├── tickets/
│   │   │       │   └── page.tsx  
│   │   │       └── settings/
│   │   │           ├── layout.tsx
│   │   │           ├── page.tsx
│   │   │           └── tabs/
│   │   │               ├── CollegeProfile.tsx
│   │   │               ├── MyProfile.tsx
│   │   │               ├── UserManagement.tsx
│   │   │               ├── Security.tsx  
│   │   │               └── SystemPreferences.tsx
│   │   │
│   │   └── api/    
│   │
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Hero.tsx
│   │   ├── Challenges.tsx
│   │   ├── Features.tsx
│   │   ├── HowItWorks.tsx
│   │   ├── Benefits.tsx
│   │   ├── Footer.tsx
│   │   ├── FloatingCircles.tsx
│   │   ├── BackToTop.tsx
│   │   └── RegistrationSuccessAlert.tsx
│   │
│   ├── hooks/
│   │   └── useScrollAnimation.tsx
│   ├── node_modules/
│   ├── services/
│   ├── stores/
│   ├──.env.local
│   ├── next-env.d.ts
│   ├── requirements.txt
│   │
│   ├── public/
│   │   └── assets/  
│   │
│   ├── package.json
│   ├── package-lock.json
│   ├── tsconfig.json
│   └── next.config.js
│
├── README.md
├── .gitignore
├── ...... .txt
└── .env
```


---

## ⚙️ Installation & Setup

### 1️⃣ Clone Repository
```bash
git clone https://github.com/your-username/VoiceBridge.git
cd VoiceBridge
```

## 2️⃣ Backend Setup
```
cd backend
python -m venv venv
source venv/bin/activate   # Mac/Linux
venv\Scripts\activate      # Windows
pip install -r requirements.txt
```

Create .env file:
```
DATABASE_URL=postgresql://user:password@localhost/voicebridge
OPENAI_API_KEY=your_api_key
SECRET_KEY=your_secret_key
```

Run backend:
```
bash
uvicorn app.main:app --reload
Backend runs at: http://127.0.0.1:8000
```

## 3️⃣ Frontend Setup
```
bash
cd frontend
npm install
```
Create .env.local:

env
```
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

Run frontend:
```
bash
npm run dev
Frontend runs at: http://localhost:3000
```

## 🧠 AI Pipeline Explained
Knowledge Ingestion
Upload PDF/TXT

Extract text

Chunk into semantic blocks

Generate embeddings

Store in pgvector

Query Flow
Detect language

Translate to English

Classify intent

Retrieve top-K relevant chunks

Construct context

Generate LLM response

Translate back to user language

Log analytics

## 📊 Analytics Capabilities
VoiceBridge tracks:

Role-based usage patterns

Category-wise distribution

Language trends

Most frequent questions

Response time metrics

Unanswered queries

Enabling data-driven institutional decision making.

## 🔒 Security
JWT-based authentication

Role-based access control

Context-restricted LLM prompting

Hallucination mitigation via RAG

Controlled data exposure

## ⚠ Limitations
Dependent on knowledge base quality

Requires internet for LLM API

Translation layer may introduce minor variations

Vector DB requires pgvector support

## 🚀 Future Enhancements
Speech-to-text & text-to-speech integration

WhatsApp / IVR support

Sentiment-based alert system

Predictive analytics

Cloud-native deployment

Fine-tuned institutional LLM

## 📈 Performance Highlights
Average response time: ~500–1200 ms

Multilingual support: 10+ languages

Role-based contextual intelligence

Real-time analytics dashboard

## 🎓 Academic Contribution
Designed full RAG pipeline

Integrated multilingual normalization layer

Implemented role-aware AI context management

Built institutional behavioral analytics engine

Integrated vector similarity search using pgvector

## 🤝 Contributors
Project Lead: Tejaswi Devarapalli

Team Members: B. Sai Praveen | D.C.Lohith Reddy | Doddaka mounika


## 📜 License
This project is developed for academic purposes.

## ⭐ Final Note
VoiceBridge demonstrates the integration of modern LLM-based architectures with vector databases and real-time analytics to create a scalable, intelligent institutional AI assistant.
