// gameLogic.js

// DOM要素の取得はmain.jsで行い、必要なものを初期化時に渡す
// または、直接ここで取得しても良いが、一箇所にまとめるのが理想的

// ゲームの状態変数
let animeData = [];
let characterData = [];
let voiceActorData = [];

let questions = []; // 今回のゲームで出題される問題の配列
let currentQuestionIndex = 0;
let currentQuestionText = ''; // 現在表示されている問題文（かな）
let currentQuestionRomaji = ''; // 現在の問題文のローマ字（wanakana変換後）
let currentTypedRomaji = ''; // ユーザーが現在入力中のローマ字
let startTime = 0;
let endTime = 0;
let totalCorrectChars = 0;
let totalMistakes = 0;
const keyMistakes = {}; // 各キーのミス回数を記録 { 'a': 5, 's': 2, ... }

// DOM要素への参照を保持するオブジェクト (main.jsから渡される)
let DOM = {};

// --- ゲームロジックの初期化関数 ---
// main.jsから呼ばれてDOM要素への参照を渡し、イベントリスナーを設定
function initializeGameLogic(domElements) {
    DOM = domElements; // 渡されたDOM要素の参照を保持

    // wanakanaを入力フィールドにバインド
    wanakana.bind(DOM.typingInput);

    // イベントリスナーの設定
    DOM.startGameButton.addEventListener('click', startGame);
    DOM.restartGameButton.addEventListener('click', resetGame);
    DOM.typingInput.addEventListener('input', handleTypingInput);
    DOM.typingInput.addEventListener('keydown', handleKeyDown);

    // UIの初期状態を設定
    updateAnimeTitleOptionsVisibility();
    DOM.radioAnimeTitle.addEventListener('change', updateAnimeTitleOptionsVisibility);
    DOM.radioVoiceActor.addEventListener('change', updateAnimeTitleOptionsVisibility);
    DOM.radioCharacter.addEventListener('change', updateAnimeTitleOptionsVisibility);
    DOM.radioAllPeriod.addEventListener('change', toggleYearSelect);
    DOM.radioYear.addEventListener('change', toggleYearSelect);
}

// --- データ格納関数 (main.jsから呼び出される) ---
// (utils.jsから直接呼ばれるのではなく、main.js経由でデータを受け取るように変更)
function setAllGameData(anime, character, voiceActor) {
    animeData = anime;
    characterData = character;
    voiceActorData = voiceActor;
    populateYearSelect(); // データがセットされたら年度選択肢を生成
}

// --- UI制御 ---

function updateAnimeTitleOptionsVisibility() {
    if (DOM.radioAnimeTitle.checked) {
        DOM.animeTitleOptions.style.display = 'block';
        toggleYearSelect();
    } else {
        DOM.animeTitleOptions.style.display = 'none';
    }
}

function toggleYearSelect() {
    DOM.yearSelect.disabled = !DOM.radioYear.checked;
}

function populateYearSelect() {
    // animeDataからユニークな年度を取得
    const years = [...new Set(animeData.map(item => item.seasonYear))]
                    .filter(year => year && !isNaN(year))
                    .sort((a, b) => b - a);

    DOM.yearSelect.innerHTML = '<option value="all">全期間</option>';
    years.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = `${year}年`;
        DOM.yearSelect.appendChild(option);
    });
}

// --- ゲーム進行ロジック ---

function startGame() {
    // generateQuestions は utils.js で定義されている
    questions = generateQuestions(
        animeData,
        characterData,
        voiceActorData,
        document.querySelector('input[name="searchType"]:checked').value,
        document.querySelector('input[name="periodType"]:checked').value,
        DOM.yearSelect.value,
        parseInt(DOM.questionCountInput.value, 10)
    );

    if (questions.length === 0) {
        alert('選択された条件に合う問題が見つかりませんでした。設定を変更してください。');
        return;
    }

    // ゲーム状態のリセット
    currentQuestionIndex = 0;
    totalCorrectChars = 0;
    totalMistakes = 0;
    for (const key in keyMistakes) {
        delete keyMistakes[key];
    }
    DOM.feedbackDisplay.textContent = '';
    DOM.typingInput.value = '';

    // UIの切り替え
    DOM.settingsArea.style.display = 'none';
    DOM.gameArea.style.display = 'block';
    DOM.resultArea.style.display = 'none';

    // 最初の問題を表示
    displayNextQuestion();

    // タイマー開始
    startTime = Date.now();
    DOM.typingInput.focus();
}

function displayNextQuestion() {
    if (currentQuestionIndex < questions.length) {
        currentQuestionText = questions[currentQuestionIndex];
        DOM.questionDisplay.textContent = currentQuestionText;
        currentQuestionRomaji = wanakana.toRomaji(currentQuestionText);

        DOM.typingInput.value = '';
        currentTypedRomaji = '';
        DOM.currentRomajiDisplay.textContent = '';
        DOM.feedbackDisplay.textContent = '';

        DOM.currentQuestionNumberDisplay.textContent = currentQuestionIndex + 1;
        DOM.totalQuestionsDisplay.textContent = questions.length;
    } else {
        endGame();
    }
}

