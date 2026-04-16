from sqlalchemy import text, inspect
from sqlalchemy.orm import Session

ALLOWED_TABLES = {
    "bike_sites",
    "bike_gender",
    "bike_time",
    "bike_leg_flow",
    "bike_leg_metrics",
    "bike_routes",
    "bike_share_docks",
    "bicycle_network"
}

class DBService:
    def __init__(self, db: Session):
        self.db = db

    def list_tables(self):
        return sorted(list(ALLOWED_TABLES))

    def get_table_preview(self, table_name: str, limit: int = 10):
        if table_name not in ALLOWED_TABLES:
            raise ValueError(f"Table '{table_name}' is not allowed.")

        query = text(f"SELECT TOP {limit} * FROM {table_name}")
        result = self.db.execute(query)
        return [dict(row._mapping) for row in result]

    def get_table_columns(self, table_name: str):
        if table_name not in ALLOWED_TABLES:
            raise ValueError(f"Table '{table_name}' is not allowed.")

        inspector = inspect(self.db.bind)
        columns = inspector.get_columns(table_name)
        return [
            {
                "name": col["name"],
                "type": str(col["type"]),
                "nullable": col["nullable"]
            }
            for col in columns
        ]

    def run_select_query(self, sql: str):
        sql_clean = sql.strip().lower()

        if not sql_clean.startswith("select"):
            raise ValueError("Only SELECT queries are allowed.")

        result = self.db.execute(text(sql))
        return [dict(row._mapping) for row in result]