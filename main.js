// 정책 모달 관련 데이터 및 함수
const policyData = {
    privacy: `
        <h2>개인정보처리방침</h2>
        <p>JASON LOTTO는 이용자의 개인정보를 중요하게 생각하며, 관련 법령을 준수합니다.</p>
        <p>1. <strong>수집 항목:</strong> 본 사이트는 별도의 회원가입 없이 이용 가능하며, 이용자의 개인정보를 서버에 저장하지 않습니다.</p>
        <p>2. <strong>브라우저 저장소:</strong> 사용자가 선택한 테마 정보 및 로또 당첨 번호 캐시 데이터를 브라우저의 로컬 스토리지(LocalStorage)에 저장하여 서비스 편의를 제공합니다. 이 데이터는 이용자의 기기에만 존재합니다.</p>
        <p>3. <strong>타사 서비스:</strong> 본 사이트는 통계 분석 및 광고 제공을 위해 Google AdSense, Disqus를 이용할 수 있으며, 이 과정에서 쿠키가 사용될 수 있습니다.</p>
    `,
    terms: `
        <h2>이용약관</h2>
        <p>제이슨 로또(이하 '서비스')의 이용과 관련하여 안내드립니다.</p>
        <p>1. <strong>서비스 목적:</strong> 본 서비스는 로또 6/45의 과거 당첨 데이터를 기반으로 한 확률 가중치 기반 번호 생성 도구입니다.</p>
        <p>2. <strong>책임 한계:</strong> 본 서비스에서 생성된 번호는 통계적 수치에 기반한 참고용일 뿐이며, 실제 당첨을 보장하지 않습니다. 로또 구매의 책임은 본인에게 있으며, 낙첨으로 인한 어떠한 손해에 대해서도 서비스는 책임을 지지 않습니다.</p>
        <p>3. <strong>무단 복제 금지:</strong> 서비스의 디자인 및 알고리즘 구현 방식을 무단으로 복제하여 상업적으로 이용하는 것을 금지합니다.</p>
    `
};

function openPolicy(type) {
    document.getElementById('policyText').innerHTML = policyData[type];
    document.getElementById('policyModal').style.display = 'block';
}

function closePolicy() {
    document.getElementById('policyModal').style.display = 'none';
}

const weights = [0.021703217032170324, 0.021687679317257508, 0.022014022014022016, 0.02167214160434469, 0.021625516999719178, 0.02181197603220672, 0.021780891582061608, 0.021641059395187722, 0.02171875952932918, 0.02172653077790861, 0.021742073275067466, 0.02188968851800101, 0.02181197603220672, 0.021749844523646892, 0.021742073275067466, 0.02184306054817112, 0.021749844523646892, 0.02181197603220672, 0.02177312033348218, 0.021641059395187722, 0.02184306054817112, 0.021710988280749755, 0.021687679317257508, 0.02177312033348218, 0.021625516999719178, 0.021749844523646892, 0.021765349084902753, 0.021757596804274823, 0.02171875952932918, 0.021780891582061608, 0.021757596804274823, 0.0216799104608011, 0.021796434079220464, 0.021788662830641038, 0.021780891582061608, 0.021757596804274823, 0.021742073275067466, 0.02184306054817112, 0.021757596804274823, 0.021695450565836935, 0.021710988280749755, 0.021757596804274823, 0.02171875952932918, 0.021710988280749755, 0.021819747280786146];

let selectedNumbers = [];
let lastGenerated = null; 
let gameModes = ['자동', '자동', '자동', '자동', '자동'];

(function init() {
    const grid = document.getElementById('numberGrid');
    if (grid) {
        for (let i = 1; i <= 45; i++) {
            let btn = document.createElement('button');
            btn.className = 'num-btn';
            btn.innerText = i;
            btn.onclick = function() { toggleNumber(i, btn); };
            grid.appendChild(btn);
        }
    }
    
    // 테마 초기화
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        const toggleBtn = document.getElementById('themeToggle');
        if (toggleBtn) toggleBtn.innerText = '☀️';
    }

    // 지난주 당첨 번호 실시간 업데이트
    updateWinningNumbers();

    renderBalls();
})();

