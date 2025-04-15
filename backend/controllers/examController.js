// controllers/examController.js
const Exam = require("../models/Exam.js");
const ExamQuestion = require("../models/ExamQuestion.js");
const ExamResult = require("../models/ExamResult.js");
const Notification = require("../models/Notification.js");

// Lấy tất cả đề thi (có lọc và phân trang)
exports.getAllExams = async (req, res) => {
  try {
    const { educationLevel, subject, examType, search } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Xây dựng query
    let query = { isPublic: true };
    if (educationLevel) query.educationLevel = educationLevel;
    if (subject) query.subject = subject;
    if (examType) query.examType = examType;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const exams = await Exam.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("author", "username fullName");

    const total = await Exam.countDocuments(query);

    res.status(200).json({
      success: true,
      count: exams.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      exams,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Không thể lấy danh sách đề thi!",
      error: error.message,
    });
  }
};

// Lấy chi tiết một đề thi
exports.getExamById = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id)
      .populate("author", "username fullName")
      .populate("questions");

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đề thi!",
      });
    }

    // Kiểm tra quyền xem đề thi
    if (
      !exam.isPublic &&
      exam.author.toString() !== req.user.id &&
      req.user.role !== "admin" &&
      req.user.role !== "teacher"
    ) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền xem đề thi này!",
      });
    }

    // Tăng số lượt làm bài
    exam.attempts += 1;
    await exam.save();

    res.status(200).json({
      success: true,
      exam,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Không thể lấy chi tiết đề thi!",
      error: error.message,
    });
  }
};

// Tạo đề thi mới (admin và giáo viên)
exports.createExam = async (req, res) => {
  try {
    // Kiểm tra quyền hạn
    if (req.user.role !== "admin" && req.user.role !== "teacher") {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền thực hiện hành động này!",
      });
    }

    const {
      title,
      description,
      educationLevel,
      subject,
      examType,
      duration,
      totalPoints,
      isPublic,
      questions,
    } = req.body;

    // Tạo đề thi mới
    const newExam = new Exam({
      title,
      description,
      author: req.user.id,
      educationLevel,
      subject,
      examType,
      duration,
      totalPoints,
      isPublic: isPublic !== undefined ? isPublic : true,
    });

    // Lưu đề thi
    await newExam.save();

    // Xử lý câu hỏi (nếu có)
    if (questions && questions.length > 0) {
      const savedQuestions = [];

      for (const question of questions) {
        const newQuestion = new ExamQuestion({
          questionText: question.questionText,
          questionType: question.questionType,
          options: question.options,
          correctAnswer: question.correctAnswer,
          explanation: question.explanation,
          points: question.points,
          difficulty: question.difficulty,
          images: question.images,
          createdBy: req.user.id,
        });

        const savedQuestion = await newQuestion.save();
        savedQuestions.push(savedQuestion._id);
      }

      // Cập nhật đề thi với các ID câu hỏi
      newExam.questions = savedQuestions;
      await newExam.save();
    }

    res.status(201).json({
      success: true,
      message: "Tạo đề thi thành công!",
      exam: newExam,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Tạo đề thi thất bại!",
      error: error.message,
    });
  }
};

// Cập nhật đề thi
exports.updateExam = async (req, res) => {
  try {
    const {
      title,
      description,
      educationLevel,
      subject,
      examType,
      duration,
      totalPoints,
      isPublic,
    } = req.body;

    const exam = await Exam.findById(req.params.id);
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đề thi!",
      });
    }

    // Kiểm tra quyền sửa đề thi
    if (exam.author.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền sửa đề thi này!",
      });
    }

    const updatedExam = await Exam.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        educationLevel,
        subject,
        examType,
        duration,
        totalPoints,
        isPublic,
        updatedAt: Date.now(),
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Cập nhật đề thi thành công!",
      exam: updatedExam,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Cập nhật đề thi thất bại!",
      error: error.message,
    });
  }
};

// Thêm câu hỏi vào đề thi
exports.addQuestionToExam = async (req, res) => {
  try {
    const examId = req.params.id;
    const exam = await Exam.findById(examId);

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đề thi!",
      });
    }

    // Kiểm tra quyền sửa đề thi
    if (exam.author.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền sửa đề thi này!",
      });
    }

    // Tạo câu hỏi mới
    const newQuestion = new ExamQuestion({
      ...req.body,
      createdBy: req.user.id,
    });

    const savedQuestion = await newQuestion.save();

    // Thêm câu hỏi vào đề thi
    exam.questions.push(savedQuestion._id);
    await exam.save();

    res.status(201).json({
      success: true,
      message: "Thêm câu hỏi thành công!",
      question: savedQuestion,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Thêm câu hỏi thất bại!",
      error: error.message,
    });
  }
};

