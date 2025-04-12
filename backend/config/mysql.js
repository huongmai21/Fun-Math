const { Sequelize, DataTypes } = require('sequelize'); // Thêm DataTypes
const config = require('./config');
require('dotenv').config();

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize({
  database: dbConfig.database,
  username: dbConfig.username,
  password: dbConfig.password,
  host: dbConfig.host,
  dialect: dbConfig.dialect,
  logging: dbConfig.logging,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Kết nối Sequelize thành công!');

    const User = require('../models/mysql/User')(sequelize, DataTypes); // Truyền DataTypes
    const Exam = require('../models/mysql/Exam')(sequelize, DataTypes); // Truyền DataTypes
    const ExamResult = require('../models/mysql/ExamResult')(sequelize, DataTypes); // Truyền DataTypes

    User.hasMany(ExamResult, { foreignKey: 'UserId', as: 'examResults' });
    Exam.hasMany(ExamResult, { foreignKey: 'ExamId', as: 'examResults' });
    ExamResult.belongsTo(User, { foreignKey: 'UserId', as: 'user' });
    ExamResult.belongsTo(Exam, { foreignKey: 'ExamId', as: 'exam' });

    console.log('Đã tải các mô hình và quan hệ. Sử dụng migrations để đồng bộ cơ sở dữ liệu.');
  } catch (err) {
    console.error('Lỗi kết nối Sequelize:', err);
    throw new Error('Không thể kết nối tới cơ sở dữ liệu');
  }
};

module.exports = { sequelize, connectDB };