async function updateWinningNumbers() {
    const drawInfoEl = document.getElementById('drawInfo');
    const ballsContainer = document.getElementById('winningBalls');
    const bonusContainer = document.getElementById('bonusBallContainer');

    if (!drawInfoEl) return;

    // 1. 로컬 저장소(브라우저 캐시) 우선 확인
    const cachedData = localStorage.getItem('lotto_cache');
    if (cachedData) {
        try {
            const parsed = JSON.parse(cachedData);
            renderWinningNumbers(parsed);
        } catch (e) {
            console.error('캐시 파싱 에러:', e);
        }
    }

    // 2. 서버(저장소)의 lotto_data.json 파일 로드
    try {
        const response = await fetch(`./lotto_data.json?t=${new Date().getTime()}`);
        if (!response.ok) throw new Error('Network response was not ok');
        
        const data = await response.json();

        if (data.returnValue === 'success' || data.drwNo) {
            renderWinningNumbers(data);
            localStorage.setItem('lotto_cache', JSON.stringify(data));
        }
    } catch (error) {
        console.error('데이터 로드 실패:', error);
        if (!cachedData) {
            const fallback = { drwNo: 1212, drwNoDate: '2026-02-21', drwtNo1: 5, drwtNo2: 8, drwtNo3: 25, drwtNo4: 31, drwtNo5: 41, drwtNo6: 44, bnusNo: 45 };
            renderWinningNumbers(fallback, true);
        }
    }
}

function renderWinningNumbers(data, isFallback = false) {
    const drawInfoEl = document.getElementById('drawInfo');
    const ballsContainer = document.getElementById('winningBalls');
    const bonusContainer = document.getElementById('bonusBallContainer');

    if (drawInfoEl) drawInfoEl.innerText = `제 ${data.drwNo}회 (${data.drwNoDate})${isFallback ? ' *' : ''}`;
    
    const numbers = [data.drwtNo1, data.drwtNo2, data.drwtNo3, data.drwtNo4, data.drwtNo5, data.drwtNo6];
    if (ballsContainer) {
        ballsContainer.innerHTML = numbers
            .map(num => `<span class="ball ${getBallColorClass(num)}">${num}</span>`)
            .join('');
    }

    if (bonusContainer) {
        bonusContainer.innerHTML = `<span class="ball ${getBallColorClass(data.bnusNo)}">${data.bnusNo}</span>`;
    }
}

function toggleTheme() {
    const isDark = document.body.classList.toggle('dark-mode');
    const toggleBtn = document.getElementById('themeToggle');
    if (toggleBtn) {
        if (isDark) {
            toggleBtn.innerText = '☀️';
            localStorage.setItem('theme', 'dark');
        } else {
            toggleBtn.innerText = '🌓';
            localStorage.setItem('theme', 'light');
        }
    }
}

function toggleGameMode(idx) {
    if (gameModes[idx] === '자동') {
        gameModes[idx] = '반자동';
    } else {
        gameModes[idx] = '자동';
    }
    lastGenerated = null;
    renderBalls();
}

function getBallColorClass(num) {
    if (num <= 10) return 'ball-yellow';
    if (num <= 20) return 'ball-blue';
    if (num <= 30) return 'ball-red';
    if (num <= 40) return 'ball-gray';
    return 'ball-green';
}

function getBallHexColor(num) {
    if (num <= 10) return '#fbc400';
    if (num <= 20) return '#69c8f2';
    if (num <= 30) return '#ff7272';
    if (num <= 40) return '#aaaaaa';
    return '#b0d840';
}

function renderBalls() {
    const resultDiv = document.getElementById('result');
    if (!resultDiv) return;

    let htmlStr = '';
    
    for (let g = 0; g < 5; g++) {
        let rowLabel = String.fromCharCode(65 + g); 
        let mode = gameModes[g];
        let modeClass = mode === '반자동' ? 'active-semi' : 'active-auto';
        
        htmlStr += `<div class="game-row">`;
        htmlStr += `<div class="game-label">
            <span>${rowLabel} ${mode}</span>
            <button class="mode-toggle-btn ${modeClass}" onclick="toggleGameMode(${g})">변경</button>
        </div>`;
        
        if (lastGenerated === null) {
            if (mode === '반자동') {
                for (let i = 0; i < 6; i++) {
                    if (i < selectedNumbers.length) {
                        let val = selectedNumbers[i];
                        htmlStr += `<span class="ball ${getBallColorClass(val)}">${val}</span>`;
                    } else {
                        htmlStr += `<span class="ball ball-black">?</span>`;
                    }
                }
            } else {
                for (let i = 0; i < 6; i++) {
                    htmlStr += `<span class="ball ball-black">?</span>`;
                }
            }
        } else {
            for (let i = 0; i < 6; i++) {
                let val = lastGenerated[g][i];
                htmlStr += `<span class="ball ${getBallColorClass(val)}">${val}</span>`;
            }
        }
        htmlStr += `</div>`;
    }
    resultDiv.innerHTML = htmlStr;
}