// Nộp bài thi
exports.submitExam = async (req, res) => {
  try {
    const { examId, answers, startTime, endTime } = req.body;

    // Tìm đề thi
    const exam = await Exam.findById(examId).populate("questions");
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đề thi!",
      });
    }

    // Tính điểm
    let totalScore = 0;
    const answersWithResults = [];

    for (const answer of answers) {
      const question = exam.questions.find(
        (q) => q._id.toString() === answer.questionId
      );
      if (!question) continue;

      let isCorrect = false;
      let score = 0;

      // Kiểm tra đáp án dựa vào loại câu hỏi
      if (
        question.questionType === "multiple-choice" ||
        question.questionType === "true-false"
      ) {
        isCorrect = answer.answer === question.correctAnswer;
        score = isCorrect ? question.points : 0;
      } else if (question.questionType === "fill-in") {
        // Có thể cần xử lý phức tạp hơn cho các loại câu hỏi khác
        isCorrect =
          answer.answer.toLowerCase() === question.correctAnswer.toLowerCase();
        score = isCorrect ? question.points : 0;
      }
      // Loại essay cần giáo viên chấm điểm

      answersWithResults.push({
        question: question._id,
        userAnswer: answer.answer,
        isCorrect,
        score,
      });

      totalScore += score;
    }

    // Lưu kết quả bài thi
    const examResult = new ExamResult({
      exam: examId,
      user: req.user.id,
      answers: answersWithResults,
      totalScore,
      startTime,
      endTime,
      completed: true,
    });

    await examResult.save();

    // Tạo thông báo kết quả
    const notification = new Notification({
      recipient: req.user.id,
      type: "grade",
      title: "Kết quả bài thi",
      message: `Bạn đã hoàn thành bài thi "${exam.title}" với số điểm ${totalScore}/${exam.totalPoints}.`,
      link: `/exam-results/${examResult._id}`,
      relatedModel: "ExamResult",
      relatedId: examResult._id,
      importance: "normal",
    });

    await notification.save();

    res.status(201).json({
      success: true,
      message: "Nộp bài thi thành công!",
      result: {
        totalScore,
        maxScore: exam.totalPoints,
        resultId: examResult._id,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Nộp bài thi thất bại!",
      error: error.message,
    });
  }
};

// Lấy kết quả bài thi
exports.getExamResult = async (req, res) => {
  try {
    const resultId = req.params.id;

    const result = await ExamResult.findById(resultId)
      .populate("exam")
      .populate("user", "username fullName")
      .populate("answers.question");

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy kết quả bài thi!",
      });
    }

    // Kiểm tra quyền truy cập: người dùng hiện tại hoặc admin hoặc giáo viên
    if (
      result.user._id.toString() !== req.user.id &&
      req.user.role !== "admin" &&
      req.user.role !== "teacher"
    ) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền xem kết quả bài thi này!",
      });
    }

    res.status(200).json({
      success: true,
      result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Không thể lấy kết quả bài thi!",
      error: error.message,
    });
  }
};


exports.deleteExam = async (req, res) => {
  try {
    const examId = req.params.examId;

    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy kỳ thi!'
      });
    }

    // Chỉ giáo viên tạo kỳ thi hoặc admin mới được xóa
    if (
      exam.createdBy.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xóa kỳ thi này!'
      });
    }

    await Exam.findByIdAndDelete(examId);

    // Xoá tất cả kết quả liên quan đến kỳ thi này
    await Result.deleteMany({ exam: examId });

    res.status(200).json({
      success: true,
      message: 'Đã xoá kỳ thi và tất cả kết quả liên quan.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Xóa kỳ thi thất bại!',
      error: error.message
    });
  }
};

const getUserExamResults = async (req, res) => {
  try {
    const userId =
      req.user.role === 'student'
        ? req.user.id
        : req.params.userId || req.user.id;

    const results = await Result.find({ user: userId })
      .populate('exam', 'title subject grade')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: results.length,
      results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Không thể lấy kết quả!',
      error: error.message
    });
  }
};

// Lấy bảng xếp hạng theo điểm cao nhất
exports.getLeaderboard = async (req, res) => {
  try {
    const { examId, subject, educationLevel, limit = 10 } = req.query;

    const matchStage = {};
    if (examId) matchStage.exam = examId;

    // Nếu cần lọc theo môn hoặc khối thì join với Exam
    const pipeline = [
      { $match: matchStage },
      {
        $lookup: {
          from: 'exams',
          localField: 'exam',
          foreignField: '_id',
          as: 'examInfo'
        }
      },
      { $unwind: '$examInfo' },
      ...(subject ? [{ $match: { 'examInfo.subject': subject } }] : []),
      ...(educationLevel ? [{ $match: { 'examInfo.educationLevel': educationLevel } }] : []),
      {
        $group: {
          _id: '$user',
          maxScore: { $max: '$totalScore' },
          exam: { $first: '$exam' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      { $unwind: '$userInfo' },
      { $sort: { maxScore: -1 } },
      { $limit: parseInt(limit) }
    ];

    const leaderboard = await ExamResult.aggregate(pipeline);

    res.status(200).json({
      success: true,
      leaderboard
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Không thể lấy bảng xếp hạng!',
      error: error.message
    });
  }
};
