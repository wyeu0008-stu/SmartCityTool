from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers.data import router as data_router

app = FastAPI(title="SmartCycle Database API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(data_router)

@app.get("/health")
def health():
    return {"status": "ok"}