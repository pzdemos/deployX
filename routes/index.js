const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', (req, res, next) => {
  res.send({ title: 'Express' });
});

// 数据库查询示例
router.get('/test-db', async (req, res, next) => {
  try {
    // 示例：查询当前时间
    const result = await db.query('SELECT NOW() as current_time');
    res.json({
      success: true,
      message: '数据库连接成功',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('数据库查询错误:', error);
    res.status(500).json({
      success: false,
      message: '数据库查询失败',
      error: error.message
    });
  }
});

module.exports = router;
