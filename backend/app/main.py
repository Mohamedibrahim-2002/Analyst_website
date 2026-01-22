from fastapi import FastAPI
from app.api.routes import router
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # later restrict this
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app = FastAPI(
    title="Market Image Analyzer",
    description="Image-based market structure analysis (educational)",
    version="0.1.0"
)

@app.get("/")
def root():
    return {
        "status": "running",
        "message": "Market Image Analyzer API",
        "docs": "/docs"
    }

app.include_router(router, prefix="/api")
@app.get("/")
def root():
    return {"status": "ok"}
