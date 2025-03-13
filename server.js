const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");

const app = express();
app.use(cors());
app.use(express.json());

// 設定 MySQL 連線
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "你的密碼",
  database: "myapp1"
});

// 連接 MySQL
db.connect(err => {
  if (err) {
    console.error("無法連接資料庫:", err);
  } else {
    console.log("成功連接 MySQL");
  }
});

// 註冊 API
app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).send("請填寫所有欄位");
  }

  // 密碼加密
  const hashedPassword = await bcrypt.hash(password, 10);

  const sql = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
  db.query(sql, [username, email, hashedPassword], (err, result) => {
    if (err) {
      console.error("註冊失敗:", err);
      return res.status(500).send("註冊失敗");
    }
    res.send("註冊成功");
  });
});

// 登入 API
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  const sql = "SELECT * FROM users WHERE email = ?";
  db.query(sql, [email], async (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, message: "伺服器錯誤" });
    }

    if (results.length === 0) {
      return res.status(401).json({ success: false, message: "帳號不存在" });
    }

    const user = results[0];
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ success: false, message: "密碼錯誤" });
    }

    res.json({ success: true, message: "登入成功" });
  });
});

// 監聽 3008 埠口
app.listen(3008, () => {
  console.log("伺服器運行於 http://localhost:3008");
});
