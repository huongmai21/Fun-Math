// controllers/examController.js
import { Exam, ExamQuestion, ExamResult } from '../models/index.js';

exports.getAllExams = async (req, res) => {
  try {
    const exams = await Exam.findAll({
      attributes: ["id", "title", "description", "created_at"],
    });
    res.json(exams);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching exams", error: err.message });
  }
};

exports.createExam = async (req, res) => {
  const { title, description, questions } = req.body;

  if (!title || !questions || !Array.isArray(questions)) {
    return res.status(400).json({ message: "Invalid input" });
  }

  try {
    const exam = await Exam.create({
      title,
      description,
    });

    const mongoQuestions = questions.map((q) => ({
      question_text: q.question_text,
      question_type: q.question_type,
      options: q.options || [],
      correct_answer: q.correct_answer,
      ExamsID: exam.id,
    }));

    await ExamQuestion.insertMany(mongoQuestions);

    res.status(201).json({ message: "Exam created", exam });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error creating exam", error: err.message });
  }
};

exports.getExamById = async (req, res) => {
  const { id } = req.params;

  try {
    const exam = await Exam.findByPk(id);
    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    const questions = await ExamQuestion.find({ ExamsID: id }).select(
      "-correct_answer"
    );

    res.json({ exam, questions });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching exam", error: err.message });
  }
};

exports.submitExam = async (req, res) => {
  const { id } = req.params;
  const { answers } = req.body;

  try {
    const exam = await Exam.findByPk(id);
    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    const questions = await ExamQuestion.find({ ExamsID: id });
    let score = 0;
    const total = questions.length;

    questions.forEach((q) => {
      if (answers[q._id] === q.correct_answer) {
        score += 1;
      }
    });

    const finalScore = (score / total) * 100;

    await ExamResult.create({
      score: finalScore,
      UserId: req.user.id,
      ExamId: id,
    });

    res.json({ message: "Exam submitted", score: finalScore });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error submitting exam", error: err.message });
  }
};
