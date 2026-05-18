from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers.db_routes import router as data_router
from app.routers.map_routes import router as map_router
from app.routers.news_routes import router as news_router
from app.routers.popularity_routes import router as popularity_router
from app.routers.route_routes import router as route_router

app = FastAPI(title="SmartCycle API")
 

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(data_router)
app.include_router(map_router)
app.include_router(news_router)
app.include_router(popularity_router)
app.include_router(route_router)

@app.get("/health")
def health():
    return {"status": "ok"}
