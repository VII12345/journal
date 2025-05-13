// server.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const mysql = require('mysql2/promise');

const app = express();
app.use(express.json()); // 解析 JSON 请求体

// 数据库连接配置
const pool = mysql.createPool({
    host: 'localhost',
    user: 'your_username',
    password: 'your_password',
    database: 'travel_journal',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// 使用 diskStorage 自定义存储规则，保留扩展名
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        // 从原始文件名中获取扩展名
        const ext = path.extname(file.originalname);
        // 使用时间戳＋扩展名作为新的文件名（可以根据需求做更复杂的处理）
        cb(null, `${Date.now()}${ext}`);
    }
});

const upload = multer({ storage });

// 使用 upload.fields 支持同时接收 "photo" 和 "video" 字段
app.post('/upload', upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'video', maxCount: 1 }
]), (req, res) => {
    console.log('收到上传请求');
    // req.files 是一个对象，格式如：
    // { photo: [ fileObject ], video: [ fileObject ] }
    let responseData = {};

    if (req.files && req.files['photo']) {
        // 如果上传的是图片，返回 imageUrl
        const file = req.files['photo'][0];
        // 注意：确保 IP 和端口与客户端请求地址保持一致
        const imageUrl = `http://10.0.2.2:8080/uploads/${file.filename}`;
        responseData.imageUrl = imageUrl;
        console.log('图片上传成功:', responseData);
    } else if (req.files && req.files['video']) {
        // 如果上传的是视频，返回 videoUrl
        const file = req.files['video'][0];
        const videoUrl = `http://10.0.2.2:8080/uploads/${file.filename}`;
        responseData.videoUrl = videoUrl;
        console.log('视频上传成功:', responseData);
    } else {
        console.log('没有上传任何文件');
        return res.status(400).json({ error: 'No file uploaded' });
    }

    res.json(responseData);
});

// 注册接口
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: '用户名和密码不能为空' });
    }
    try {
        const [rows] = await pool.execute('SELECT * FROM users WHERE username = ?', [username]);
        if (rows.length > 0) {
            return res.status(409).json({ error: '用户名已存在' });
        }
        await pool.execute('INSERT INTO users (username, password) VALUES (?, ?)', [username, password]);
        res.status(201).json({ message: '注册成功' });
    } catch (error) {
        console.error('注册出错:', error);
        res.status(500).json({ error: '注册失败，请稍后重试' });
    }
});

// 登录接口
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: '用户名和密码不能为空' });
    }
    try {
        const [rows] = await pool.execute('SELECT * FROM users WHERE username = ? AND password = ?', [username, password]);
        if (rows.length === 0) {
            return res.status(401).json({ error: '用户名或密码错误' });
        }
        res.status(200).json({ message: '登录成功' });
    } catch (error) {
        console.error('登录出错:', error);
        res.status(500).json({ error: '登录失败，请稍后重试' });
    }
});

// 提供静态文件服务，便于客户端访问上传后的文件
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 监听 8080 端口（确保客户端请求地址为 http://10.0.2.2:8080）
app.listen(8080, () => {
    console.log('Server listening on http://10.0.2.2:8080');
});