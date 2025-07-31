
export function startGame(data, current, dom_data, score_calculation) {
    score_calculation.startTime = Date.now();
    loadQuestion(data, current, dom_data);
    const handler = createKeyHandler(data, current, score_calculation, dom_data);
    document.addEventListener("keydown", handler);
    current._handleKey = handler;
}

export function loadQuestion(data, current, dom_data) {
  console.log("呼び出し時の dom_data:", dom_data);
    current.question = data[current.currentQuestionIndex];
    current.currentQuestionRomaji = current.question.nameRo;
    current.currentTypedRomaji = "";
    dom_data.elQuestion.textContent = `${current.question.name} ${current.question.nameKana}`;
    updateDisplay(current, dom_data);
}

export function updateDisplay(current, dom_data){
    dom_data.elTyped.textContent  = current.currentTypedRomaji;
    dom_data.elRemaining.textContent = current.currentQuestionRomaji.slice(current.currentTypedRomaji.length);
}


function onKeydown(e, data, current, score_calculation, dom_data) {
  // ゲーム開始タイミングをずらさないよう、最初のキーで startTime を確定
  if (!score_calculation.startTime) score_calculation.startTime = Date.now();

  const key = e.key;
  // 英数字と記号のみ処理（１文字入力のみ）
  if (key.length !== 1) return;

  const expectedChar = current.currentQuestionRomaji[current.currentTypedRomaji.length];
  if (key === expectedChar) {
    current.currentTypedRomaji += key;
    score_calculation.totalCorrectChars++;
  } else {
    score_calculation.totalMistakes++;
    score_calculation.keyMistakes[key] = (score_calculation.keyMistakes[key] || 0) + 1;
  }

  updateDisplay(current, dom_data);

  // 問題クリア判定
  if (current.currentTypedRomaji === current.currentQuestionRomaji) {
    document.removeEventListener("keydown", current._handleKey);
    nextQuestion(data, current, score_calculation, dom_data);
  }

  e.preventDefault();
}

// #onkeydownを使うためのクロージャ
function createKeyHandler(data, current, score_calculation, dom_data) {
  return function(e) {
    onKeydown(e, data, current, score_calculation, dom_data);
  };
}

// —————— 次の問題 or 終了 ——————
function nextQuestion(data, current, score_calculation, dom_data) {
  current.currentQuestionIndex++;
  if (current.currentQuestionIndex < data.length) {
    const handler = createKeyHandler(data, current, score_calculation, dom_data);
    document.addEventListener("keydown", handler);
    current._handleKey = handler;
    console.log("nextQuestion 呼び出し時の dom_data:", dom_data);
    loadQuestion(data, current, dom_data)
  } else {
    endGame(score_calculation, dom_data);
  }
}

function endGame(score_calculation, dom_data) {
  // #計算
  const elapsedMin = (Date.now() - score_calculation.startTime)/ 1000 / 60;  // #かかった時間
  const wpm      = score_calculation.totalCorrectChars / elapsedMin;
  const accuracy = score_calculation.totalCorrectChars / (score_calculation.totalCorrectChars + score_calculation.totalMistakes) * 100;
  const score    = wpm * Math.pow(accuracy / 100, 3);  // #e-typingの計算方法

  // #終了した際の結果を表示
  document.getElementById("result").style.display = "block";
  dom_data.elQuestion.textContent = "終了";

    // ✅ HTML要素への反映
  document.getElementById("score").textContent      = `スコア：${Math.round(score)}`;
  document.getElementById("wpm").textContent        = `WPM：${wpm.toFixed(2)}`;
  document.getElementById("accuracy").textContent   = `正打率：${accuracy.toFixed(2)}%`;
  document.getElementById("mistakes").textContent   = `誤打数：${score_calculation.totalMistakes}`;
  
  // 間違えたキーの表示（オブジェクトを文字列化）
  const mistakeStrings = Object.entries(score_calculation.keyMistakes)
    .map(([key, count]) => `${key}: ${count}回`).join(", ");
  document.getElementById("keymistakes").textContent = `間違えたキー：${mistakeStrings}`;

  console.log({
    score:    Math.round(score),
    wpm:      wpm.toFixed(2),
    accuracy: accuracy.toFixed(2) + "%",
    mistakes: score_calculation.totalMistakes,
    keyMistakes: score_calculation.keyMistakes,
  });
}