import { AiEncouragement, EmotionType } from '../types/diary';

/**
 * Requests warm AI encouragement and next-day positive action from Gemini.
 * First tries the secure server endpoint `/api/gemini/warm-reply`.
 * If running on a static host (e.g. Vercel static) with VITE_GEMINI_API_KEY set,
 * it falls back to the client-side REST endpoint.
 */
export async function generateAiEncouragement(
  diary: string,
  emotion: EmotionType,
  date?: string
): Promise<AiEncouragement> {
  const payload = {
    diary,
    emotion,
    date: date || new Date().toISOString().split('T')[0],
  };

  // 1. Try server-side API (Best practice in AI Studio & Node environments)
  try {
    const res = await fetch('/api/gemini/warm-reply', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.comfortMessage && data.actionSuggestion) {
        return {
          ...data,
          createdAt: new Date().toISOString(),
        } as AiEncouragement;
      }
    } else {
      const errorJson = await res.json().catch(() => null);
      console.warn('[Gemini Client] Server returned non-ok status:', res.status, errorJson);
    }
  } catch (err) {
    console.warn('[Gemini Client] Server endpoint call failed, checking client fallback:', err);
  }

  // 2. Client-side fallback if VITE_GEMINI_API_KEY is configured (e.g., static Vercel deployment)
  const clientApiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (clientApiKey && clientApiKey.length > 5) {
    try {
      return await callGeminiClientDirect(diary, emotion, clientApiKey);
    } catch (err) {
      console.error('[Gemini Client] Direct API call error:', err);
    }
  }

  // 3. Dynamic personalized fallback based on user's actual diary content (never static repetitive text)
  return getPersonalizedDynamicFallback(emotion, diary);
}

/**
 * Direct Gemini REST call using VITE_GEMINI_API_KEY (for static Vercel hosting)
 * Uses modern active model gemini-3.1-flash-lite
 */
