// controllers/documentController.js
const Document = require('../models/Document');

// Lấy tất cả tài liệu (có lọc và phân trang)
exports.getAllDocuments = async (req, res) => {
  try {
    const { educationLevel, subject, documentType, search } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    // Xây dựng query
    let query = {};
    if (educationLevel) query.educationLevel = educationLevel;
    if (subject) query.subject = subject;
    if (documentType) query.documentType = documentType;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    const documents = await Document.find(query)
      .sort({ uploadedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'username fullName');

    const total = await Document.countDocuments(query);

    res.status(200).json({
      success: true,
      count: documents.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      documents
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Không thể lấy danh sách tài liệu!',
      error: error.message
    });
  }
};

// Lấy chi tiết một tài liệu
exports.getDocumentById = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate('author', 'username fullName');
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tài liệu!'
      });
    }

    // Tăng số lượt tải
    document.downloads += 1;
    await document.save();

    res.status(200).json({
      success: true,
      document
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Không thể lấy chi tiết tài liệu!',
      error: error.message
    });
  }
};

// Tạo tài liệu mới (admin và giáo viên)
exports.createDocument = async (req, res) => {
  try {
    // Kiểm tra quyền hạn
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền thực hiện hành động này!'
      });
    }

    const { title, description, fileUrl, thumbnail, educationLevel, subject, documentType, tags } = req.body;
    
    const newDocument = new Document({
      title,
      description,
      fileUrl,
      thumbnail,
      author: req.user.id,
      educationLevel,
      subject,
      documentType,
      tags
    });

    await newDocument.save();

    res.status(201).json({
      success: true,
      message: 'Tạo tài liệu thành công!',
      document: newDocument
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Tạo tài liệu thất bại!',
      error: error.message
    });
  }
};

// Cập nhật tài liệu
exports.updateDocument = async (req, res) => {
  try {
    const { title, description, fileUrl, thumbnail, educationLevel, subject, documentType, tags } = req.body;
    
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tài liệu!'
      });
    }

    // Kiểm tra quyền sửa tài liệu
    if (document.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền sửa tài liệu này!'
      });
    }

    const updatedDocument = await Document.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        fileUrl,
        thumbnail,
        educationLevel,
        subject,
        documentType,
        tags,
        updatedAt: Date.now()
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Cập nhật tài liệu thành công!',
      document: updatedDocument
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Cập nhật tài liệu thất bại!',
      error: error.message
    });
  }
};

// Xóa tài liệu
exports.deleteDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tài liệu!'
      });
    }

    // Kiểm tra quyền xóa tài liệu
    if (document.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xóa tài liệu này!'
      });
    }

    await Document.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Xóa tài liệu thành công!'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Xóa tài liệu thất bại!',
      error: error.message
    });
  }
};
