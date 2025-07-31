// utils.js

// グローバル変数にデータを格納するためのセッター関数群
// main.jsから呼び出される
// (main.jsのグローバル変数を直接いじるのは好ましくないが、簡易的なデモのため許容)
let _setAnimeData;
let _setCharacterData;
let _setVoiceActorData;

// DOMContentLoadedより前に実行されるため、main.jsのセッター関数を保持
document.addEventListener('DOMContentLoaded', () => {
    _setAnimeData = window.setAnimeData;
    _setCharacterData = window.setCharacterData;
    _setVoiceActorData = window.setVoiceActorData;
});

// CSVデータの読み込み
async function loadCsvData(filePath, type) {
    try {
        const response = await fetch(filePath);
        const text = await response.text();
        const parsedData = parseCsv(text);

        // main.js のグローバル変数にデータを格納
        if (type === 'anime') {
            _setAnimeData(parsedData);
        } else if (type === 'character') {
            _setCharacterData(parsedData);
        } else if (type === 'voiceActor') {
            _setVoiceActorData(parsedData);
        }
        console.log(`${filePath} データ読み込み完了:`, parsedData);
    } catch (error) {
        console.error(`${filePath} の読み込みまたはパースに失敗しました:`, error);
        throw new Error(`データファイル (${filePath}) の読み込みに失敗しました。`); // エラーを再スロー
    }
}

// CSVパース関数
function parseCsv(text) {
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const data = [];

    for (let i = 1; i < lines.length; i++) {
        const values = parseCsvLine(lines[i]);
        if (values.length === headers.length) {
            const row = {};
            headers.forEach((header, index) => {
                row[header] = values[index];
            });
            data.push(row);
        }
    }
    return data;
}

// ダブルクォーテーション内のカンマを考慮してCSV行をパースするヘルパー関数
function parseCsvLine(line) {
    const result = [];
    let inQuote = false;
    let currentField = '';

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            inQuote = !inQuote;
        } else if (char === ',' && !inQuote) {
            result.push(currentField.trim());
            currentField = '';
        } else {
            currentField += char;
        }
    }
    result.push(currentField.trim());
    return result;
}

// 問題生成関数
function generateQuestions(animeData, characterData, voiceActorData, selectedType, selectedPeriodType, selectedYear, count) {
    let questions = [];
    let sourceData = [];
    let questionField = ''; // 問題として使用するフィールド名

    if (selectedType === 'animeTitle') {
        sourceData = animeData;
        questionField = 'titleKana'; // アニメのタイトルはかなをタイピング対象に

        if (selectedPeriodType === 'year' && selectedYear !== 'all') {
            sourceData = sourceData.filter(item => String(item.seasonYear) === selectedYear);
        }
    } else if (selectedType === 'voiceActor') {
        sourceData = voiceActorData;
        questionField = 'nameKana'; // 声優はかなをタイピング対象に
    } else if (selectedType === 'character') {
        sourceData = characterData;
        questionField = 'nameKana'; // キャラクターはかなをタイピング対象に
    }

    // ランダムにシャッフル
    sourceData.sort(() => 0.5 - Math.random());

    // 出題数に応じて問題を切り取る
    for (let i = 0; i < Math.min(count, sourceData.length); i++) {
        const item = sourceData[i];
        if (item && item[questionField]) {
            questions.push(item[questionField]); // かな文字列を問題として追加
        }
    }
    return questions;
}

// スコア計算関数
function calculateScore(totalCorrectChars, startTime, endTime) {
    const timeInSeconds = (endTime - startTime) / 1000;
    const charactersPerSecond = timeInSeconds > 0 ? totalCorrectChars / timeInSeconds : 0;
    const wordsPerMinute = (charactersPerSecond * 60) / 5;

    return {
        wpm: wordsPerMinute,
        cps: charactersPerSecond
    };
}

// かな・記号・スペースが含まれるかチェックする関数
// (問題文に含めない前提だが、ゲーム内でスキップ処理をしているため、デバッグ用やバリデーション用)
function containsKanaOrSymbols(text) {
    return /[^\x00-\x7F\xFF61-\xFF9F]/.test(text) || // ASCII英数記号と半角カナ以外
           /[\u3040-\u309F\u30A0-\u30FF\u3000]/.test(text); // ひらがな、カタカナ、全角スペース
}