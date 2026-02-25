const express = require("express");
const cors = require("cors");
const Groq = require("groq-sdk");
const axios = require("axios");
const path = require("path");
const md5 = require("md5");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const app = express();

// //认证相关的路由
// app.use(session({
//   secret: 'your secret key',
//   resave: false,
//   saveUninitialized: true,
//   cookie: { secure: false } // 如果使用 HTTPS，设置为 true
// }));

app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, "../frontend")));

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || true,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/Main.html"));
});

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "placeholder",
});

app.post("/api/generate", async (req, res) => {
  try {
    const { prompt } = req.body;
    const response = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.1-70b-versatile",
      max_tokens: 8000,
    });
    res.json({ data: response.choices[0]?.message?.content });
  } catch (error) {
    console.error("Error calling Groq API:", error);
    res.status(500).json({ error: error.message });
  }
});

const BAIDU_APP_ID = process.env.BAIDU_APP_ID;
const BAIDU_SECRET_KEY = process.env.BAIDU_SECRET_KEY;

// app.post("/api/translate", async (req, res) => {
//   const { text, from, to } = req.body;
//   const salt = Date.now();
//   const sign = md5(BAIDU_APP_ID + text + salt + BAIDU_SECRET_KEY);

//   try {
//     const response = await axios.get(
//       "https://fanyi-api.baidu.com/api/trans/vip/translate",
//       {
//         params: {
//           q: text, // 这里不进行URL编码
//           from,
//           to,
//           appid: BAIDU_APP_ID,
//           salt,
//           sign,
//         },
//         paramsSerializer: (params) => {
//           return Object.keys(params)
//             .map((key) => `${key}=${encodeURIComponent(params[key])}`)
//             .join("&");
//         },
//       }
//     );
//     res.json(response.data);
//   } catch (error) {
//     console.error("Translation error:", error);
//     res.status(500).json({ error: "Translation failed" });
//   }
// });

const GOOGLE_TRANSLATE_API_URL =
  "https://translation.googleapis.com/language/translate/v2";
const API_KEY = process.env.Google_API_KEY; // 替换为您的 API 密钥

// app.post('/api/translate', async (req, res) => {
//   const { text, source = 'auto', target = 'zh-CN' } = req.body;
//   console.log('Received translation request:', { text, source, target });

//   try {
//       const response = await axios.post(`${GOOGLE_TRANSLATE_API_URL}?key=${API_KEY}`, {
//           q: text,
//           source: source,
//           target: target,
//           format: 'text'
//       });

//       const translatedText = response.data.data.translations[0].translatedText;
//       console.log('Translated text:', translatedText);
//       res.json({ translatedText });
//   } catch (error) {
//       console.error('Translation error:', error.response ? error.response.data : error.message);
//       res.status(500).json({ error: 'Translation failed', originalText: text });
//   }
// });

app.post("/api/translate", async (req, res) => {
  const { text } = req.body;

  try {
    const response = await axios.post(
      `${GOOGLE_TRANSLATE_API_URL}?key=${API_KEY}`,
      {
        q: text,
        target: "zh-CN", // 中文（简体）
        format: "text",
      }
    );

    const translatedText = response.data.data.translations[0].translatedText;
    res.json({ translatedText });
  } catch (error) {
    console.error(
      "Error:",
      error.response ? error.response.data : error.message
    );
    res.status(500).json({ error: "Translation failed" });
  }
});

app.post("/api/convai", async (req, res) => {
  console.log("Received request to /api/convai");
  console.log("Request body:", req.body);

  const { prompt, sessionID, charID, voiceResponse } = req.body;
  const apiKey = process.env.CONVAI_API_KEY;

  const formData = new URLSearchParams();
  formData.append("userText", prompt);
  formData.append("charID", charID);
  formData.append("sessionID", sessionID);
  formData.append("voiceResponse", voiceResponse.toString());

  try {
    const response = await axios.post(
      "https://api.convai.com/character/getResponse",
      formData,
      {
        headers: {
          "CONVAI-API-KEY": apiKey,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error("Error in /api/convai:", error);
    res
      .status(500)
      .json({ error: "An error occurred", details: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
