import pymysql
import sys

DB_CONFIG = {
    "host": "localhost",
    "port": 3306,
    "user": "root",
    "password": "Arijain@3149",
    "charset": "utf8mb4",
    "cursorclass": pymysql.cursors.DictCursor
}

def test_connection():
    try:
        print("[*] Connecting to MySQL server at localhost:3306...")
        conn = pymysql.connect(**DB_CONFIG)
        with conn.cursor() as cursor:
            cursor.execute("SELECT VERSION() AS ver, USER() AS usr;")
            res = cursor.fetchone()
            print(f"[+] SUCCESS! Connected to MySQL {res['ver']} as {res['usr']}")
        conn.close()
        return True
    except Exception as e:
        print(f"[-] Connection failed: {e}")
        return False

if __name__ == "__main__":
    if test_connection():
        sys.exit(0)
    else:
        sys.exit(1)
