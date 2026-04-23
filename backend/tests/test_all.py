import unittest
from app.schema.schema_parser import parse_schema_text, build_schema_dictionary
from app.query.query_validator import is_select_query, contains_dangerous_keywords

class TestQueryMindBackend(unittest.TestCase):
    def test_schema_parser(self):
        text = "Users(id, name, email)"
        parsed = parse_schema_text(text)
        self.assertIn("Users", parsed["tables"])
        self.assertEqual(parsed["tables"]["Users"], ["id", "name", "email"])
        
        schema_dict = build_schema_dictionary(parsed)
        self.assertIn("Users", schema_dict["tables"])

    def test_query_validator(self):
        self.assertTrue(is_select_query("SELECT * FROM users"))
        self.assertFalse(is_select_query("DROP TABLE users"))
        
        dangerous, kw = contains_dangerous_keywords("DELETE FROM users")
        self.assertTrue(dangerous)
        self.assertEqual(kw, "DELETE")

if __name__ == "__main__":
    unittest.main()
