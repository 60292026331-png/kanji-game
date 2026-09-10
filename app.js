// ===================================================
// app.js - ゲームロジック
// ===================================================

let mode         = 'kanji';
let level        = '3級';
let questions    = [];
let currentIdx   = 0;
let score        = 0;
let wrongList    = [];
let totalCorrect = 0;
let totalPlayed  = 0;
const TOTAL      = 10;

// ── 画面切り替え ──────────────────────────────────
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-' + id).classList.add('active');
  if (id === 'home') updateSessionScore();
}

function updateSessionScore() {
  document.getElementById('session-score').textContent =
    `今セッション：${totalCorrect}問正解 / ${totalPlayed}問`;
}

// ── モード選択 ────────────────────────────────────
function selectMode(m) {
  mode = m;
  const isKanji = m === 'kanji';
  document.getElementById('level-title').textContent =
    (isKanji ? '🈳 漢字モード' : '🔤 英語モード') + ' - レベルを選んでね';
  document.getElementById('level-subtitle').textContent =
    isKanji ? '漢字・熟語の読み方を答えよう' : '英単語の意味を日本語で答えよう';
  showScreen('level');
}

// ── ゲーム開始 ────────────────────────────────────
function startGame(lv) {
  level      = lv;
  score      = 0;
  wrongList  = [];
  currentIdx = 0;

  const pool = [...QUESTIONS[mode][level]];
  shuffle(pool);
  questions = pool.slice(0, TOTAL);

  showScreen('game');
  updateGameBadge();
  showQuestion();
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function updateGameBadge() {
  const icon = mode === 'kanji' ? '🈳' : '🔤';
  document.getElementById('game-badge').textContent = `${icon} ${level}`;
}

// ── 問題表示 ──────────────────────────────────────
function showQuestion() {
  const q = questions[currentIdx];
  const isEnglish = mode === 'english';

  const qEl = document.getElementById('question-text');
  qEl.textContent = q.q;
  qEl.className = 'question-text' + (isEnglish ? ' english-question' : '');

  document.getElementById('hint-text').textContent = '○'.repeat(q.a.length);
  document.getElementById('game-progress').textContent = `${currentIdx + 1} / ${TOTAL}`;
  document.getElementById('game-score').textContent = `スコア: ${score}`;
  document.getElementById('progress-bar').style.width = `${(currentIdx / TOTAL) * 100}%`;
  document.getElementById('input-label').textContent =
    isEnglish ? '日本語で意味を入力してね' : 'ひらがなで入力してね';

  const input = document.getElementById('answer-input');
  input.value = '';
  input.disabled = false;
  input.focus();

  document.getElementById('feedback').textContent = '';
  document.getElementById('feedback').className = 'feedback';
  document.getElementById('submit-btn').classList.remove('hidden');
  document.getElementById('next-btn').classList.add('hidden');
}

// ── 答えチェック ──────────────────────────────────
function checkAnswer() {
  const input  = document.getElementById('answer-input');
  const answer = input.value.trim();
  const correct = questions[currentIdx].a;
  if (!answer) return;

  input.disabled = true;
  document.getElementById('submit-btn').classList.add('hidden');

  const fb   = document.getElementById('feedback');
  const msgs = ['正解！', 'やったね！', 'その通り！', '完璧！', 'さすが！', 'Great!'];

  if (answer === correct) {
    score++;
    fb.textContent = `✅ ${msgs[Math.floor(Math.random() * msgs.length)]}　「${correct}」`;
    fb.className = 'feedback correct';
  } else {
    wrongList.push(questions[currentIdx]);
    fb.textContent = `❌ 不正解…　正解は「${correct}」だよ`;
    fb.className = 'feedback wrong';
  }

  document.getElementById('game-score').textContent = `スコア: ${score}`;

  const nextBtn = document.getElementById('next-btn');
  nextBtn.classList.remove('hidden');
  if (currentIdx >= TOTAL - 1) {
    nextBtn.textContent = '結果を見る 🎯';
    nextBtn.onclick = showResult;
  } else {
    nextBtn.textContent = '次の問題 →';
    nextBtn.onclick = nextQuestion;
  }
}

function nextQuestion() {
  currentIdx++;
  showQuestion();
}

// ── 結果表示 ──────────────────────────────────────
function showResult() {
  totalCorrect += score;
  totalPlayed  += TOTAL;
  const pct = Math.round(score / TOTAL * 100);

  let rank, col;
  if (pct === 100)      { rank = '🏆 満点！すごい！';        col = 'var(--yellow)'; }
  else if (pct >= 80)   { rank = '🎉 優秀！よくできました';  col = 'var(--green)';  }
  else if (pct >= 60)   { rank = '👍 合格！もう少しで満点';  col = 'var(--blue)';   }
  else if (pct >= 40)   { rank = '📚 もう少し！練習しよう';  col = 'var(--yellow)'; }
  else                  { rank = '💪 ドンマイ！復習しよう';  col = 'var(--red)';    }

  const icon = mode === 'kanji' ? '🈳' : '🔤';
  document.getElementById('result-badge').textContent = `${icon} ${level}`;
  document.getElementById('result-score').style.color = col;
  document.getElementById('result-score').textContent = `${score} / ${TOTAL}`;
  document.getElementById('result-rank').style.color = col;
  document.getElementById('result-rank').textContent = rank;

  // 間違えた問題
  const ws = document.getElementById('wrong-section');
  if (wrongList.length > 0) {
    let html = '<p class="wrong-title">間違えた問題</p><div class="wrong-grid">';
    wrongList.forEach(w => {
      html += `<div class="wrong-item">${w.q} = ${w.a}</div>`;
    });
    html += '</div>';
    ws.innerHTML = html;
  } else {
    ws.innerHTML = '';
  }

  document.getElementById('retry-btn').onclick = () => startGame(level);
  document.getElementById('progress-bar').style.width = '100%';

  showScreen('result');
}

// ── 初期化 ────────────────────────────────────────
updateSessionScore();
