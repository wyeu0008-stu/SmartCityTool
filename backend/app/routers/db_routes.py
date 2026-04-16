from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services.db_service import DBService

router = APIRouter(prefix="/data", tags=["data"])

class SQLQueryRequest(BaseModel):
    sql: str

@router.get("/tables")
def get_tables(db: Session = Depends(get_db)):
    service = DBService(db)
    return {
        "tables": service.list_tables()
    }

@router.get("/tables/{table_name}/columns")
def get_table_columns(table_name: str, db: Session = Depends(get_db)):
    service = DBService(db)
    try:
        return {
            "table": table_name,
            "columns": service.get_table_columns(table_name)
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/tables/{table_name}/preview")
def preview_table(
    table_name: str,
    limit: int = Query(default=10, ge=1, le=100),
    db: Session = Depends(get_db)
):
    service = DBService(db)
    try:
        return {
            "table": table_name,
            "limit": limit,
            "rows": service.get_table_preview(table_name, limit)
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/query")
def run_query(payload: SQLQueryRequest, db: Session = Depends(get_db)):
    service = DBService(db)
    try:
        return {
            "rows": service.run_select_query(payload.sql)
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))