import { shuffleArray, onSearchTypeChange, makeYears, records_anime, records_voiceactor, records_character, kanaToRomajiArray } from "./data_select.js";

// #選択画面
document.addEventListener("DOMContentLoaded", () => {
  localStorage.removeItem("selectedType");
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
    const yearInput = document.querySelector('#years-boxes input[type="radio"]:checked');
    if (yearInput) {
      const yearValue = yearInput.value;
      console.log("年度データ：", yearValue)
      if (yearValue === "all") {
        // すべてのデータを対象にする（フィルタしない）
        // sourceData はそのまま
      } else {
        const selectedYear = parseInt(yearValue, 10);
        if (Number.isInteger(selectedYear)) {
        sourceData = sourceData.filter(item => {
          return parseInt(item.seasonYear, 10) === selectedYear;
        });
        }
      }
    }
  } else if (selectedType === "seiyuu" && records_voiceactor) {
    sourceData = records_voiceactor;
  } else if (selectedType === "character" && records_character) {
    sourceData = records_character;
  }
  // # gameの別ウィンドウにシャッフルしたデータ（ローマ字も追加）して送る
  if (sourceData) {
    const shuffled = shuffleArray(sourceData, problem_number);
    const shuffled_romaji = kanaToRomajiArray(shuffled)
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

