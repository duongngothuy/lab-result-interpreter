import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import lab_results

load_dotenv()

app = FastAPI(
    title="Lab Result Interpreter",
    description="Upload a lab report PDF and get plain-English explanations powered by AI",
    version="1.0.0",
)

# CORS
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(lab_results.router)


@app.get("/")
async def root():
    return {"status": "ok", "message": "Lab Result Interpreter API"}


@app.get("/health")
async def health():
    return {"status": "healthy"}
