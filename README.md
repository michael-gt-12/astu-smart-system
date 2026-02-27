# ASTU Smart Complaint & Issue Tracking System (with RAG AI)

A premium, full-stack university complaint tracking system built with React, Node.js, Express, MongoDB, and professional AI features. This version includes a **RAG (Retrieval-Augmented Generation)** chatbot for intelligent campus support.

![Stack](https://img.shields.io/badge/React-Vite-blue) ![Stack](https://img.shields.io/badge/Node.js-Express-green) ![Stack](https://img.shields.io/badge/MongoDB-Mongoose-darkgreen) ![Stack](https://img.shields.io/badge/Google_Gemini-AI-orange) ![Stack](https://img.shields.io/badge/Pinecone-Vector_DB-black)

## Features

- **RAG-Powered AI Chatbot**: Intelligent chatbot integrating Google Gemini and Pinecone for accurate, context-aware answers.
- **Knowledge Ingestion**: Admins can upload campus PDFs to the AI knowledge base.
- **Role-based Authentication**: Secure access for Students, Staff, and Admins with JWT + Refresh Tokens.
- **Google OAuth**: Fast login via Passport.js.
- **Complaint Management**: Submit, track, and update campus issues with real-time status notifications.
- **Embedded Analytics**: Visual data dashboard using Recharts.
- **Modern UI**: Sleek, responsive design with Dark/Light mode support.

## Tech Stack

| Frontend | Backend | AI & Data |
|----------|---------|-----------|
| React (Vite) | Node.js + Express | **Google Gemini** (Embeddings/LLM) |
| TailwindCSS | MongoDB + Mongoose | **Pinecone** (Vector Database) |
| TanStack Query | Socket.io (Real-time) | Multer + PDF-Parse |
| Recharts | JWT + Passport.js | Nodemailer (Emails) |

## Environment Variables

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB connection string |
| `GEMINI_API_KEY` | Google AI Studio API Key |
| `PINECONE_API_KEY` | Pinecone API Key |
| `PINECONE_INDEX` | Your Pinecone index name |
| `JWT_SECRET` | Secret for access tokens |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID |
| `SMTP_USER` | Email (Nodemailer) credentials |

## Setup Instructions

### 1. Install Dependencies
```bash
npm install # Root
npm run install:all # Client & Server
```

### 2. Database Seeding
```bash
npm run seed # Creates default Admin/Staff accounts
```

### 3. Running the Project
```bash
npm run dev # Launches frontend (5173) and backend (5000)
```

## API Endpoints

- `POST /api/chatbot`: Principal endpoint for AI interaction.
- `POST /api/knowledge`: Upload PDF documentation (Admin only).
- `GET /api/complaints`: Manage and track student issues.
- `GET /api/analytics`: Overview of system performance.