async function callGeminiClientDirect(
  diary: string,
  emotion: EmotionType,
  apiKey: string
): Promise<AiEncouragement> {
  const prompt = `당신은 지친 하루를 보낸 사람들의 마음을 따스하게 안아주는 다정하고 사려 깊은 AI 일기 비서 '마음이'입니다.
사용자가 오늘 적은 일기와 선택한 감정을 읽고, 깊은 공감과 따뜻한 위로, 그리고 내일을 위한 긍정적이고 실천 가능한 작은 행동 1가지를 제안해 주세요.

[중요 지침]:
- 절대 상투적이고 똑같은 뻔한 말을 반복하지 마세요.
- 일기 속 구체적인 단어, 사건, 사람, 감정을 반드시 직접 언급하여 진솔하게 위로해주세요.

[사용자의 오늘 감정]: ${emotion}
[사용자의 오늘 일기]:
${diary}

반드시 아래 JSON 형식으로만 응답해 주세요. 다른 마크다운 백틱 없이 순수 JSON만 출력하세요:
{
  "comfortMessage": "사용자의 일기 속 구체적인 내용을 직접 언급하며 깊이 공감하고 위로하는 다정한 편지 (2~3문단, 경어체)",
  "actionSuggestion": {
    "title": "내일을 위한 가벼운 긍정 행동 1가지 (일기 내용과 맞춤 연계)",
    "description": "왜 이 행동이 내일 도움이 되는지 구체적이고 다정한 설명",
    "icon": "행동과 어울리는 이모지 (예: ☕, 🌿, 🚶, 🌅, 🎧, 🪟)"
  },
  "quote": "마음을 지탱해 줄 따뜻한 한 줄 문장",
  "sentimentInsight": "오늘 마음 상태를 요약한 다정한 한 마디"
}`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.95,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini API returned ${response.status}: ${await response.text()}`);
  }

  const json = await response.json();
  const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty response from Gemini');

  const parsed = JSON.parse(text);
  return {
    comfortMessage: parsed.comfortMessage,
    actionSuggestion: parsed.actionSuggestion,
    quote: parsed.quote || '오늘의 당신은 그 자체로 충분히 빛났습니다.',
    sentimentInsight: parsed.sentimentInsight || `${emotion}의 하루를 보낸 당신에게`,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Dynamic personalized generator based on the user's specific diary words
 * Used only if all external network/API keys are temporarily unavailable,
 * ensuring each response is unique and dynamically tailored to the user's actual text.
 */
function getPersonalizedDynamicFallback(emotion: EmotionType, diary: string): AiEncouragement {
  const cleanDiary = diary.trim();
  const sentences = cleanDiary
    .split(/[.!?\n]+/)
    .map(s => s.trim())
    .filter(s => s.length > 3);

  const firstSentence = sentences[0] || '오늘 하루 있었던 일';
  const lastSentence = sentences.length > 1 ? sentences[sentences.length - 1] : firstSentence;

  // Extract key emotional or contextual words from diary
  const words = cleanDiary.split(/\s+/).filter(w => w.length >= 2);
  const sampleWord = words.find(w => !['그리고', '그래서', '하지만', '오늘', '내가', '너무'].includes(w)) || '하루';

  const emotionTailored = {
    기쁨: {
      opener: `"${firstSentence}"라는 구절을 읽으며, 오늘 하루 당신의 입가에 피어났을 환한 미소가 눈앞에 그려졌어요.`,
      body: `'${sampleWord}'와(과) 함께 느꼈던 그 기분 좋은 온기는 오늘의 값진 선물입니다. 기쁨은 마음속에 차곡차곡 쌓여 앞으로의 힘든 순간들을 이겨낼 수 있는 든든한 등대가 되어줄 거예요.\n\n이 벅차고 행복한 마음을 마음에 고이 간직해보세요. 당신이 누릴 자격이 충분한 행복입니다.`,
      actionTitle: `오늘 느낀 '${sampleWord}'의 기쁨 한 조각 기록해두기`,
      actionDesc: '오늘 가장 짜릿하고 감사했던 한 장면을 마음에 새기며, 내일도 기분 좋은 활력으로 하루를 시작해보세요.',
      icon: '✨',
      quote: '행복은 거창한 곳이 아닌, 오늘 발견한 작은 미소 속에 머뭅니다.',
      insight: `'${sampleWord}' 속에서 반짝인 기쁨의 하루`,
    },
    지침: {
      opener: `"${firstSentence}"... 일기에 적어주신 이 짧은 문장 속에서 오늘 하루 짊어졌던 무게와 숨 가빴던 순간들이 고스란히 전해져 옵니다.`,
      body: `'${sampleWord}' 때문에 애쓰고 온 힘을 다해 버텨내느라 정말 수고 많으셨어요. "${lastSentence}"라는 마음이 들기까지 얼마나 많은 에너지를 쏟아부었을지 짐작이 되어 마음이 뭉클합니다.\n\n오늘 밤만큼은 그 어떤 걱정도, 앞으로 해야 할 일도 모두 내려놓으세요. 당신은 이미 오늘을 충실하게 살아낸 것만으로도 충분히 위대합니다.`,
      actionTitle: '내일 아침 나만을 위한 5분간의 온전한 쉼',
      actionDesc: '내일 아침 알람이 울려도 바로 서두르지 말고, 따뜻한 물 한 모금 마시며 깊게 세 번 숨을 들이쉬고 내쉬어 보세요.',
      icon: '🍵',
      quote: '지쳤다는 건 당신이 오늘 하루 온 마음을 다해 살아냈다는 가장 정직한 증거입니다.',
      insight: `치열했던 '${sampleWord}'의 시간을 지나 포근한 쉼이 필요한 밤`,
    },
    설렘: {
      opener: `"${firstSentence}"라는 말을 읽는 순간, 제 마음까지 콩닥콩닥 두근거리기 시작했어요!`,
      body: `'${sampleWord}'(으)로 가득 찬 설레는 기대감은 평범했던 일상을 반짝이는 모험으로 바꾸어주죠. "${lastSentence}"라는 생각에 잠 못 이루고 계신 건 아닌가요?\n\n이 벅찬 기운을 온전히 누려보세요. 설레는 마음으로 기다리는 내일은 분명 오늘보다 더 멋진 풍경을 선물해 줄 거예요.`,
      actionTitle: '내일 가장 기대되는 순간 상상하며 미소 짓기',
      actionDesc: '내일 찾아올 가장 반짝이는 한 순간을 구체적으로 떠올려보고, 그 순간이 다가왔을 때 마음속으로 나 자신을 힘껏 응원해주세요.',
      icon: '🎈',
      quote: '설렘은 마음의 창문을 열어 새로운 빛을 들이는 가장 아름다운 감정입니다.',
      insight: `'${sampleWord}'이(가) 가져다준 가슴 벅찬 설렘`,
    },
    불안: {
      opener: `"${firstSentence}"라고 솔직하게 마음을 꺼내놓아 주셔서 고마워요. 이 문장을 적기까지 마음속이 얼마나 소란스러웠을까요.`,
      body: `'${sampleWord}'에 대한 걱정과 불안 때문에 가슴이 답답하고 숨이 가쁘셨을지도 몰라요. "${lastSentence}"라는 생각으로 불안의 파도가 칠 땐, 그 파도와 싸우려 하지 말고 잠시 가만히 바라보아 주세요.\n\n불안은 당신이 소중한 무언가를 지키고 싶어 하는 마음에서 피어난 자연스러운 감정입니다. 지금 이 순간 당신은 안전하고, 당신에게는 이 상황을 지혜롭게 마주할 힘이 분명히 있습니다.`,
      actionTitle: '가슴에 손을 얹고 4-7-8 온기 호흡하기',
      actionDesc: '내일 문득 걱정이 밀려올 때, 오른손을 가슴 중앙에 얹고 4초 들이마시고 7초 멈춘 뒤 8초 동안 천천히 내쉬어 보세요. 마음에 따뜻한 평온이 깃듭니다.',
      icon: '🌿',
      quote: '우리를 두렵게 하는 것은 미래 자체가 아니라, 미래에 대한 우리의 생각일 뿐입니다.',
      insight: `'${sampleWord}'의 불안을 지나 평온을 찾아가는 여정`,
    },
  }[emotion];

  return {
    comfortMessage: `${emotionTailored.opener}\n\n${emotionTailored.body}`,
    actionSuggestion: {
      title: emotionTailored.actionTitle,
      description: emotionTailored.actionDesc,
      icon: emotionTailored.icon,
    },
    quote: emotionTailored.quote,
    sentimentInsight: emotionTailored.insight,
    createdAt: new Date().toISOString(),
  };
}
