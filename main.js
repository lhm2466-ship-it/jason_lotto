// Firebase 최신 SDK (ES Modules 방식) 임포트
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { getDatabase, ref, push, onValue } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-database.js";

// 사용자 Firebase 설정
const firebaseConfig = {
    apiKey: "AIzaSyDIcfxr1Zngy8mcHgbRDutYdUOM9qVlv64",
    authDomain: "jasonlottodisqus.firebaseapp.com",
    databaseURL: "https://jasonlottodisqus-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "jasonlottodisqus",
    storageBucket: "jasonlottodisqus.firebasestorage.app",
    messagingSenderId: "863496406202",
    appId: "1:863496406202:web:52d2ca000cbfa759c5ae83",
    measurementId: "G-FNP3YW29MV"
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// 정책 모달 데이터
const policyData = {
    privacy: `
        <h2>개인정보처리방침</h2>
        <p>JASON LOTTO는 이용자의 개인정보를 중요하게 생각하며, 관련 법령을 준수합니다.</p>
        <p>1. <strong>수집 항목:</strong> 본 사이트는 별도의 회원가입 없이 이용 가능하며, 이용자의 개인정보를 서버에 저장하지 않습니다.</p>
        <p>2. <strong>브라우저 저장소:</strong> 사용자가 선택한 테마 정보 및 로또 당첨 번호 캐시 데이터를 브라우저의 로컬 스토리지(LocalStorage)에 저장하여 서비스 편의를 제공합니다. 이 데이터는 이용자의 기기에만 존재합니다.</p>
    `,
    terms: `
        <h2>이용약관</h2>
        <p>제이슨 로또(이하 '서비스')의 이용과 관련하여 안내드립니다.</p>
        <p>1. <strong>서비스 목적:</strong> 본 서비스는 로또 6/45의 과거 당첨 데이터를 기반으로 한 확률 가중치 기반 번호 생성 도구입니다.</p>
        <p>2. <strong>책임 한계:</strong> 본 서비스에서 생성된 번호는 통계적 수치에 기반한 참고용일 뿐이며, 실제 당첨을 보장하지 않습니다.</p>
    `
};

// --- 전역 함수 정의 (window 객체에 등록하여 HTML에서 호출 가능하게 함) ---

window.openPolicy = function(type) {
    document.getElementById('policyText').innerHTML = policyData[type];
    document.getElementById('policyModal').style.display = 'block';
};

window.closePolicy = function() {
    document.getElementById('policyModal').style.display = 'none';
};

window.toggleTheme = function() {
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
};

window.toggleGameMode = function(idx) {
    if (gameModes[idx] === '자동') {
        gameModes[idx] = '반자동';
    } else {
        gameModes[idx] = '자동';
    }
    lastGenerated = null;
    renderBalls();
};

window.resetSelection = function() {
    selectedNumbers = [];
    lastGenerated = null;
    const btns = document.querySelectorAll('.num-btn');
    btns.forEach(btn => btn.classList.remove('selected'));
    renderBalls();
};

window.shareResult = function() {
    if (!lastGenerated) {
        alert("먼저 번호를 생성해 주세요!");
        return;
    }
    const canvas = document.createElement('canvas');
    canvas.width = 800; canvas.height = 760;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#333333'; ctx.font = 'bold 40px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText("🍀 이번 주 당신의 행운 번호는 🍀", canvas.width / 2, 80);
    let startX = 210, gap = 90, radius = 35, startY = 200, rowGap = 100;
    for (let g = 0; g < 5; g++) {
        let ballY = startY + (g * rowGap);
        let mode = gameModes[g];
        ctx.fillStyle = '#555555'; ctx.font = 'bold 24px sans-serif'; ctx.textAlign = 'left';
        ctx.fillText(`${String.fromCharCode(65 + g)} ${mode}`, 60, ballY + 2);
        ctx.textAlign = 'center';
        for (let i = 0; i < 6; i++) {
            let num = lastGenerated[g][i];
            ctx.shadowColor = 'rgba(0,0,0,0.2)'; ctx.shadowBlur = 8; ctx.shadowOffsetY = 4;
            ctx.beginPath(); ctx.arc(startX + i * gap, ballY, radius, 0, Math.PI * 2);
            ctx.fillStyle = getBallHexColor(num); ctx.fill(); ctx.shadowColor = 'transparent';
            ctx.fillStyle = '#ffffff'; ctx.font = 'bold 34px sans-serif'; ctx.fillText(num, startX + i * gap, ballY + 4);
        }
    }
    ctx.fillStyle = '#888888'; ctx.font = '20px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText("맞춤형 확률 공식을 통해 생성된 행운 번호입니다.", canvas.width / 2, 700);
    document.getElementById('previewImg').src = canvas.toDataURL('image/png');
    document.getElementById('shareModal').style.display = 'flex';
};

window.closeModal = function() {
    document.getElementById('shareModal').style.display = 'none';
};

window.downloadImage = function() {
    const link = document.createElement('a');
    link.download = 'lucky_lotto_number.png';
    link.href = document.getElementById('previewImg').src;
    link.click();
};

window.generateLotto = function() {
    const btn = document.getElementById('generateBtn');
    const resultDiv = document.getElementById('result');
    if (!btn || !resultDiv) return;
    btn.disabled = true; btn.innerText = "번호 추첨 중...";
    let newGeneratedGames = [];
    let allFixedSlots = [];
    for (let g = 0; g < 5; g++) {
        let mode = gameModes[g];
        let finalNumbers = (mode === '반자동') ? [...selectedNumbers] : [];
        let available = Array.from({length: 45}, (_, i) => i + 1);
        let currentWeights = [...weights];
        finalNumbers.forEach(num => {
            let idx = available.indexOf(num);
            if (idx > -1) { available.splice(idx, 1); currentWeights.splice(idx, 1); }
        });
        let needed = 6 - finalNumbers.length;
        for (let i = 0; i < needed; i++) {
            let totalWeight = currentWeights.reduce((a, b) => a + b, 0);
            let random = Math.random() * totalWeight, sum = 0;
            for (let j = 0; j < available.length; j++) {
                sum += currentWeights[j];
                if (random <= sum) { finalNumbers.push(available[j]); available.splice(j, 1); currentWeights.splice(j, 1); break; }
            }
        }
        newGeneratedGames.push([...finalNumbers].sort((a, b) => a - b));
        let fixedSlots = [null, null, null, null, null, null];
        if (mode === '반자동') {
            selectedNumbers.forEach((num, i) => { if (i < 6) fixedSlots[i] = num; });
        }
        allFixedSlots.push(fixedSlots);
    }
    let spinCount = 0; const maxSpins = 20;
    const spinInterval = setInterval(() => {
        let htmlStr = '';
        for (let g = 0; g < 5; g++) {
            htmlStr += `<div class="game-row"><div class="game-label"><span>${String.fromCharCode(65 + g)} ${gameModes[g]}</span></div>`;
            for (let k = 0; k < 6; k++) {
                let val = allFixedSlots[g][k] || Math.floor(Math.random() * 45) + 1;
                htmlStr += `<span class="ball ${getBallColorClass(val)}">${val}</span>`;
            }
            htmlStr += `</div>`;
        }
        resultDiv.innerHTML = htmlStr;
        if (++spinCount >= maxSpins) {
            clearInterval(spinInterval); lastGenerated = newGeneratedGames; renderBalls();
            btn.innerText = "행운의 5게임 생성"; btn.disabled = false;
        }
    }, 50);
};

window.addComment = function() {
    const emailInput = document.getElementById('commentEmail');
    const textInput = document.getElementById('commentText');
    const submitBtn = document.getElementById('submitComment');
    const email = emailInput.value.trim();
    const text = textInput.value.trim();
    if (!email || !text) { alert('이메일과 댓글 내용을 모두 입력해주세요.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { alert('올바른 이메일 형식을 입력해주세요.'); return; }
    submitBtn.disabled = true; submitBtn.innerText = '등록 중...';
    const newComment = { email, text, timestamp: new Date().toISOString() };
    push(ref(database, 'comments'), newComment)
        .then(() => {
            emailInput.value = ''; textInput.value = '';
            submitBtn.disabled = false; submitBtn.innerText = '댓글 남기기';
        })
        .catch(err => {
            console.error(err); alert('등록 실패!');
            submitBtn.disabled = false; submitBtn.innerText = '댓글 남기기';
        });
};

// --- 내부 로직 함수들 ---

const weights = [0.021703217032170324, 0.021687679317257508, 0.022014022014022016, 0.02167214160434469, 0.021625516999719178, 0.02181197603220672, 0.021780891582061608, 0.021641059395187722, 0.02171875952932918, 0.02172653077790861, 0.021742073275067466, 0.02188968851800101, 0.02181197603220672, 0.021749844523646892, 0.021742073275067466, 0.02184306054817112, 0.021749844523646892, 0.02181197603220672, 0.02177312033348218, 0.021641059395187722, 0.02184306054817112, 0.021710988280749755, 0.021687679317257508, 0.02177312033348218, 0.021625516999719178, 0.021749844523646892, 0.021765349084902753, 0.021757596804274823, 0.02171875952932918, 0.021780891582061608, 0.021757596804274823, 0.0216799104608011, 0.021796434079220464, 0.021788662830641038, 0.021780891582061608, 0.021757596804274823, 0.021742073275067466, 0.02184306054817112, 0.021757596804274823, 0.021695450565836935, 0.021710988280749755, 0.021757596804274823, 0.02171875952932918, 0.021710988280749755, 0.021819747280786146];
let selectedNumbers = [], lastGenerated = null, gameModes = ['자동', '자동', '자동', '자동', '자동'];

function getBallColorClass(num) {
    if (num <= 10) return 'ball-yellow'; if (num <= 20) return 'ball-blue'; if (num <= 30) return 'ball-red'; if (num <= 40) return 'ball-gray'; return 'ball-green';
}
function getBallHexColor(num) {
    if (num <= 10) return '#fbc400'; if (num <= 20) return '#69c8f2'; if (num <= 30) return '#ff7272'; if (num <= 40) return '#aaaaaa'; return '#b0d840';
}

function renderBalls() {
    const resultDiv = document.getElementById('result'); if (!resultDiv) return;
    let htmlStr = '';
    for (let g = 0; g < 5; g++) {
        let mode = gameModes[g];
        htmlStr += `<div class="game-row"><div class="game-label"><span>${String.fromCharCode(65 + g)} ${mode}</span><button class="mode-toggle-btn ${mode === '반자동' ? 'active-semi' : 'active-auto'}" onclick="toggleGameMode(${g})">변경</button></div>`;
        if (lastGenerated === null) {
            for (let i = 0; i < 6; i++) {
                let val = (mode === '반자동' && i < selectedNumbers.length) ? selectedNumbers[i] : null;
                htmlStr += `<span class="ball ${val ? getBallColorClass(val) : 'ball-black'}">${val || '?'}</span>`;
            }
        } else {
            lastGenerated[g].forEach(num => { htmlStr += `<span class="ball ${getBallColorClass(num)}">${num}</span>`; });
        }
        htmlStr += `</div>`;
    }
    resultDiv.innerHTML = htmlStr;
}

function toggleNumber(num, btn) {
    const idx = selectedNumbers.indexOf(num);
    if (idx > -1) { selectedNumbers.splice(idx, 1); btn.classList.remove('selected'); }
    else { if (selectedNumbers.length >= 5) { alert('최대 5개!'); return; } selectedNumbers.push(num); btn.classList.add('selected'); }
    lastGenerated = null; renderBalls();
}

function loadComments() {
    onValue(ref(database, 'comments'), (snapshot) => {
        const data = snapshot.val();
        let commentsList = [];
        if (data) {
            Object.keys(data).forEach(key => commentsList.push(data[key]));
            commentsList.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        }
        const container = document.getElementById('commentsList');
        if (!container) return;
        if (commentsList.length === 0) { container.innerHTML = '<p class="empty-msg">첫 댓글을 남겨보세요!</p>'; return; }
        container.innerHTML = commentsList.map(c => `
            <div class="comment-item">
                <div class="comment-header"><span class="comment-author">${c.email.substring(0,3)}***</span><span class="comment-date">${c.timestamp.substring(0,10)}</span></div>
                <div class="comment-content">${c.text}</div>
            </div>
        `).join('');
    });
}

// 초기화
(function init() {
    const grid = document.getElementById('numberGrid');
    if (grid) {
        for (let i = 1; i <= 45; i++) {
            let btn = document.createElement('button'); btn.className = 'num-btn'; btn.innerText = i;
            btn.onclick = () => toggleNumber(i, btn); grid.appendChild(btn);
        }
    }
    if (localStorage.getItem('theme') === 'dark') document.body.classList.add('dark-mode');
    renderBalls();
    loadComments();
})();
