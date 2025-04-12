// models/mysql/User.js
const { pool } = require('../../config/db');
const bcrypt = require('bcrypt');

class User {
  // Tạo bảng User nếu chưa tồn tại
  static async initialize() {
    const connection = await pool.getConnection();
    try {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          username VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL,
          role ENUM('admin', 'teacher', 'student') DEFAULT 'student',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          avatar VARCHAR(255) NULL
        )
      `);
      console.log('Bảng users đã được khởi tạo');
    } catch (error) {
      console.error('Lỗi khởi tạo bảng users:', error);
    } finally {
      connection.release();
    }
  }

  // Tạo user mới
  static async create(userData) {
    const { name, email, password, role = 'student' } = userData;
    
    // Mã hóa mật khẩu
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.query(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        [name, email, hashedPassword, role]
      );
      
      const [user] = await connection.query(
        'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
        [result.insertId]
      );
      
      return user[0];
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }

  // Tìm user theo email
  static async findByEmail(email) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query('SELECT * FROM users WHERE email = ?', [email]);
      return rows[0] || null;
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }

  // Tìm user theo id
  static async findById(id) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query(
        'SELECT id, name, email, role, created_at FROM users WHERE id = ?', 
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = User;