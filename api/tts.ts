import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS 헤더
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { text } = req.query;

  if (!text || typeof text !== "string") {
    return res.status(400).json({ error: "text parameter is required" });
  }

  const apiKey = process.env.GOOGLE_TTS_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "API key not configured" });
  }

  try {
    const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input: { text },
        voice: {
          languageCode: "en-US",
          name: "en-US-Standard-D", // 남성 음성 (Standard)
        },
        audioConfig: {
          audioEncoding: "MP3",
          speakingRate: 0.9,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return res.status(response.status).json({ error: error.error?.message || "TTS API error" });
    }

    const data = await response.json();

    // Base64 오디오 데이터 반환
    res.setHeader("Content-Type", "audio/mp3");
    res.setHeader("Cache-Control", "public, max-age=31536000"); // 1년 캐싱
    const audioBuffer = Buffer.from(data.audioContent, "base64");
    return res.send(audioBuffer);
  } catch (error) {
    console.error("TTS Error:", error);
    return res.status(500).json({ error: "Failed to generate speech" });
  }
}
