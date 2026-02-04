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

# CORS - allow Vercel preview URLs and production
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
allowed_origins = [
    frontend_url,
    "http://localhost:3000",
    "https://lab-result-interpreter.vercel.app",
    "https://lab-result-interpreter-duongngothuys-projects.vercel.app",
]
# Also allow any Vercel preview URL for this project
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"https://lab-result-interpreter.*\.vercel\.app",
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
