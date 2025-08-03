
export function startGame(data, current, dom_data, score_calculation) {
    score_calculation.startTime = Date.now();
    loadQuestion(data, current, dom_data);
    const handler = createKeyHandler(data, current, score_calculation, dom_data);
    document.addEventListener("keydown", handler);
    current._handleKey = handler;
}

export async function loadMultiRoMap() { 
  const response =  await fetch("../data/multi_ro.json"); 
  const data = await response.json(); 
  console.log("jsonのデータ：", data)
  return data; 
}

export function normalizeRomaji(inputRomaji, multiRoMap, inputFirstChar=null) {
  let normalized = inputRomaji;
  for (const kana in multiRoMap) {
    let variants = [...multiRoMap[kana]];
    const standard = variants[0];

    if (inputFirstChar) {
      variants = variants.filter(v => v.startsWith(inputFirstChar))
    }
    for (const alt of variants.slice(1)) {
      const regex = new RegExp(escapeRegex(alt), "g"); // ✅ 正しく alt を使う
      normalized = normalized.replace(regex, standard);
    }
  }
  return normalized;
}

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function loadQuestion(data, current, dom_data) {
  console.log("呼び出し時の dom_data:", dom_data);
    current.question = data[current.currentQuestionIndex];
    current.currentQuestionRomaji = current.question.nameRo[0];
    current.currentTypedRomaji = "";
    dom_data.elQuestionName.textContent = `${current.question.name}`;
    dom_data.elQuestionKana.textContent = `${current.question.nameKana}`
    updateDisplay(current, dom_data);
}

export function updateDisplay(current, dom_data){
  const typed = current.currentTypedRomaji;

  // ✅ 最初にマッチする nameRo を探す
  const matchedRomaji = current.question.nameRo.find(ro => ro.startsWith(typed)) || current.question.nameRo[0];

  const remaining = matchedRomaji.slice(typed.length);

  dom_data.elTyped.textContent = typed;
  dom_data.elRemaining.textContent = remaining;
}


function onKeydown(e, data, current, score_calculation, dom_data) {
  if (!score_calculation.startTime) score_calculation.startTime = Date.now();

  const key = e.key;
  // ✅ 無視する文字（記号やスペース）
  if (key === " " || key === "　") return;
  if (key.length !== 1) return;

  // ✅ 入力を仮に追加してみる
  const nextTyped = current.currentTypedRomaji + key;

  // ✅ normalizeして判定（multiRoMap は事前に読み込み済みとする）
  const normalizedInput = normalizeRomaji(nextTyped, current.multiRoMap);

  const matched = current.question.nameRo.find(ro => normalizeRomaji(ro, current.multiRoMap).startsWith(normalizedInput));

  if (matched) {
    current.currentTypedRomaji += key;
    score_calculation.totalCorrectChars++;
  } else {
    score_calculation.totalMistakes++;
    score_calculation.keyMistakes[key] = (score_calculation.keyMistakes[key] || 0) + 1;
  }



  updateDisplay(current, dom_data);
  // 問題クリア判定（normalizeして比較）
  const normalizedTyped = normalizeRomaji(current.currentTypedRomaji, current.multiRoMap);
  const isCorrect = current.question.nameRo.some(ro => normalizeRomaji(ro, current.multiRoMap) === normalizedTyped);

  if (isCorrect) {
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
  dom_data.elQuestionName.textContent = "終了";
  dom_data.elQuestionKana.textContent = "しゅうりょう"

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