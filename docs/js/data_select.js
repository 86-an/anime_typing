// # CSVを読み込んでパースする
export async function loadCSV(path) {
    const res = await fetch(path);
    const text = await res.text();
    const lines = text.trim().split("\n");
    const headers = lines[0].split(",").map(h => h.trim());
    const records = lines.slice(1).map(line => {
    const values = line.split(",").map(v => v.trim());
    return Object.fromEntries(headers.map((h, i) => [h, values[i]]));
    });
    return records;
}

// # ユニークな値（年度）の抽出と全期間の追加
export function getUnique(records, key) {
    const uniqueValues = new Set();
    
    records.forEach(r => {
        const value = r[key];
        // 値が存在し、かつ数値に変換できるもののみをSetに追加
        // !isNaN(value) は '2000' のような文字列も数値と判定できる
        if (value !== undefined && value !== null && value !== '' && !isNaN(value)) {
            uniqueValues.add(value);
        }
    });

    // Setを配列に変換してソート（ここでは、年度を想定して降順にソートします）
    // 数値としてソートされるように、比較関数で数値変換を行う
    const sortedValues = Array.from(uniqueValues).sort((a, b) => parseInt(b, 10) - parseInt(a, 10));

    return ["all", ... sortedValues]
}

// # 疑似乱数でシャッフル
export function shuffleArray(array, number) {
    return array.sort(() => Math.random() - 0.5).slice(0, number);
}

// # チェックボックスを生成
export function createCheckboxes(containerId, values, name) {
    const container = document.getElementById(containerId);
    container.innerHTML = "";
    values.forEach(val => {
    const cleanVal = val.trim();
    const id = `${name}-${cleanVal}`;
    const label = document.createElement("label");
    label.innerHTML = `<input type="radio" name="${name}" value="${cleanVal}" id="${id}"> ${cleanVal}`;
    container.appendChild(label);
    });
}

// # 選択されたチェックボックスの値を取得
export function getCheckedValues(name) {
    return [...document.querySelectorAll(`input[name="${name}"]:checked`)].map(cb => cb.value);
}

export let records_anime, records_voiceactor, records_character;

export function onSearchTypeChange(type) {
    const yearsBox = document.getElementById("years-boxes");
    yearsBox.innerHTML ="";

  if (type === "animeTitle") {
    // データが未取得ならロードしてから生成
    if (!records_anime) {
      loadCSV("../data/anime.csv").then(data => {
      records_anime = data.map(({ title, titlekana, ...rest }) => ({
        ...rest,                 // title / titlekana を除いたその他のキー
        name: title,             // 意味的に統合
        nameKana: titlekana
      }));
        const years = getUnique(records_anime, "seasonYear");
        createCheckboxes("years-boxes", years, "year");
      });
    } else {
      // 既にデータがあるなら即座に生成
      const years = getUnique(records_anime, "seasonYear");
      createCheckboxes("years-boxes", years, "year");
    }
  }

  
    else if (type === "seiyuu" && !records_voiceactor){
    loadCSV("../data/voiceactor.csv").then(data => {
      records_voiceactor = data;
    });
 }

    else if (type === "character" && !records_character){
    loadCSV("../data/character.csv").then(data => {
      records_character = data;
    });
 }
}

export function makeYears(container){
    for (let i = 10; i <= 100; i += 10) {
    const label = document.createElement("label");
    const input = document.createElement("input");
    input.type = "radio";
    input.name = "num";
    input.value = i;
    label.appendChild(input);
    label.appendChild(document.createTextNode(i));
    container.appendChild(label);
 }
}

export function kanaToRomaji(array, type) {
  return array.map(item => {
    if ( type === "seiyuu" || type === "character"){
      return {
        ... item, 
        nameRo: wanakana.toRomaji(item.nameKana || "")
      };
    }
    else {
      return {
      ... item,
      nameRo: wanakana.toRomaji(item.titleKana || "")
      }
    };
  })
}