function toggleNumber(num, btnElement) {
    const index = selectedNumbers.indexOf(num);
    if (index > -1) {
        selectedNumbers.splice(index, 1);
        btnElement.classList.remove('selected');
    } else {
        if (selectedNumbers.length >= 5) {
            alert('고정 번호는 최대 5개까지만 선택할 수 있습니다.');
            return;
        }
        selectedNumbers.push(num);
        btnElement.classList.add('selected');
    }
    lastGenerated = null; 
    renderBalls();
}

function resetSelection() {
    selectedNumbers = [];
    lastGenerated = null;
    const btns = document.querySelectorAll('.num-btn');
    btns.forEach(btn => btn.classList.remove('selected'));
    renderBalls();
}

function shareResult() {
    if (!lastGenerated) {
        alert("먼저 번호를 생성해 주세요!");
        return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 760; 
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#333333';
    ctx.font = 'bold 40px "Apple SD Gothic Neo", "Malgun Gothic", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText("🍀 이번 주 당신의 행운 번호는 🍀", canvas.width / 2, 80);

    let startX = 210; 
    let gap = 90;
    let radius = 35;
    let startY = 200;
    let rowGap = 100;
    
    for (let g = 0; g < 5; g++) {
        let ballY = startY + (g * rowGap);
        let mode = gameModes[g];

        ctx.fillStyle = '#555555';
        ctx.font = 'bold 24px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`${String.fromCharCode(65 + g)} ${mode}`, 60, ballY + 2);

        ctx.textAlign = 'center';
        for (let i = 0; i < 6; i++) {
            let num = lastGenerated[g][i];
            let color = getBallHexColor(num);

            ctx.shadowColor = 'rgba(0,0,0,0.2)';
            ctx.shadowBlur = 8;
            ctx.shadowOffsetY = 4;

            ctx.beginPath();
            ctx.arc(startX + i * gap, ballY, radius, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();

            ctx.shadowColor = 'transparent';

            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 34px sans-serif';
            ctx.fillText(num, startX + i * gap, ballY + 4);
        }
    }

    ctx.fillStyle = '#888888';
    ctx.font = '20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText("맞춤형 확률 공식을 통해 생성된 행운 번호입니다.", canvas.width / 2, 700);

    const dataUrl = canvas.toDataURL('image/png');
    document.getElementById('previewImg').src = dataUrl;
    document.getElementById('shareModal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('shareModal').style.display = 'none';
}

window.onclick = function(event) {
    const modal = document.getElementById('shareModal');
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

function downloadImage() {
    const imgSrc = document.getElementById('previewImg').src;
    const link = document.createElement('a');
    link.download = 'lucky_lotto_number_v2.0.png';
    link.href = imgSrc;
    link.click();
}

function generateLotto() {
    const btn = document.getElementById('generateBtn');
    const resultDiv = document.getElementById('result');
    if (!btn || !resultDiv) return;
    
    btn.disabled = true;
    btn.innerText = "번호 추첨 중...";

    let newGeneratedGames = [];
    let allFixedSlots = [];

    for (let g = 0; g < 5; g++) {
        let mode = gameModes[g];
        let finalNumbers = (mode === '반자동') ? [...selectedNumbers] : [];
        let available = Array.from({length: 45}, (_, i) => i + 1);
        let currentWeights = [...weights];

        finalNumbers.forEach(num => {
            let idx = available.indexOf(num);
            if (idx > -1) {
                available.splice(idx, 1);
                currentWeights.splice(idx, 1);
            }
        });

        let needed = 6 - finalNumbers.length;
        for (let i = 0; i < needed; i++) {
            let totalWeight = currentWeights.reduce((a, b) => a + b, 0);
            let random = Math.random() * totalWeight;
            let sum = 0;
            
            for (let j = 0; j < available.length; j++) {
                sum += currentWeights[j];
                if (random <= sum) {
                    finalNumbers.push(available[j]);
                    available.splice(j, 1);
                    currentWeights.splice(j, 1);
                    break;
                }
            }
        }
        
        newGeneratedGames.push([...finalNumbers].sort((a, b) => a - b));

        let fixedSlots = [null, null, null, null, null, null];
        if (mode === '반자동') {
            if (lastGenerated === null) {
                for (let i = 0; i < selectedNumbers.length; i++) {
                    fixedSlots[i] = selectedNumbers[i];
                }
            } else {
                selectedNumbers.forEach(num => {
                    let prevIdx = lastGenerated[g].indexOf(num);
                    if (prevIdx > -1) {
                        fixedSlots[prevIdx] = num;
                    }
                });
            }
        }
        allFixedSlots.push(fixedSlots);
    }

    let spinCount = 0;
    const maxSpins = 20; 
    
    const spinInterval = setInterval(() => {
        let htmlStr = '';
        
        for (let g = 0; g < 5; g++) {
            let rowLabel = String.fromCharCode(65 + g);
            let mode = gameModes[g];
            let modeClass = mode === '반자동' ? 'active-semi' : 'active-auto';

            htmlStr += `<div class="game-row">`;
            htmlStr += `<div class="game-label">
                <span>${rowLabel} ${mode}</span>
                <button class="mode-toggle-btn ${modeClass}">변경</button>
            </div>`;

            for (let k = 0; k < 6; k++) {
                if (allFixedSlots[g][k] !== null) {
                    let val = allFixedSlots[g][k];
                    htmlStr += `<span class="ball ${getBallColorClass(val)}">${val}</span>`;
                } else {
                    let randomNum = Math.floor(Math.random() * 45) + 1;
                    htmlStr += `<span class="ball ${getBallColorClass(randomNum)}">${randomNum}</span>`;
                }
            }
            htmlStr += `</div>`;
        }
        
        resultDiv.innerHTML = htmlStr;
        spinCount++;

        if (spinCount >= maxSpins) {
            clearInterval(spinInterval);
            
            lastGenerated = newGeneratedGames;
            renderBalls();
            
            btn.innerText = "행운의 5게임 생성";
            btn.disabled = false;
        }
    }, 50); 
}

// 정책 모달 외부 클릭 시 닫기
window.addEventListener('click', function(event) {
    const policyModal = document.getElementById('policyModal');
    const shareModal = document.getElementById('shareModal');
    if (event.target == policyModal) closePolicy();
    if (event.target == shareModal) closeModal();
});

// --- 댓글 시스템 로직 ---
let comments = [];

function loadComments() {
    const commentsList = document.getElementById('commentsList');
    if (!commentsList) return;

    // 로컬 스토리지에서 댓글 불러오기 (나중에 Firebase 등으로 확장 가능)
    const savedComments = localStorage.getItem('lotto_comments');
    if (savedComments) {
        comments = JSON.parse(savedComments);
    }

    renderComments();
}

function renderComments() {
    const commentsList = document.getElementById('commentsList');
    if (!commentsList) return;

    if (comments.length === 0) {
        commentsList.innerHTML = '<p class="empty-msg">아직 댓글이 없습니다. 첫 댓글을 남겨보세요!</p>';
        return;
    }

    commentsList.innerHTML = comments
        .map(comment => {
            const isLong = comment.text.length > 50;
            const shortText = isLong ? comment.text.substring(0, 50) + '...' : comment.text;
            
            return `
                <div class="comment-item ${isLong ? 'has-more' : ''}">
                    <div class="comment-header">
                        <span class="comment-author">${maskEmail(comment.email)}</span>
                        <span class="comment-date">${formatDate(comment.timestamp)}</span>
                    </div>
                    <div class="comment-content">
                        <span class="text-short">${escapeHtml(shortText)}</span>
                        ${isLong ? `<span class="text-full">${escapeHtml(comment.text)}</span>` : ''}
                    </div>
                </div>
            `;
        })
        .join('');
}

function addComment() {
    const emailInput = document.getElementById('commentEmail');
    const textInput = document.getElementById('commentText');
    const submitBtn = document.getElementById('submitComment');

    const email = emailInput.value.trim();
    const text = textInput.value.trim();

    if (!email || !text) {
        alert('이메일과 댓글 내용을 모두 입력해주세요.');
        return;
    }

    if (!validateEmail(email)) {
        alert('올바른 이메일 형식을 입력해주세요.');
        return;
    }

    submitBtn.disabled = true;
    submitBtn.innerText = '등록 중...';

    const newComment = {
        id: Date.now(),
        email: email,
        text: text,
        timestamp: new Date().toISOString()
    };

    // 로컬 스토리지에 저장 (나중에 실제 서버 API 호출로 대체)
    setTimeout(() => {
        comments.unshift(newComment);
        localStorage.setItem('lotto_comments', JSON.stringify(comments));

        emailInput.value = '';
        textInput.value = '';
        submitBtn.disabled = false;
        submitBtn.innerText = '댓글 남기기';

        renderComments();
    }, 500);
}

function maskEmail(email) {
    const [user, domain] = email.split('@');
    if (!domain) return email;
    const maskedUser = user.substring(0, 3) + '***';
    return `${maskedUser}@${domain}`;
}

function formatDate(isoString) {
    const date = new Date(isoString);
    return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
}

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 초기화 실행
loadComments();
