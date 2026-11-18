from fastapi import APIRouter
from pydantic import BaseModel
from app.database import get_db
import time
import datetime
from decimal import Decimal

router = APIRouter(prefix="/api/v1/sql", tags=["SQL Console"])

class QueryRequest(BaseModel):
    query: str

def serialize_value(val):
    if isinstance(val, (datetime.datetime, datetime.date, datetime.time)):
        return val.isoformat()
    if isinstance(val, Decimal):
        return float(val)
    if isinstance(val, bytes):
        return val.decode("utf-8", errors="replace")
    return val

def serialize_row(row):
    if isinstance(row, dict):
        return {k: serialize_value(v) for k, v in row.items()}
    elif isinstance(row, (list, tuple)):
        return [serialize_value(v) for v in row]
    return row

@router.post("/execute")
def execute_query(req: QueryRequest):
    raw_query = req.query.strip()
    if not raw_query:
        return {
            "status": "error",
            "error": "Query string cannot be empty.",
            "executionMs": 0.0
        }

    start_time = time.perf_counter()
    try:
        with get_db() as conn:
            with conn.cursor() as cur:
                cur.execute(raw_query)
                elapsed_ms = round((time.perf_counter() - start_time) * 1000, 2)

                if cur.description:
                    columns = [col[0] for col in cur.description]
                    raw_rows = cur.fetchall()
                    serialized_rows = [serialize_row(r) for r in raw_rows]
                    return {
                        "status": "success",
                        "type": "SELECT",
                        "query": raw_query,
                        "columns": columns,
                        "rows": serialized_rows,
                        "rowCount": len(serialized_rows),
                        "executionMs": elapsed_ms
                    }
                else:
                    affected = cur.rowcount
                    return {
                        "status": "success",
                        "type": "MUTATION",
                        "query": raw_query,
                        "columns": [],
                        "rows": [],
                        "rowCount": affected,
                        "message": f"Query OK, {affected} row(s) affected.",
                        "executionMs": elapsed_ms
                    }
    except Exception as e:
        elapsed_ms = round((time.perf_counter() - start_time) * 1000, 2)
        return {
            "status": "error",
            "query": raw_query,
            "error": str(e),
            "executionMs": elapsed_ms
        }

@router.get("/schema")
def get_database_schema():
    try:
        with get_db() as conn:
            with conn.cursor() as cur:
                # 1. Fetch tables
                cur.execute("""
                    SELECT TABLE_NAME, TABLE_TYPE, TABLE_ROWS, TABLE_COMMENT 
                    FROM information_schema.TABLES 
                    WHERE TABLE_SCHEMA = 'smart_metro_db'
                    ORDER BY TABLE_TYPE, TABLE_NAME;
                """)
                tables = cur.fetchall()

                # 2. Fetch columns
                cur.execute("""
                    SELECT TABLE_NAME, COLUMN_NAME, ORDINAL_POSITION, COLUMN_DEFAULT, 
                           IS_NULLABLE, DATA_TYPE, COLUMN_TYPE, COLUMN_KEY, EXTRA
                    FROM information_schema.COLUMNS
                    WHERE TABLE_SCHEMA = 'smart_metro_db'
                    ORDER BY TABLE_NAME, ORDINAL_POSITION;
                """)
                columns = cur.fetchall()

                # 3. Fetch foreign keys
                cur.execute("""
                    SELECT 
                        TABLE_NAME, 
                        COLUMN_NAME, 
                        CONSTRAINT_NAME, 
                        REFERENCED_TABLE_NAME, 
                        REFERENCED_COLUMN_NAME
                    FROM information_schema.KEY_COLUMN_USAGE
                    WHERE TABLE_SCHEMA = 'smart_metro_db' AND REFERENCED_TABLE_NAME IS NOT NULL;
                """)
                foreign_keys = cur.fetchall()

                return {
                    "status": "success",
                    "database": "smart_metro_db",
                    "tables": tables,
                    "columns": columns,
                    "foreign_keys": foreign_keys
                }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e)
        }
