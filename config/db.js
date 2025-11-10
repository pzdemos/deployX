const { Pool } = require('pg');
require('dotenv').config();

// 创建 PostgreSQL 连接池
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  max: 20, // 连接池最大连接数
  idleTimeoutMillis: 30000, // 空闲连接超时时间
  connectionTimeoutMillis: 2000, // 连接超时时间
});

// 测试数据库连接
pool.on('connect', () => {
  console.log('✅ PostgreSQL 数据库连接成功');
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL 数据库连接错误:', err);
});

// 查询函数封装
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('执行查询', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('查询错误:', error);
    throw error;
  }
};

// 获取客户端（用于事务）
const getClient = async () => {
  const client = await pool.connect();
  const query = client.query.bind(client);
  const release = client.release.bind(client);
  
  // 设置超时
  const timeout = setTimeout(() => {
    console.error('客户端在池中空闲超过 10 秒，强制释放');
    client.release(true);
  }, 10000);
  
  client.release = () => {
    clearTimeout(timeout);
    return release();
  };
  
  return client;
};

module.exports = {
  query,
  getClient,
  pool
};

