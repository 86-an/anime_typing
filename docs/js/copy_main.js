// main.js

// DOM要素の取得
const settingsArea = document.getElementById('settings');
const gameArea = document.getElementById('gameArea');
const resultArea = document.getElementById('resultArea');

const radioAnimeTitle = document.getElementById('radioAnimeTitle');
const radioVoiceActor = document.getElementById('radioVoiceActor');
const radioCharacter = document.getElementById('radioCharacter');
const animeTitleOptions = document.getElementById('animeTitleOptions');
const radioAllPeriod = document.getElementById('radioAllPeriod');
const radioYear = document.getElementById('radioYear');
const yearSelect = document.getElementById('yearSelect');
const questionCountInput = document.getElementById('questionCount');
const startGameButton = document.getElementById('startGameButton');
const restartGameButton = document.getElementById('restartGameButton');

const currentQuestionNumberDisplay = document.getElementById('currentQuestionNumber');
const totalQuestionsDisplay = document.getElementById('totalQuestions');
const questionDisplay = document.getElementById('questionDisplay');
const typingInput = document.getElementById('typingInput');
const currentRomajiDisplay = document.getElementById('currentRomajiDisplay');
const feedbackDisplay = document.getElementById('feedback');

const scoreWPMDisplay = document.getElementById('scoreWPM');
const scoreCPSDisplay = document.getElementById('scoreCPS');
const mistakeCountDisplay = document.getElementById('mistakeCountDisplay');
const 苦手キーList = document.getElementById('苦手キーList');
const commentDisplay = document.getElementById('comment');
const resultImageDisplay = document.getElementById('resultImage');


document.addEventListener('DOMContentLoaded', async () => {
    // gameLogic.jsに渡すDOM要素をまとめる
    const domElements = {
        settingsArea, gameArea, resultArea,
        radioAnimeTitle, radioVoiceActor, radioCharacter,
        animeTitleOptions, radioAllPeriod, radioYear, yearSelect,
        questionCountInput, startGameButton, restartGameButton,
        currentQuestionNumberDisplay, totalQuestionsDisplay,
        questionDisplay, typingInput, currentRomajiDisplay, feedbackDisplay,
        scoreWPMDisplay, scoreCPSDisplay, mistakeCountDisplay,
        苦手キーList, commentDisplay, resultImageDisplay
    };

    // gameLogic.js の初期化関数を呼び出し、DOM要素を渡す
    // (globalThis.initializeGameLogic は gameLogic.js で定義されている)
    if (typeof initializeGameLogic === 'function') {
        initializeGameLogic(domElements);
    } else {
        console.error('initializeGameLogic関数が見つかりません。gameLogic.jsが正しく読み込まれていますか？');
        return;
    }

    let animeData = [];
    let characterData = [];
    let voiceActorData = [];

    try {
        // 全てのCSVデータを読み込む (utils.js で定義されている loadCsvData を使用)
        const [anime, character, voiceActor] = await Promise.all([
            loadCsvData('anime.csv', 'anime'),
            loadCsvData('character.csv', 'character'),
            loadCsvData('voiceactor.csv', 'voiceActor')
        ]);
        animeData = anime;
        characterData = character;
        voiceActorData = voiceActor;

        // 読み込んだデータを gameLogic に渡す
        if (typeof setAllGameData === 'function') {
            setAllGameData(animeData, characterData, voiceActorData);
        } else {
            console.error('setAllGameData関数が見つかりません。gameLogic.jsが正しく読み込まれていますか？');
        }

    } catch (error) {
        console.error('初期データロード中にエラー:', error);
        alert('ゲームデータの読み込みに失敗しました。ページをリロードしてください。');
    }
});