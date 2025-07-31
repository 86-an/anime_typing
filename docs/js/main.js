import { shuffleArray, onSearchTypeChange, makeYears, records_anime, records_voiceactor, records_character, kanaToRomaji } from "./data_select.js";

// #選択画面
document.addEventListener("DOMContentLoaded", () => {
  const select = document.querySelector("select");
  select.addEventListener("change", (e) => {
    onSearchTypeChange(e.target.value);
  });

  const numberContainer = document.getElementById("number");
  makeYears(numberContainer);

});

document.getElementById("isstart").addEventListener("click", () => {
  const select = document.querySelector("select");
  const selectedType = select.value;
  // #問題数を入れる
  const selected_number = document.querySelector('#number input[type="radio"]:checked');
  if (!selected_number) {
    alert("問題数が選択されていません！");
    return;
  }
  const problem_number = parseInt(selected_number.value, 10);

  let sourceData = null;
  // #データの選択
  if (selectedType === "animeTitle" && records_anime) {
    sourceData = records_anime;
  } else if (selectedType === "seiyuu" && records_voiceactor) {
    sourceData = records_voiceactor;
  } else if (selectedType === "character" && records_character) {
    sourceData = records_character;
  }
  // # gameの別ウィンドウにシャッフルしたデータ（ローマ字も追加）して送る
  if (sourceData) {
    const shuffled = shuffleArray(sourceData, problem_number);
    const shuffled_romaji = kanaToRomaji(shuffled, selectedType)
    console.log("配列：", shuffled_romaji)
    console.log("選択：", selectedType)
    console.log("ソースデータ：", sourceData)
    console.log("問題数：", problem_number)
    const gameWindow = window.open("../html/game.html", "GameWindow", "width=800,height=600");

    gameWindow.onload = () => {
      gameWindow.postMessage(
        { type: selectedType, data: shuffled_romaji },
        "*"
      );
    };
  } else {
    alert("データが読み込まれていません！");
  }
});

