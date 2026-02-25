const weights = [0.021703217032170324, 0.021687679317257508, 0.022014022014022016, 0.02167214160434469, 0.021625516999719178, 0.02181197603220672, 0.021780891582061608, 0.021641059395187722, 0.02171875952932918, 0.02172653077790861, 0.021742073275067466, 0.02188968851800101, 0.02181197603220672, 0.021749844523646892, 0.021742073275067466, 0.02184306054817112, 0.021749844523646892, 0.02181197603220672, 0.02177312033348218, 0.021641059395187722, 0.02184306054817112, 0.021710988280749755, 0.021687679317257508, 0.02177312033348218, 0.021625516999719178, 0.021749844523646892, 0.021765349084902753, 0.021757596804274823, 0.02171875952932918, 0.021780891582061608, 0.021757596804274823, 0.0216799104608011, 0.021796434079220464, 0.021788662830641038, 0.021780891582061608, 0.021757596804274823, 0.021742073275067466, 0.02184306054817112, 0.021757596804274823, 0.021695450565836935, 0.021710988280749755, 0.021757596804274823, 0.02171875952932918, 0.021710988280749755, 0.021819747280786146];

let selectedNumbers = [];
let lastGenerated = null; 

(function init() {
    const grid = document.getElementById('numberGrid');
    for (let i = 1; i <= 45; i++) {
        let btn = document.createElement('button');
        btn.className = 'num-btn';
        btn.innerText = i;
        btn.onclick = function() { toggleNumber(i, btn); };
        grid.appendChild(btn);
    }
    renderBalls();
})();

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
    let htmlStr = '';
    
    let labelType = selectedNumbers.length > 0 ? '반자동' : '자동';

    for (let g = 0; g < 5; g++) {
        let rowLabel = String.fromCharCode(65 + g); // A, B, C, D, E
        htmlStr += `<div class="game-row">`;
        htmlStr += `<div class="game-label">${rowLabel} ${labelType}</div>`;
        
        if (lastGenerated === null) {
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
    canvas.height = 760; // 5줄을 그리기 위해 높이를 늘림
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
    
    let labelType = selectedNumbers.length > 0 ? '반자동' : '자동';

    for (let g = 0; g < 5; g++) {
        let ballY = startY + (g * rowGap);
        
        ctx.fillStyle = '#555555';
        ctx.font = 'bold 24px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`${String.fromCharCode(65 + g)} ${labelType}`, 60, ballY + 2);

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
    
    btn.disabled = true;
    btn.innerText = "번호 추첨 중...";

    let newGeneratedGames = [];
    let allFixedSlots = [];

    for (let g = 0; g < 5; g++) {
        let finalNumbers = [...selectedNumbers];
        let available = Array.from({length: 45}, (_, i) => i + 1);
        let currentWeights = [...weights];

        selectedNumbers.forEach(num => {
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
        allFixedSlots.push(fixedSlots);
    }

    let spinCount = 0;
    const maxSpins = 20; 
    let labelType = selectedNumbers.length > 0 ? '반자동' : '자동';
    
    const spinInterval = setInterval(() => {
        let htmlStr = '';
        
        for (let g = 0; g < 5; g++) {
            let rowLabel = String.fromCharCode(65 + g);
            htmlStr += `<div class="game-row">`;
            htmlStr += `<div class="game-label">${rowLabel} ${labelType}</div>`;

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
            
            btn.innerText = "5게임 생성하기";
            btn.disabled = false;
        }
    }, 50); 
}
