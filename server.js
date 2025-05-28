import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

// Backend environment variables yükle
dotenv.config({ path: '.env.backend' });

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increased payload limit for large MRO data

// Google Generative AI instance
const genAI = new GoogleGenAI({ apiKey: process.env.VITE_GEMINI_API_KEY });

// API endpoint for Gemini
app.post('/api/gemini', async (req, res) => {
  try {
    const { prompt, data_context } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Final prompt'u hazırla
    const finalPrompt = prompt.replace('{data_context}', data_context || '');

    // API çağrısı yap - basit format
    const result = await genAI.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: finalPrompt
    });

    console.log('API Response:', result);

    // Response'u kontrol et
    let responseText;
    if (result.response && result.response.text) {
      responseText = await result.response.text();
    } else if (result.text) {
      responseText = result.text;
    } else if (typeof result === 'string') {
      responseText = result;
    } else {
      console.log('Unexpected response format:', result);
      responseText = 'API yanıtı beklenenden farklı formatta geldi.';
    }

    res.json({ response: responseText });

  } catch (error) {
    console.error('Gemini API Error:', error);
    res.status(500).json({ 
      error: 'API call failed', 
      details: error.message 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`🔑 API Key configured: ${process.env.VITE_GEMINI_API_KEY ? '✅' : '❌'}`);
});
