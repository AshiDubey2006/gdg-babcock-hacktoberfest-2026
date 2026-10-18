from sqlmodel import Session, select

from app.database import create_db_and_tables, engine
from app.models import Exam, Question, Role, RubricPoint, User
from app.seeds.seed_data import SAMPLE_EXAMS
from app.config import get_settings

def get_admin_seed(session: Session) -> User:
    statement = (
        select(User)
        .where(User.role.in_([Role.admin, Role.superadmin]))
        .order_by(User.id)
    )
    admin = session.exec(statement).first()

    if admin is None:
        raise RuntimeError(
            'No admin or superadmin account exists. '
            'Please create one before running the seed command.'
        )
    return admin


def main() -> None:
    settings = get_settings()

    if settings.app_env != 'development' or not settings.allow_sample_seed:
        raise RuntimeError('Seeding sample exams is not allowed in the current environment.')

    create_db_and_tables()
    seeded_exams = 0

    with Session(engine) as session:
        with session.begin():
            admin_user = get_admin_seed(session)

            # seed sample exams
            for exam_data in SAMPLE_EXAMS:
                existing = session.exec(
                    select(Exam).where(Exam.title == exam_data['title'])
                ).first()
                if existing is not None:
                    print(f"Exam '{exam_data['title']}' already exists. Skipping.")
                    continue

                exam = Exam(
                    title=exam_data['title'],
                    description=exam_data['description'],
                    duration_min=exam_data['duration_min'],
                    created_by=admin_user.id,
                )
                session.add(exam)
                session.flush()

                # seed questions and rubric points
                for question_data in exam_data['questions']:
                    question_values = dict(question_data)
                    rubric_points = question_values.pop('rubric_points', [])
                    question = Question(exam_id=exam.id, **question_values)
                    session.add(question)
                    session.flush()

                    for point_data in rubric_points:
                        session.add(
                            RubricPoint(question_id=question.id, **point_data)
                        )

                seeded_exams += 1

    if seeded_exams:
        print(f"Added {seeded_exams} sample exam(s).")
    else:
        print("All sample exams already exist. No records were added.")

if __name__ == "__main__":
    main()
