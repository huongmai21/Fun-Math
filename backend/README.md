# Cấu trúc thư mục BE

backend/
├── config/                  # Cấu hình ứng dụng
│   ├── db.js                # Cấu hình kết nối MySQL
│   ├── mongo.js             # Cấu hình kết nối MongoDB
│   ├── auth.js              # Cấu hình xác thực JWT
│   └── app.js               # Cấu hình chung của Express
├── controllers/             # Logic xử lý các request
│   ├── authController.js    # Xử lý đăng nhập, đăng ký
│   ├── userController.js    # Quản lý người dùng
│   ├── newsController.js    # Quản lý tin tức
│   ├── resourceController.js # Quản lý tài liệu, sách
│   ├── examController.js    # Quản lý đề thi, kết quả
│   ├── forumController.js   # Quản lý góc chia sẻ, học tập
│   └── roomController.js    # Quản lý phòng học tập
├── middleware/              # Middleware
│   ├── auth.js              # Middleware xác thực
│   ├── roleCheck.js         # Kiểm tra phân quyền
│   ├── upload.js            # Xử lý upload file
│   └── errorHandler.js      # Xử lý lỗi
├── models/                  # Models ứng với database
│   ├── mysql/               # Models cho MySQL
│   │   ├── User.js          # Model người dùng
│   │   ├── Exam.js          # Model đề thi
│   │   └── Result.js        # Model kết quả thi
│   └── mongo/               # Models cho MongoDB
│       ├── News.js          # Model tin tức
│       ├── Post.js          # Model bài đăng
│       ├── Comment.js       # Model bình luận
│       ├── File.js          # Model file tài liệu
│       ├── Room.js          # Model phòng học
│       └── Message.js       # Model tin nhắn
├── routes/                  # Định nghĩa routes
│   ├── authRoutes.js        # Routes xác thực
│   ├── userRoutes.js        # Routes quản lý user
│   ├── newsRoutes.js        # Routes tin tức
│   ├── resourceRoutes.js    # Routes tài liệu
│   ├── examRoutes.js        # Routes đề thi
│   ├── forumRoutes.js       # Routes forum
│   └── roomRoutes.js        # Routes phòng học
├── services/                # Business logic
│   ├── authService.js       # Xử lý logic xác thực
│   ├── mailService.js       # Xử lý gửi email
│   ├── storageService.js    # Xử lý lưu trữ file (AWS S3/GCP)
│   └── socketService.js     # Xử lý Socket.io
├── utils/                   # Các hàm tiện ích
│   ├── validators.js        # Hàm kiểm tra dữ liệu
│   ├── helpers.js           # Các hàm hỗ trợ
│   └── constants.js         # Các hằng số
├── socket/                  # Xử lý Socket.io
│   ├── handlers/            # Xử lý các sự kiện socket
│   │   ├── chatHandler.js   # Xử lý chat
│   │   └── roomHandler.js   # Xử lý room
│   └── index.js             # Cấu hình Socket.io
├── public/                  # Thư mục public (nếu cần)
│   └── uploads/             # Upload tạm thời
├── .env                     # Biến môi trường
├── .env.development         # Biến môi trường cho dev
├── .env.production          # Biến môi trường cho production
├── .gitignore               # Git ignore
├── app.js                   # Entry point
├── server.js                # Khởi động server
├── package.json             # Dependencies
└── README.md                # Tài liệu backend

# Thiết lập BE (Node.js + Express)
- **Khởi tạo package.json**
    npm init -y

- **Cài đặt các dependencies cơ bản**
    npm install express mongoose mysql2 dotenv cors jsonwebtoken bcrypt socket.io

- **Cài đặt dependencies cho development**
    npm install --save-dev nodemon eslint

- npm install express-validator