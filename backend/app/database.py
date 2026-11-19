import pymysql
from pymysql.cursors import DictCursor
from contextlib import contextmanager
import os
from pathlib import Path

# Load .env file if available
try:
    from dotenv import load_dotenv
    env_file = Path(__file__).resolve().parent.parent / ".env"
    if env_file.exists():
        load_dotenv(dotenv_path=env_file)
except ImportError:
    pass

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = int(os.getenv("DB_PORT", "3306"))
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "Arijain@3149")
DB_NAME = os.getenv("DB_NAME", "smart_metro_db")

def get_connection():
    kwargs = {
        "host": DB_HOST,
        "port": DB_PORT,
        "user": DB_USER,
        "password": DB_PASSWORD,
        "database": DB_NAME,
        "charset": "utf8mb4",
        "cursorclass": DictCursor,
        "autocommit": True,
    }
    if DB_PORT == 4000 or os.getenv("DB_SSL", "false").lower() == "true":
        kwargs["ssl"] = {"ssl_mode": "REQUIRED"}
    return pymysql.connect(**kwargs)

@contextmanager
def get_db():
    conn = get_connection()
    try:
        yield conn
    finally:
        conn.close()
