from sqlalchemy import text
from sqlalchemy.orm import Session


class TipsService:
    def __init__(self, db: Session):
        self.db = db

    def get_tips(self, limit: int = 50):
        safe_limit = max(1, min(int(limit or 50), 100))

        rows = self.db.execute(text(f"""
            SELECT TOP {safe_limit}
                title,
                content,
                category
            FROM cycling_tips
            ORDER BY title ASC
        """)).mappings()

        return [
            {
                "title": row["title"],
                "text": row["content"],
                "category": row["category"],
            }
            for row in rows
        ]