import re
from sqlalchemy import create_engine, text
from ..config.settings import settings

class QueryExecutor:
    _engine = None

    @classmethod
    def get_engine(cls):
        if cls._engine is None:
            cls._engine = create_engine(settings.DATABASE_URL)
        return cls._engine

    def add_limit_if_missing(self, sql, limit=100):
        """Adds a LIMIT clause if one doesn't exist."""
        if "LIMIT" not in sql.upper():
            return f"{sql.strip()} LIMIT {limit}"
        return sql

    def run_select_query(self, sql):
        """Executes a SELECT query and returns formatted results."""
        engine = self.get_engine()
        sql = self.add_limit_if_missing(sql, settings.MAX_QUERY_ROWS)
        
        try:
            with engine.connect() as connection:
                result = connection.execute(text(sql))
                columns = list(result.keys())
                rows = [dict(zip(columns, row)) for row in result.fetchall()]
                return {
                    "success": True,
                    "columns": columns,
                    "rows": rows,
                    "count": len(rows),
                    "error": None
                }
        except Exception as e:
            return {
                "success": False,
                "columns": [],
                "rows": [],
                "count": 0,
                "error": str(e)
            }

    def format_query_results(self, result):
        """Ensures consistent output format."""
        return result

    def limit_query_results(self, sql):
        """Utility to force a limit."""
        return self.add_limit_if_missing(sql)

    def estimate_query_cost(self, sql):
        """Estimates cost based on complexity (number of JOINS)."""
        joins = sql.upper().count("JOIN")
        if joins == 0: return "LOW"
        if joins <= 2: return "MEDIUM"
        return "HIGH"

executor = QueryExecutor()
