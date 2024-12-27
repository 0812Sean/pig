require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
app.use(express.json());
app.use(cors());

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.error('缺少 EMAIL_USER 或 EMAIL_PASS 环境变量，请在 .env 文件中设置');
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

app.post('/api/send-order', (req, res) => {
  const { items, message } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ error: '订单内容不能为空' });
  }

  const emailContent = `
    <h3>公主殿下明天想要的：</h3>
    <ul>
      ${items.map((item) => `<li>${item.category} - ${item.name}</li>`).join('')}
    </ul>
    <p><strong>公主殿下给你的留言：</strong> ${message || '没啥想跟你说的...'}</p>
  `;

  transporter.sendMail(
    {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: '小琛子接旨～',
      html: emailContent,
    },
    (err, info) => {
      if (err) {
        console.error('邮件发送失败:', err);
        return res.status(500).json({ error: '邮件发送失败' });
      }
      console.log('邮件发送成功:', info.response);
      res.status(200).json({ message: '旨意已下达～' });
    }
  );
});

app.use((err, req, res, next) => {
  console.error('未处理的错误:', err);
  res.status(500).json({ error: '服务器内部错误' });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`服务器运行在 http://localhost:${PORT}`));
