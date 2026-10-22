from app.models import QuestionType

SAMPLE_EXAMS = [
    {
        "title": "Sample Introductory Programming Exam",
        "description": "A fictional practice exam about basic programming concepts.",
        "duration_min": 30,
        "questions": [
            {
                "type": QuestionType.objective,
                "text": "Which Python keyword defines a function?",
                "max_marks": 1,
                "options": ["class", "def", "return", "import"],
                "correct_option": "def",
                "model_answer": None,
                "rubric_points": [],
            },
            {
                "type": QuestionType.short,
                "text": "Explain what a variable is, using a simple example.",
                "max_marks": 3,
                "options": None,
                "correct_option": None,
                "model_answer": "A variable is a named place to store a value, such as score = 10.",
                "rubric_points": [
                    {
                        "description": "Explains that a variable stores a value.",
                        "marks": 2,
                        "keywords": ["stores", "value"],
                    },
                    {
                        "description": "Gives a relevant example.",
                        "marks": 1,
                        "keywords": ["score", "example"],
                    },
                ],
            },
        ],
    },
    {
        "title": "Sample Foundational Algebra Exam",
        "description": "A fictional practice exam about introductory algebra.",
        "duration_min": 30,
        "questions": [
            {
                "type": QuestionType.objective,
                "text": "What is 3 + 4?",
                "max_marks": 1,
                "options": ["5", "6", "7", "8"],
                "correct_option": "7",
                "model_answer": None,
                "rubric_points": [],
            },
            {
                "type": QuestionType.short,
                "text": "Solve x + 2 = 5 and explain your steps.",
                "max_marks": 3,
                "options": None,
                "correct_option": None,
                "model_answer": "Subtract 2 from both sides: x = 5 - 2 = 3.",
                "rubric_points": [
                    {
                        "description": "Subtracts 2 from both sides.",
                        "marks": 1,
                        "keywords": ["subtract", "both sides"],
                    },
                    {
                        "description": "Gets x = 3.",
                        "marks": 2,
                        "keywords": ["x = 3"],
                    },
                ],
            },
        ],
    },
]