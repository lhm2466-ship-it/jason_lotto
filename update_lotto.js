const fs = require('fs');

async function updateLottoData() {
    try {
        // 1. 기존 데이터 로드
        let lastData = { drwNo: 0 };
        if (fs.existsSync('lotto_data.json')) {
            lastData = JSON.parse(fs.readFileSync('lotto_data.json', 'utf8'));
        }

        // 2. 최신 회차 계산 (2002-12-07 1회차 기준)
        const firstDrawDate = new Date('2002-12-07T21:00:00+09:00');
        const now = new Date();
        // 9시간(KST)을 더한 후 일주일 단위로 계산하여 현재 기준 진행된 회차 산출
        const expectedRound = Math.floor((now - firstDrawDate) / (7 * 24 * 60 * 60 * 1000)) + 1;

        console.log(`Current local round in file: ${lastData.drwNo}`);
        console.log(`Expected latest round: ${expectedRound}`);

        const targetRound = lastData.drwNo + 1;

        if (targetRound > expectedRound + 1) {
            console.log('Data is already up to date or beyond expected.');
            return;
        }

        console.log(`Attempting to fetch data for round: ${targetRound}`);
        
        // 동행복권 API 호출 (브라우저인 것처럼 보이도록 헤더 추가)
        const response = await fetch(`https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=${targetRound}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/json, text/javascript, */*; q=0.01',
                'X-Requested-With': 'XMLHttpRequest'
            }
        });
        
        // 응답 텍스트를 먼저 받아와서 JSON인지 확인 (보안장치나 에러 페이지 대응)
        const text = await response.text();
        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            console.log(`Failed to parse JSON for round ${targetRound}. Response was not JSON.`);
            console.log('Response preview:', text.substring(0, 200));
            return;
        }

        if (data.returnValue === 'success') {
            data.lastUpdate = new Date().toISOString();
            fs.writeFileSync('lotto_data.json', JSON.stringify(data, null, 4));
            console.log(`Successfully updated lotto_data.json to round ${targetRound}`);
        } else {
            console.log(`Round ${targetRound} is not yet available. API response:`, data.returnValue);
            // 만약 현재 회차가 이미 최신이면 종료, 아니면 에러로 처리하여 재시도 유도 가능
            if (targetRound <= expectedRound) {
                 // 예상되는 회차임에도 데이터가 없다면 에러 발생 (GitHub Actions에서 실패로 표시됨)
                 // throw new Error(`Expected round ${targetRound} is missing!`);
            }
        }
    } catch (error) {
        console.error('Update failed:', error);
        process.exit(1);
    }
}

updateLottoData();
