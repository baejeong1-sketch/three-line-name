document.addEventListener('DOMContentLoaded', () => {
    const wordInput = document.getElementById('wordInput');
    const generateBtn = document.getElementById('generateBtn');
    const resultArea = document.getElementById('resultArea');
    const resultContent = document.getElementById('resultContent');
    const errorArea = document.getElementById('errorArea');
    const errorMessage = document.getElementById('errorMessage');
    const loader = document.getElementById('loader');

    // 입력 필드에서 엔터키 처리
    wordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            generateBtn.click();
        }
    });

    // 생성 버튼 클릭 이벤트
    generateBtn.addEventListener('click', async () => {
        const word = wordInput.value.trim();

        // 유효성 검사
        if (!word) {
            showError('단어를 입력해주세요!');
            return;
        }

        if (word.length !== 3) {
            showError('정확히 3글자를 입력해주세요!');
            return;
        }

        // UI 상태 변경
        hideError();
        hideResult();
        setLoading(true);

        try {
            // API 호출
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ word }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || '서버 오류가 발생했습니다.');
            }

            const data = await response.json();

            if (data.poem) {
                showResult(data.poem);
            } else {
                throw new Error('삼행시 생성에 실패했습니다.');
            }
        } catch (error) {
            console.error('Error:', error);
            showError(error.message || '삼행시 생성 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    });

    // UI 헬퍼 함수들
    function setLoading(loading) {
        if (loading) {
            generateBtn.disabled = true;
            generateBtn.classList.add('loading');
            wordInput.disabled = true;
            loader.classList.remove('hidden');
        } else {
            generateBtn.disabled = false;
            generateBtn.classList.remove('loading');
            wordInput.disabled = false;
            loader.classList.add('hidden');
        }
    }

    function showResult(poem) {
        resultContent.textContent = poem;
        resultArea.classList.remove('hidden');
    }

    function hideResult() {
        resultArea.classList.add('hidden');
    }

    function showError(message) {
        errorMessage.textContent = message;
        errorArea.classList.remove('hidden');
    }

    function hideError() {
        errorArea.classList.add('hidden');
    }
});
