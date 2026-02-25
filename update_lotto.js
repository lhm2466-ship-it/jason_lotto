const fs = require('fs');

async function updateLottoData() {
    try {
        // 최신 회차 계산 (간소화)
        const firstDrawDate = new Date('2002-12-07T21:00:00+09:00');
        const now = new Date();
        const weeks = Math.floor((now - firstDrawDate) / (7 * 24 * 60 * 60 * 1000)) + 1;

        console.log(`Fetching data for round: ${weeks}`);
        
        // 동행복권 API 호출 (Node.js 환경이므로 fetch 사용 또는 https 모듈)
        const response = await fetch(`https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=${weeks}`);
        const data = await response.json();

        if (data.returnValue === 'success') {
            data.lastUpdate = new Date().toISOString();
            fs.writeFileSync('lotto_data.json', JSON.stringify(data, null, 4));
            console.log('Successfully updated lotto_data.json');
        } else {
            console.error('API Error:', data);
        }
    } catch (error) {
        console.error('Update failed:', error);
        process.exit(1);
    }
}

updateLottoData();
