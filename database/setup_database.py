import os
import pymysql
from pymysql.cursors import DictCursor

DB_CONFIG = {
    "host": os.getenv("DB_HOST", "localhost"),
    "port": int(os.getenv("DB_PORT", 3306)),
    "user": os.getenv("DB_USER", "root"),
    "password": os.getenv("DB_PASSWORD", "Arijain@3149"),
    "charset": "utf8mb4",
    "cursorclass": DictCursor,
    "client_flag": pymysql.constants.CLIENT.MULTI_STATEMENTS
}

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

def execute_sql_file(conn, filepath):
    filename = os.path.basename(filepath)
    print(f"[*] Executing {filename}...")
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    # If it's procedures/triggers file with DELIMITER, split by delimiter logic or execute blocks
    if "DELIMITER" in content:
        # Split by DELIMITER $$
        blocks = content.split("DELIMITER $$")
        header = blocks[0]
        # Execute header statements first
        with conn.cursor() as cur:
            for stmt in header.split(";"):
                stmt = stmt.strip()
                if stmt:
                    cur.execute(stmt)
            conn.commit()

        # The second part contains statements terminated by $$ until DELIMITER ;
        body_and_tail = blocks[1].split("DELIMITER ;")
        body = body_and_tail[0]
        for routine in body.split("$$"):
            routine = routine.strip()
            if routine:
                with conn.cursor() as cur:
                    cur.execute(routine)
                conn.commit()
    else:
        with conn.cursor() as cur:
            cur.execute(content)
        conn.commit()
    print(f"[+] Successfully executed {filename}!")

def verify_database():
    conn = pymysql.connect(database="smart_metro_db", **DB_CONFIG)
    with conn.cursor() as cur:
        # Check tables
        cur.execute("SHOW TABLES;")
        tables = [list(r.values())[0] for r in cur.fetchall()]
        print(f"\n[+] Total Tables & Views in smart_metro_db: {len(tables)}")
        for t in tables:
            cur.execute(f"SELECT COUNT(*) AS cnt FROM `{t}`;")
            count = cur.fetchone()["cnt"]
            print(f"    - {t}: {count} records")

        # Check procedures
        cur.execute("SHOW PROCEDURE STATUS WHERE Db = 'smart_metro_db';")
        procs = [r['Name'] for r in cur.fetchall()]
        print(f"\n[+] Stored Procedures: {procs}")

        # Check triggers
        cur.execute("SHOW TRIGGERS FROM smart_metro_db;")
        trigs = [r['Trigger'] for r in cur.fetchall()]
        print(f"\n[+] Triggers: {trigs}")

    conn.close()

def create_indexes(conn):
    indexes = [
        ("Ticket", "idx_ticket_passenger", "(Passenger_ID, Entry_Time)"),
        ("Ticket", "idx_ticket_entry_exit", "(Entry_Station_ID, Exit_Station_ID, Entry_Time)"),
        ("Daily_Train_Schedule", "idx_schedule_date_shift", "(Date, Shift)"),
        ("Emergency_Incident", "idx_emergency_status_time", "(Resolution_Status, Timestamp)"),
        ("Security_Incident", "idx_security_station_time", "(Station_ID, Timestamp)"),
        ("Track", "idx_track_condition", "(Condition_Status, Route_ID)")
    ]
    with conn.cursor() as cur:
        for tbl, idx_name, cols in indexes:
            try:
                cur.execute(f"CREATE INDEX `{idx_name}` ON `{tbl}` {cols};")
                print(f"[+] Created index {idx_name} on {tbl}")
            except Exception as e:
                # 1061 = Duplicate key name
                if "1061" in str(e):
                    pass
                else:
                    print(f"[-] Index warning ({idx_name}): {e}")
        conn.commit()

def main():
    conn = pymysql.connect(**DB_CONFIG)
    try:
        execute_sql_file(conn, os.path.join(BASE_DIR, "schema.sql"))
        create_indexes(conn)
        execute_sql_file(conn, os.path.join(BASE_DIR, "procedures_and_triggers.sql"))
        execute_sql_file(conn, os.path.join(BASE_DIR, "views.sql"))
        execute_sql_file(conn, os.path.join(BASE_DIR, "seed.sql"))
        print("\n================ DATABASE SETUP COMPLETE ================")
        verify_database()
    finally:
        conn.close()

if __name__ == "__main__":
    main()
