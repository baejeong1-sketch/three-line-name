import Anthropic from '@anthropic-ai/sdk';

export default async function handler(req, res) {
    // CORS 헤더 설정
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    // OPTIONS 요청 처리
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // POST 요청만 허용
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { word } = req.body;

        // 입력 검증
        if (!word || typeof word !== 'string') {
            return res.status(400).json({ error: '단어를 입력해주세요.' });
        }

        if (word.length !== 3) {
            return res.status(400).json({ error: '정확히 3글자를 입력해주세요.' });
        }

        // API 키 확인
        if (!process.env.ANTHROPIC_API_KEY) {
            console.error('ANTHROPIC_API_KEY is not set');
            return res.status(500).json({ error: 'API 키가 설정되지 않았습니다.' });
        }

        // Anthropic 클라이언트 생성
        const client = new Anthropic({
            apiKey: process.env.ANTHROPIC_API_KEY,
        });

        // Claude API 호출 (Workbench에서 테스트한 설정 그대로 사용)
        const message = await client.messages.create({
            model: "claude-sonnet-4-5-20250929",
            max_tokens: 20000,
            temperature: 1,
            system: "당신은 삼행시 작가입니다.\n사용자가 입력한 3글자로 삼행시를 작성하세요.\n\n규칙:\n1. 각 글자로 시작하는 문장을 작성합니다\n2. 긍정적이고 유머러스한 톤을 유지합니다\n3. 각 줄은 자연스럽게 이어져야 합니다\n\n출력 형식 (반드시 이 형식만 출력):\n[첫번째글자]: [문장]\n[두번째글자]: [문장]\n[세번째글자]: [문장]\n\n주의: 삼행시 3줄만 출력하세요. 인사말, 설명, 부연설명 등 다른 텍스트는 절대 포함하지 마세요.",
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: word
                        }
                    ]
                }
            ]
        });

        // 응답에서 텍스트 추출
        const poemText = message.content[0]?.text || '';

        if (!poemText) {
            throw new Error('삼행시 생성에 실패했습니다.');
        }

        // 성공 응답
        return res.status(200).json({
            poem: poemText,
            word: word
        });

    } catch (error) {
        console.error('API Error:', error);

        // 에러 응답
        return res.status(500).json({
            error: error.message || '삼행시 생성 중 오류가 발생했습니다.'
        });
    }
}
