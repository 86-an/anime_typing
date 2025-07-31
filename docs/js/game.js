import {startGame} from "./game_function.js"

window.addEventListener("DOMContentLoaded", () => {
  window.addEventListener("message", (event) => {
    const { type, data } = event.data;
    console.log("タイプ:", type);
    console.log("データ:", data);
    console.log("typeof data:", typeof data);
    console.log("isArray:", Array.isArray(data));
    console.log("event.data 全体:", event.data);
    console.log("data の値:", data);

    let current = {
      currentQuestionIndex : 0,
      currentQuestionRomaji : "",
      currentTypedRomaji : "",
      questions : data,
    };

    let score_calculation = {
      startTime : 0,
      totalCorrectChars : 0,
      totalMistakes : 0,
      keyMistakes : {},
    }


    // DOM要素
    let dom_data = {
      elQuestion : document.getElementById("question"),
      elTyped : document.getElementById("typed"),
      elRemaining : document.getElementById("remaining"),
      elTypingInput: document.getElementById("typingInput"),
    };

    console.log("dom_data:", dom_data);
    console.log("elQuestion:", dom_data.elQuestion);
    startGame(data, current, dom_data, score_calculation)
  });
});