function handleTypingInput(event) {
    const typedValue = event.target.value;
    currentTypedRomaji = typedValue;
    DOM.currentRomajiDisplay.textContent = currentTypedRomaji;

    let correctCharsCount = 0;
    let currentProblemRomajiIndex = 0;

    const actualTargetRomaji = currentQuestionRomaji.replace(/[^a-zA-Z0-9]/g, '');

    for (let i = 0; i < currentTypedRomaji.length; i++) {
        const typedChar = currentTypedRomaji[i];
        
        if (currentProblemRomajiIndex >= actualTargetRomaji.length) {
            DOM.feedbackDisplay.textContent = '余計な入力があります！';
            break;
        }

        if (typedChar === actualTargetRomaji[currentProblemRomajiIndex]) {
            correctCharsCount++;
            DOM.feedbackDisplay.textContent = '';
        } else {
            DOM.feedbackDisplay.textContent = 'ミスタイプ！';
            totalMistakes++;
            if (typedChar) {
                keyMistakes[typedChar] = (keyMistakes[typedChar] || 0) + 1;
            }
            break;
        }
        currentProblemRomajiIndex++;
    }

    if (correctCharsCount === actualTargetRomaji.length && currentTypedRomaji.length === actualTargetRomaji.length) {
        totalCorrectChars += actualTargetRomaji.length;
        currentQuestionIndex++;
        displayNextQuestion();
    }
}

function handleKeyDown(event) {
    // 現在は特に何もしない
}

function endGame() {
    endTime = Date.now();
    // calculateScore は utils.js で定義されている
    const { wpm, cps } = calculateScore(totalCorrectChars, startTime, endTime);

    DOM.scoreWPMDisplay.textContent = wpm.toFixed(2);
    DOM.scoreCPSDisplay.textContent = cps.toFixed(2);
    DOM.mistakeCountDisplay.textContent = totalMistakes;

    // 苦手キーの表示
    DOM.苦手キーList.innerHTML = '';
    const sortedKeys = Object.entries(keyMistakes).sort(([, a], [, b]) => b - a);
    sortedKeys.slice(0, 5).forEach(([key, count]) => {
        const li = document.createElement('li');
        li.textContent = `'${key}' (${count}回)`;
        DOM.苦手キーList.appendChild(li);
    });

    // コメントと画像の表示
    let commentText = '';
    let imageSrc = '';

    if (wpm === 0 && totalMistakes > 0) {
        commentText = 'あれれ？全く入力できていないようです。ローマ字入力を確認してみましょう！';
        imageSrc = 'https://via.placeholder.com/150/FF0000?text=Try+Again';
    } else if (wpm >= 100 && totalMistakes < 5) {
        commentText = '素晴らしい！あなたはタイピングの達人です！';
        imageSrc = 'https://via.placeholder.com/150/00FF00?text=Excellent!';
    } else if (wpm >= 80 && totalMistakes < 10) {
        commentText = '速くて正確！この調子でさらに上を目指しましょう！';
        imageSrc = 'https://via.placeholder.com/150/99FF33?text=Great!';
    } else if (wpm >= 50) {
        commentText = 'なかなか良いスピードです！さらに練習を重ねてみましょう！';
        imageSrc = 'https://via.placeholder.com/150/FFFF00?text=Good!';
    } else {
        commentText = 'もう少し練習が必要です。コツコツ頑張りましょう！';
        imageSrc = 'https://via.placeholder.com/150/FF8C00?text=Keep+Practicing!';
    }
    DOM.commentDisplay.textContent = commentText;
    DOM.resultImageDisplay.innerHTML = `<img src="${imageSrc}" alt="Result Image">`;

    DOM.gameArea.style.display = 'none';
    DOM.resultArea.style.display = 'block';
}

function resetGame() {
    // ゲームの状態を初期化
    currentQuestionIndex = 0;
    totalCorrectChars = 0;
    totalMistakes = 0;
    for (const key in keyMistakes) {
        delete keyMistakes[key];
    }
    questions = [];
    startTime = 0;
    endTime = 0;

    // UIを初期設定画面に戻す
    DOM.settingsArea.style.display = 'block';
    DOM.gameArea.style.display = 'none';
    DOM.resultArea.style.display = 'none';
    DOM.typingInput.value = '';
    DOM.currentRomajiDisplay.textContent = '';
    DOM.feedbackDisplay.textContent = '';
    DOM.questionDisplay.textContent = '';
    DOM.currentQuestionNumberDisplay.textContent = 1;
    DOM.totalQuestionsDisplay.textContent = DOM.questionCountInput.value;
    DOM.typingInput.blur();
}