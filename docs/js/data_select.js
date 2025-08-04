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
      records_anime = data.map(({ title, titleKana, ...rest }) => ({
        ...rest,                 // title / titlekana を除いたその他のキー
        name: title,             // 意味的に統合
        nameKana: titleKana
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

export function kanaToRomaji(array) {
  return array.map(item => {
    return {
      ... item, 
      nameRo: wanakana.toRomaji(item.nameKana || "")
  };
})
}

export function kanaToRomajiArray(array) {
  return array.map(({ nameKana, ...rest }) => {
    const cleanedKana = nameKana
      .replace(/[^\u3040-\u30FFー]/g, '') // 非かな文字
      .replace(/[ 　]/g, '');             // 半角・全角スペース

    return {
      ...rest,
      nameKana: cleanedKana,
      nameRo: [kanaToRoman(cleanedKana, 'kunrei', {longSound: "hyphen"}), kanaToRoman(cleanedKana, 'hepburn',{longSound: "hyphen"})]
    };
  });
}


/**
 * ひらがなまたはカタカナからローマ字へ変換
 * @param {string} targetStr ローマ字へ変換する文字列（変換元の文字列）
 * @param {"hepburn"|"kunrei"} [type="hepburn"] ローマ字の種類
 * @param {Object} [options] その他各種オプション
 *                           {boolean} [options.bmp=true] ... "ん"（n）の次がb.m.pの場合にnからmへ変換するかどうか
 *                           {"latin"|"hyphen"} [options.longSound="latin"] ... 長音の表し方
 * @returns {string} ローマ字へ変換された文字列を返す
 */
const kanaToRoman = (targetStr, type, options) => {
	/**
	 * 変換マップ
	 */
	const romanMap = {
		'あ' : 'a',
		'い' : 'i',
		'う' : 'u',
		'え' : 'e',
		'お' : 'o',
		'か' : 'ka',
		'き' : 'ki',
		'く' : 'ku',
		'け' : 'ke',
		'こ' : 'ko',
		'さ' : 'sa',
		'し' : { hepburn : 'shi', kunrei : 'si' },
		'す' : 'su',
		'せ' : 'se',
		'そ' : 'so',
		'た' : 'ta',
		'ち' : { hepburn : 'chi', kunrei : 'ti' },
		'つ' : { hepburn : 'tsu', kunrei : 'tu' },
		'て' : 'te',
		'と' : 'to',
		'な' : 'na',
		'に' : 'ni',
		'ぬ' : 'nu',
		'ね' : 'ne',
		'の' : 'no',
		'は' : 'ha',
		'ひ' : 'hi',
		'ふ' : { hepburn : 'fu', kunrei : 'hu' },
		'へ' : 'he',
		'ほ' : 'ho',
		'ま' : 'ma',
		'み' : 'mi',
		'む' : 'mu',
		'め' : 'me',
		'も' : 'mo',
		'や' : 'ya',
		'ゆ' : 'yu',
		'よ' : 'yo',
		'ら' : 'ra',
		'り' : 'ri',
		'る' : 'ru',
		'れ' : 're',
		'ろ' : 'ro',
		'わ' : 'wa',
		'ゐ' : 'wi',
		'ゑ' : 'we',
		'を' : { hepburn : 'o', kunrei : 'wo' },
		'ん' : 'n',
		'が' : 'ga',
		'ぎ' : 'gi',
		'ぐ' : 'gu',
		'げ' : 'ge',
		'ご' : 'go',
		'ざ' : 'za',
		'じ' : { hepburn : 'ji', kunrei : 'zi' },
		'ず' : 'zu',
		'ぜ' : 'ze',
		'ぞ' : 'zo',
		'だ' : 'da',
		'ぢ' : { hepburn : 'ji', kunrei : 'di' },
		'づ' : { hepburn : 'zu', kunrei : 'du' },
		'で' : 'de',
		'ど' : 'do',
		'ば' : 'ba',
		'び' : 'bi',
		'ぶ' : 'bu',
		'べ' : 'be',
		'ぼ' : 'bo',
		'ぱ' : 'pa',
		'ぴ' : 'pi',
		'ぷ' : 'pu',
		'ぺ' : 'pe',
		'ぽ' : 'po',
		'うぁ' : 'uxa',
		'うぃ' : 'uxi',
		'うぇ' : 'uxe',
		'うぉ' : 'uxo',
		'きゃ' : 'kya',
		'きぃ' : 'kyi',
		'きゅ' : 'kyu',
		'きぇ' : 'kye',
		'きょ' : 'kyo',
		'くぁ' : 'qa',
		'くぃ' : 'qi',
		'くぇ' : 'qe',
		'くぉ' : 'qo',
		'くゃ' : 'qya',
		'くゅ' : 'qyu',
		'くょ' : 'qyo',
		'しゃ' : { hepburn : 'sha', kunrei : 'sya' },
		'しぃ' : 'syi',
		'しゅ' : { hepburn : 'shu', kunrei : 'syu' },
		'しぇ' : 'sye',
		'しょ' : { hepburn : 'sho', kunrei : 'syo' },
		'ちゃ' : { hepburn : 'cha', kunrei : 'tya' },
		'ちぃ' : ['tyi'],
		'ちゅ' : { hepburn : 'chu', kunrei : 'tyu' },
		'ちぇ' : ['tye'],
		'ちょ' : { hepburn : 'cho', kunrei : 'tyo' },
		'てゃ' : 'tha',
		'てぃ' : 'thi',
		'てゅ' : 'thu',
		'てぇ' : 'the',
		'てょ' : 'tho',
		'ひゃ' : 'hya',
		'ひぃ' : 'hyi',
		'ひゅ' : 'hyu',
		'ひぇ' : 'hye',
		'ひょ' : 'hyo',
		'ふぁ' : 'fa',
		'ふぃ' : 'fi',
		'ふぇ' : 'fe',
		'ふぉ' : 'fo',
		'りゃ' : 'rya',
		'りゅ' : 'ryu',
		'りょ' : 'ryo',
		'みゃ' : 'mya',
		'みぃ' : 'myi',
		'みゅ' : 'myu',
		'みぇ' : 'mye',
		'みょ' : 'myo',
		'ゔぁ' : 'va',
		'ゔぃ' : 'vi',
		'ゔぇ' : 've',
		'ゔぉ' : 'vo',
		'ぎゃ' : 'gya',
		'ぎぃ' : 'gyi',
		'ぎゅ' : 'gyu',
		'ぎぇ' : 'gye',
		'ぎょ' : 'gyo',
		'じゃ' : { hepburn : 'ja', kunrei : 'zya' },
		'じぃ' : 'zyi',
		'じゅ' : { hepburn : 'ju', kunrei : 'zyu' },
		'じぇ' : 'zye',
		'じょ' : { hepburn : 'jo', kunrei : 'zyo' },
		'ぢゃ' : { hepburn : 'dya', kunrei : 'zya' },
		'ぢぃ' : 'dyi',
		'ぢゅ' : { hepburn : 'dyu', kunrei : 'zya' },
		'ぢぇ' : 'dye',
		'ぢょ' : { hepburn : 'dyo', kunrei : 'zya' },
		'びゃ' : 'bya',
		'びぃ' : 'byi',
		'びゅ' : 'byu',
		'びぇ' : 'bye',
		'びょ' : 'byo',
		'ぴゃ' : 'pya',
		'ぴぃ' : 'pyi',
		'ぴゅ' : 'pyu',
		'ぴぇ' : 'pye',
		'ぴょ' : 'pyo',
		'てゃ': 'tha',
		'てぃ': 'thi',
		'てゅ': 'thu',
		'でゃ': 'dha',
		'でぃ': 'dhi',
		'でゅ': 'dhu',
		'とぅ': 'tu',
		'どぅ': 'du',
		'つぁ': 'tsa',
		'つぃ': 'tsi',
		'つぇ': 'tse',
		'つぉ': 'tso',
		'しぇ': { hepburn: 'she', kunrei: 'sye' },
		'じぇ': { hepburn: 'je', kunrei: 'zye' },
		'ちぇ': { hepburn: 'che', kunrei: 'tye' },
		'ちぇ': 'che', // カタカナ対応
		'じぇ': 'je',
		'てぃ': 'ti',
		'でぃ': 'di',
		'つぁ': 'tsa',
		'ゔ' : 'vu',
		'にゃ' : 'nya',
		'にゅ' : 'nyu',
		'にょ' : 'nyo',
		'ー' : '-',
		'、' : ', ',
		'，' : ', ',
		'。' : '.'
	};

	/**
	 * 長音のラテン文字
	 */
	const latins = {
		hepburn : {
			'a' : 257,
			'i' : 299,
			'u' : 363,
			'e' : 275,
			'o' : 333
		},
		kunrei : {
			'a' : 226,
			'i' : 238,
			'u' : 251,
			'e' : 234,
			'o' : 244
		}
	};

	if (typeof targetStr !== 'string' && typeof targetStr !== 'number') {
		throw '変換する対象が文字列ではありません。';
	}

	if (typeof type !== 'string' || !type.match(/^(hepburn|kunrei)$/)) type = 'hepburn';

	if (!options) options = {};
	if (typeof options.kana !== 'string') options.kana = 'all';
	if (!options.kana.match(/^(all|hiragana|katakana)$/)) options.kana = 'all';
	if (typeof options.bmp !== 'boolean') options.bmp = true;
	if (typeof options.longSound !== 'string') options.longSound = 'latin';
	if (!options.longSound.match(/^(latin|hyphen)$/)) options.longSound = 'latin';

	let remStr = String(targetStr), result = '', slStr, roman, lastStr;

	/**
	 * 残りの文字列から1文字を切り抜く
	 * @returns {string} 切り抜いた1つの文字列を返す
	 */
	const splice = () => {
		const oneChar = remStr.slice(0, 1);
		remStr = remStr.slice(1);
		return oneChar;
	};

	/**
	 * 残りの文字列の最初が小文字か判定
	 * @returns {boolean} 小文字の場合はtrue、そうでない場合はfalseを返す
	 */
	const isSmallChar = () => !!remStr.slice(0, 1).match(/^[ぁぃぅぇぉゃゅょァィゥェォャュョ]$/);

	/**
	 * カタカナからひらがなへ変換
	 * @param {string} kana 元とおなるカタカナ
	 * @returns {string} ひらがなへ変換された文字列
	 */
	const toHiragana = kana => kana.replace(/[\u30a1-\u30f6]/g, match => {
		return String.fromCharCode(match.charCodeAt(0) - 0x60);
	});

	/**
	 * ひらがなから対応するローマ字を取得
	 * @param {string} kana 元となるひらがな
	 * @returns {string} 見つかった場合は対応するローマ字、見つからなかったら元のひらがなを返す
	 */
	const getRoman = kana => {
		const roman = romanMap[toHiragana(kana)];

		if (roman) {
			if (typeof roman === 'string') {
				return roman;
			} else if (type === 'hepburn') {
				return roman.hepburn;
			} else if (type === 'kunrei') {
				return roman.kunrei;
			}
		} else {
			return kana;
		}
	};

	while (remStr) {
		slStr = splice();

		if (slStr.match(/^(っ|ッ)$/)) {
			slStr = splice();
			if (isSmallChar()) slStr += splice();

			roman = getRoman(slStr);
			roman = (roman !== slStr ? roman.slice(0, 1) : '') + roman;
		} else {
			if (isSmallChar()) slStr += splice();

			roman = getRoman(slStr);
		}

		const nextRoman = kanaToRoman(remStr.slice(0, 1));

		if (roman === 'n') {
			if (nextRoman.match(/^[aiueo]$/)) {
				roman += type === 'hepburn' ? '-': '\'';
			} else if (options.bmp && nextRoman.match(/^[bmp]/) && type === 'hepburn') {
				roman = 'm';
			}
		} else if (roman === '-') {
			lastStr = result.match(/[aiueo]$/);
			if (lastStr && options.longSound === 'latin') {
				result = result.slice(0, -1);
				roman = String.fromCharCode(latins[type][lastStr[0]]);
			}
		}

		result += roman;
	}

	return result;
};