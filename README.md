# TECHNOVA

**AI-Powered Technology Store** — A production-grade e-commerce platform for laptops, smartphones, and technology accessories.

## Project Structure

```
technova/
├── client/          # React + Vite + TypeScript frontend
├── server/          # Express + TypeScript backend
├── .env.example     # Environment variable template
├── .gitignore
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 15+

### Backend
```bash
cd server
cp .env.example .env   # then edit .env with your values
npm install
npm run dev
```
Server runs on http://localhost:5000

### Frontend
```bash
cd client
npm install
npm run dev
```
Client runs on http://localhost:5173

## Tech Stack

| Layer          | Technology                          |
|----------------|-------------------------------------|
| Frontend       | React, Vite, TypeScript, Tailwind CSS, shadcn/ui |
| Backend        | Node.js, Express, TypeScript        |
| Database       | PostgreSQL, Prisma ORM              |
| Auth           | JWT, bcrypt                         |
| AI             | Google Gemini API                   |
