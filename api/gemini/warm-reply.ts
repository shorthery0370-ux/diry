import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from '@google/genai';

// Candidate models in priority order
const CANDIDATE_MODELS = ['gemini-3.1-flash-lite', 'gemini-3.8-flash'];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers for Vercel
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { diary, emotion, date } = req.body || {};

  if (!diary || typeof diary !== 'string') {
    return res.status(400).json({ error: '일기 내용을 입력해주세요.' });
  }

  const validEmotion = emotion || '기쁨';
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return res.status(503).json({
      error: 'GEMINI_API_KEY 환경변수가 설정되지 않았습니다. Vercel 프로젝트 환경 변수를 확인해주세요.',
    });
  }

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  const prompt = `사용자가 오늘 작성한 하루 일기입니다:
- 오늘 느낀 주된 감정: [${validEmotion}]
- 작성 날짜: ${date || '오늘'}
- 사용자의 솔직한 일기 내용:
"""
${diary}
"""

[지침 사항]:
당신은 지친 현대인의 마음을 가장 따스하게 어루만져 주는 공감형 AI 일기 비서 '마음이'입니다.
1. [다정한 위로와 공감]:
   - 상투적이고 뻔한 일반론적인 말은 절대 하지 마세요.
   - 사용자의 일기에 나오는 **구체적인 사건, 등장인물, 상황, 대화, 고민거리**를 반드시 직접 인용하거나 언급하며 반응해주세요.
   - 사용자가 느꼈을 감정의 굴곡을 깊이 인정해주고, 2~3문단으로 따뜻하고 정중한 어조(경어체)로 마음을 보듬어주세요.
2. [내일을 위한 긍정 행동 1가지]:
   - 오늘 일기 속 사건 및 감정(${validEmotion})과 직결되는 맞춤형 행동이어야 합니다.
   - 거창하지 않고 내일 아침이나 일상 중 5~10분 안에 누구나 기분 좋게 실천할 수 있는 구체적인 행동을 제안하세요.
   - 어울리는 대표 이모지를 하나 지정하세요.
3. [따뜻한 한 줄 명언/격언]:
   - 마음에 깊은 위로와 용기를 주는 감성적인 한 문장을 작성해주세요.
4. [오늘의 마음 통찰]:
   - 오늘 사용자의 심리 상태와 하루를 요약하는 부드러운 한 마디를 적어주세요.`;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      comfortMessage: {
        type: Type.STRING,
        description: '일기 속 사건을 직접 언급하며 깊이 위로하고 공감하는 2~3문단의 따뜻한 편지',
      },
      actionSuggestion: {
        type: Type.OBJECT,
        properties: {
          title: {
            type: Type.STRING,
            description: '내일을 위한 구체적이고 부담 없는 긍정 행동 제목',
          },
          description: {
            type: Type.STRING,
            description: '행동의 실천 방법과 왜 내일에 도움이 되는지 다정한 설명',
          },
          icon: {
            type: Type.STRING,
            description: '어울리는 이모지 한 글자 (예: ☕, 🌿, 🚶, 🌅, 🎧, 🪟)',
          },
        },
        required: ['title', 'description', 'icon'],
      },
      quote: {
        type: Type.STRING,
        description: '마음에 잔잔한 여운을 남기는 따뜻한 한 줄 응원 문장',
      },
      sentimentInsight: {
        type: Type.STRING,
        description: '오늘 마음 상태를 따스하게 짚어주는 한 문장 통찰',
      },
    },
    required: ['comfortMessage', 'actionSuggestion', 'quote', 'sentimentInsight'],
  };

  let lastError: any = null;

  for (const model of CANDIDATE_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          systemInstruction: '당신은 사용자의 일기 속 구체적인 내용을 세심하게 포착하여 세상에서 가장 다정하고 진솔한 위로를 건네는 한국어 일기 비서입니다. 매번 판에 박힌 복사/붙여넣기식 답변을 엄격히 금지합니다.',
          responseMimeType: 'application/json',
          responseSchema,
          temperature: 0.95,
        },
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error('Empty response from model ' + model);
      }

      const parsedData = JSON.parse(responseText);
      return res.status(200).json({
        ...parsedData,
        modelUsed: model,
      });
    } catch (err: any) {
      lastError = err;
    }
  }

  return res.status(500).json({
    error: 'AI 응답을 생성하는 중 일시적인 지연이 발생했습니다.',
    details: lastError?.message || 'Unknown error',
  });
}
