import io
import unittest
from contextlib import redirect_stdout

from sqlmodel import Session, SQLModel, create_engine, select

import app.seed as seed
from app.models import Exam, Question, Role, RubricPoint, User
from unittest.mock import patch
from app.config import Settings


class SeedCommandTests(unittest.TestCase):
    def setUp(self) -> None:
        self.test_engine = create_engine("sqlite://")
        self.original_engine = seed.engine
        self.original_create_db_and_tables = seed.create_db_and_tables
        seed.engine = self.test_engine
        seed.create_db_and_tables = lambda: SQLModel.metadata.create_all(self.test_engine)
        seed.create_db_and_tables()
        
        self.settings_patcher = patch('app.seed.get_settings', return_value=Settings(app_env='development', allow_sample_seed=True))
        self.settings_patcher.start()

    def tearDown(self) -> None:
        seed.engine = self.original_engine
        seed.create_db_and_tables = self.original_create_db_and_tables
        self.test_engine.dispose()
        
        self.settings_patcher.stop()

    def test_seed_creates_sample_records_once_with_valid_relationships(self) -> None:
        with Session(self.test_engine) as session:
            session.add(
                User(
                    email="seed-admin@example.test",
                    password_hash="fake-test-hash",
                    role=Role.admin,
                )
            )
            session.commit()

        with redirect_stdout(io.StringIO()):
            seed.main()
            seed.main()

        with Session(self.test_engine) as session:
            exams = session.exec(select(Exam)).all()
            questions = session.exec(select(Question)).all()
            rubric_points = session.exec(select(RubricPoint)).all()

            self.assertEqual(len(exams), 2)
            self.assertEqual(len(questions), 4)
            self.assertEqual(len(rubric_points), 4)

            exam_ids = {exam.id for exam in exams}
            question_ids = {question.id for question in questions}
            self.assertTrue(all(question.exam_id in exam_ids for question in questions))
            self.assertTrue(
                all(point.question_id in question_ids for point in rubric_points)
            )
            self.assertTrue(all(point.keywords is not None for point in rubric_points))

    def test_seed_requires_an_existing_admin(self) -> None:
        with self.assertRaisesRegex(RuntimeError, "No admin or superadmin"):
            seed.main()

        with Session(self.test_engine) as session:
            self.assertEqual(len(session.exec(select(User)).all()), 0)
            self.assertEqual(len(session.exec(select(Exam)).all()), 0)
            
    def test_seed_is_blocked_in_production(self) -> None:
        with (
            patch(
                "app.seed.get_settings",
                return_value=Settings(
                    app_env="production",
                    allow_sample_seed=True,
                ),
            ),
            patch("app.seed.create_db_and_tables") as create_tables,
        ):
            with self.assertRaisesRegex(RuntimeError, "not allowed"):
                seed.main()

            create_tables.assert_not_called()


if __name__ == "__main__":
    unittest.main()
