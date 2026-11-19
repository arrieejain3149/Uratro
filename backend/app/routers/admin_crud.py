from fastapi import APIRouter, HTTPException, Body
from typing import Dict, Any, List
from app.database import get_db
import datetime
from decimal import Decimal

router = APIRouter(prefix="/api/v1/crud", tags=["Admin Master CRUD"])

ALLOWED_TABLES = [
    "Station",
    "Metro",
    "Employee",
    "Route",
    "Route_Station_Mapping",
    "Track",
    "Passenger",
    "Ticket",
    "Daily_Train_Schedule",
    "Maintenance_Job",
    "Maintenance_Engineer_Job",
    "Emergency_Incident",
    "Security_Incident",
]

def serialize_val(val):
    if isinstance(val, (datetime.datetime, datetime.date, datetime.time)):
        return val.isoformat()
    if isinstance(val, Decimal):
        return float(val)
    if isinstance(val, bytes):
        return val.decode("utf-8", errors="replace")
    return val

def check_table(table_name: str) -> str:
    # Match case-insensitively to allowed tables
    for t in ALLOWED_TABLES:
        if t.lower() == table_name.lower():
            return t
    raise HTTPException(status_code=400, detail=f"Table '{table_name}' is not in the allowed schema.")

@router.get("/tables")
def list_crud_tables():
    return {"status": "success", "tables": ALLOWED_TABLES}

@router.get("/{table_name}")
def get_table_data(table_name: str):
    valid_table = check_table(table_name)
    with get_db() as conn:
        with conn.cursor() as cur:
            # 1. Get column metadata
            cur.execute("""
                SELECT COLUMN_NAME, COLUMN_KEY, DATA_TYPE, IS_NULLABLE, EXTRA, COLUMN_DEFAULT
                FROM information_schema.COLUMNS
                WHERE TABLE_SCHEMA = 'smart_metro_db' AND TABLE_NAME = %s
                ORDER BY ORDINAL_POSITION;
            """, (valid_table,))
            columns = cur.fetchall()

            # Identify primary key
            pk_col = None
            for col in columns:
                if col.get("COLUMN_KEY") == "PRI":
                    pk_col = col.get("COLUMN_NAME")
                    break

            # 2. Get rows
            cur.execute(f"SELECT * FROM `{valid_table}` LIMIT 100;")
            raw_rows = cur.fetchall()
            serialized_rows = [
                {k: serialize_val(v) for k, v in row.items()}
                for row in raw_rows
            ]

            return {
                "status": "success",
                "table": valid_table,
                "primary_key": pk_col,
                "columns": columns,
                "rowCount": len(serialized_rows),
                "rows": serialized_rows
            }

@router.post("/{table_name}")
def insert_record(table_name: str, data: Dict[str, Any] = Body(...)):
    valid_table = check_table(table_name)
    if not data:
        raise HTTPException(status_code=400, detail="Data cannot be empty.")

    with get_db() as conn:
        with conn.cursor() as cur:
            # Verify valid columns
            cur.execute("""
                SELECT COLUMN_NAME, EXTRA
                FROM information_schema.COLUMNS
                WHERE TABLE_SCHEMA = 'smart_metro_db' AND TABLE_NAME = %s;
            """, (valid_table,))
            col_meta = {c["COLUMN_NAME"]: c for c in cur.fetchall()}

            # Filter data to valid columns and exclude auto_increment if empty
            filtered_data = {}
            for k, v in data.items():
                if k in col_meta:
                    if col_meta[k].get("EXTRA") == "auto_increment" and (v is None or v == ""):
                        continue
                    filtered_data[k] = v

            if not filtered_data:
                raise HTTPException(status_code=400, detail="No valid columns provided.")

            keys = list(filtered_data.keys())
            vals = [filtered_data[k] for k in keys]
            cols_clause = ", ".join([f"`{k}`" for k in keys])
            placeholders = ", ".join(["%s"] * len(keys))

            sql = f"INSERT INTO `{valid_table}` ({cols_clause}) VALUES ({placeholders});"
            cur.execute(sql, vals)
            new_id = cur.lastrowid

            return {
                "status": "success",
                "table": valid_table,
                "inserted_id": new_id,
                "message": f"Successfully inserted record into {valid_table}."
            }

@router.put("/{table_name}/{pk_col}/{pk_val}")
def update_record(table_name: str, pk_col: str, pk_val: str, data: Dict[str, Any] = Body(...)):
    valid_table = check_table(table_name)
    if not data:
        raise HTTPException(status_code=400, detail="No update data provided.")

    with get_db() as conn:
        with conn.cursor() as cur:
            # Verify primary key and columns
            cur.execute("""
                SELECT COLUMN_NAME
                FROM information_schema.COLUMNS
                WHERE TABLE_SCHEMA = 'smart_metro_db' AND TABLE_NAME = %s;
            """, (valid_table,))
            valid_cols = {c["COLUMN_NAME"] for c in cur.fetchall()}

            if pk_col not in valid_cols:
                raise HTTPException(status_code=400, detail=f"Invalid primary key column '{pk_col}'.")

            set_clauses = []
            vals = []
            for k, v in data.items():
                if k in valid_cols and k != pk_col:
                    set_clauses.append(f"`{k}` = %s")
                    vals.append(v)

            if not set_clauses:
                raise HTTPException(status_code=400, detail="No modifiable columns provided.")

            vals.append(pk_val)
            sql = f"UPDATE `{valid_table}` SET {', '.join(set_clauses)} WHERE `{pk_col}` = %s;"
            cur.execute(sql, vals)

            return {
                "status": "success",
                "table": valid_table,
                "affected_rows": cur.rowcount,
                "message": f"Updated record {pk_val} in {valid_table}."
            }

@router.delete("/{table_name}/{pk_col}/{pk_val}")
def delete_record(table_name: str, pk_col: str, pk_val: str):
    valid_table = check_table(table_name)
    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT COLUMN_NAME
                FROM information_schema.COLUMNS
                WHERE TABLE_SCHEMA = 'smart_metro_db' AND TABLE_NAME = %s;
            """, (valid_table,))
            valid_cols = {c["COLUMN_NAME"] for c in cur.fetchall()}

            if pk_col not in valid_cols:
                raise HTTPException(status_code=400, detail=f"Invalid primary key column '{pk_col}'.")

            sql = f"DELETE FROM `{valid_table}` WHERE `{pk_col}` = %s;"
            cur.execute(sql, (pk_val,))

            return {
                "status": "success",
                "table": valid_table,
                "affected_rows": cur.rowcount,
                "message": f"Deleted record {pk_val} from {valid_table}."
            }
