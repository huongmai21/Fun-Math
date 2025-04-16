# Cấu trúc thư mục FE

frontend/
├── public/                  # Tài nguyên tĩnh
│   ├── index.html           # HTML chính
│   ├── favicon.ico          # Favicon
│   ├── manifest.json        # Web app manifest
│   ├── robots.txt           # Robots file
│   └── assets/              # Assets tĩnh
│       ├── images/          # Hình ảnh
│       └── icons/           # Icons
├── src/                     # Mã nguồn React
│   ├── assets/              # Assets cho ứng dụng
│   │   ├── images/          # Hình ảnh
│   │   ├── icons/           # Icons
│   │   └── styles/          # SCSS/CSS chung
│   ├── components/          # Components tái sử dụng
│   │   ├── common/          # Components dùng chung
│   │   │   ├── Button/      # Component button
│   │   │   ├── Card/        # Component card
│   │   │   ├── Modal/       # Component modal
│   │   │   └── ...
│   │   ├── layout/          # Components bố cục
│   │   │   ├── Header/      # Component header
│   │   │   ├── Footer/      # Component footer
│   │   │   ├── Sidebar/     # Component sidebar
│   │   │   └── ...
│   │   └── specific/        # Components đặc thù
│   │       ├── MathEditor/  # Editor toán học
│   │       ├── MathQuestion/ # Hiển thị câu hỏi toán
│   │       └── ...
│   ├── hooks/               # Custom hooks
│   │   ├── useAuth.js       # Hook xác thực
│   │   ├── useSocket.js     # Hook Socket.io
│   │   └── ...
│   ├── context/             # React context
│   │   ├── AuthContext.js   # Context xác thực
│   │   └── ...
│   ├── pages/               # Các trang
│   │   ├── Home/            # Trang chủ
│   │   ├── Auth/            # Trang đăng nhập/đăng ký
│   │   │   ├── Login.jsx    # Component đăng nhập
│   │   │   └── Register.jsx # Component đăng ký
│   │   ├── News/            # Trang tin tức
│   │   ├── Resources/       # Trang tài liệu
│   │   │   ├── Books.jsx    # Sách
│   │   │   ├── Journals.jsx # Tạp chí
│   │   │   └── ...
│   │   ├── Exams/           # Trang đề thi
│   │   ├── Forum/           # Trang góc chia sẻ/học tập
│   │   ├── StudyRoom/       # Trang phòng học
│   │   ├── Contests/        # Trang thi đấu
│   │   ├── Profile/         # Trang cá nhân
│   │   ├── Admin/           # Trang quản trị
│   │   └── ...
│   ├── services/            # Gọi API
│   │   ├── api.js           # Cấu hình axios
│   │   ├── authService.js   # API xác thực
│   │   ├── userService.js   # API user
│   │   ├── newsService.js   # API tin tức
│   │   └── ...
│   ├── utils/               # Utility functions
│   │   ├── formatters.js    # Định dạng dữ liệu
│   │   ├── validators.js    # Kiểm tra dữ liệu
│   │   ├── mathUtils.js     # Hàm hỗ trợ toán học
│   │   └── ...
│   ├── constants/           # Các hằng số
│   │   ├── routes.js        # Đường dẫn
│   │   ├── apiEndpoints.js  # Endpoints API
│   │   └── ...
│   ├── redux/               # State management (nếu dùng Redux)
│   │   ├── actions/         # Actions
│   │   ├── reducers/        # Reducers
│   │   ├── slices/          # Redux Toolkit slices
│   │   └── store.js         # Redux store
│   ├── App.jsx              # Component App chính
│   ├── index.jsx            # Entry point
│   └── routes.jsx           # Cấu hình routes
├── .env                     # Biến môi trường
├── .env.development         # Biến môi trường cho dev
├── .env.production          # Biến môi trường cho production
├── .gitignore               # Git ignore
├── package.json             # Dependencies
├── README.md                # Tài liệu frontend
├── jsconfig.json            # Cấu hình JavaScript
└── ...                      # Các file cấu hình khác


# Thiết lập FE (React)

- **Tạo ứng dụng React mới**
    npx create-react-app .

- **Cài đặt các dependencies cơ bản**
    npm install axios react-router-dom sass socket.io-client @mui/material @emotion/react @emotion/styled

- **Xóa các file không cần thiết**
    rm App.test.js logo.svg setupTests.js

- **Tạo các thư mục cần thiết**
    mkdir assets assets/images assets/styles components components/common components/layout context hooks pages pages/Home pages/Auth services utils constants


# Một số Công nghệ sử dụng

**1. Redux**
- store.js: cấu hình Redux Store
- authSlice.js: 