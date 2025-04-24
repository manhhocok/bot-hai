import TelegramBot from 'node-telegram-bot-api';
import axios from 'axios';

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const WEB_APP_URL = process.env.WEB_APP_URL;
const BOT_USERNAME = process.env.BOT_USERNAME;

const bot = new TelegramBot(TOKEN, { polling: false }); // Tắt polling nếu chỉ xử lý webhook

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { message } = req.body;
      const text = message.text ? message.text.toLowerCase() : '';
      const chatId = message.chat.id;

      if (text && text.includes(BOT_USERNAME.toLowerCase())) {
        const keyword = text.replace(BOT_USERNAME.toLowerCase(), '').trim();
        console.log(`Keyword: ${keyword}`);

        if (keyword) {
          const response = await axios.get(`${WEB_APP_URL}?keyword=${encodeURIComponent(keyword)}`);
          const data = response.data;
          console.log(`Data: ${JSON.stringify(data)}`);

          let reply;
          if (data && data.country) {
            reply = `Giá WiFi tại ${data.country} là:\n`;
            if (data.price_500mb) {
              reply += `- 500mb/ngày: ${Number(data.price_500mb).toLocaleString('vi-VN')}đ\n`;
            }
            if (data.price_1gb) {
              reply += `- 1Gb/ngày: ${Number(data.price_1gb).toLocaleString('vi-VN')}đ\n`;
            }
            if (data.price_3gb) {
              reply += `- 3Gb/ngày: ${Number(data.price_3gb).toLocaleString('vi-VN')}đ\n`;
            }
            if (data.price_5gb) {
              reply += `- 5Gb/ngày: ${Number(data.price_5gb).toLocaleString('vi-VN')}đ\n`;
            }
            if (data.discount) {
              reply += `Chiết khấu tối đa: ${data.discount}%`;
            }
          } else {
            reply = `Không tìm thấy thông tin giá WiFi cho '${keyword}'.`;
          }

          await bot.sendMessage(chatId, reply);
        } else {
          await bot.sendMessage(chatId, `Vui lòng cung cấp tên quốc gia hoặc mã, ví dụ: ${BOT_USERNAME} Nhật hoặc ${BOT_USERNAME} CN`);
        }
      }

      res.status(200).json({ status: 'ok' });
    } catch (error) {
      console.error(`Error: ${error.message}`);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
