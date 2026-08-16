import { objChart, colObjs, legacyValues } from "./legacy-obj-charts.mjs?v=1";

/**
 * Represents a legacy level (1.0-1.8)
 */
class LegacyLevel {
	constructor(levelString) {
		if (!levelString || levelString.match(/;/g)?.length <= 1) {
			throw new Error("Level empty or invalid.");
		}
		if (levelString.endsWith(";")) {
			levelString = levelString.slice(0, -1);
		}
		this.header = levelString.split(";")[0];
		this.objects = levelString.split(";").slice(1);
		this.objectCount = this.objects.length;
	}

	/**
	 * Converts header string to readable object
	 * @param {string} header
	 * @returns {Object} header dictionary
	 */
	static defineHeader(header) {
		const hObj = LegacyLevel.robArray(header, ',');
		const hDict = {};
		if (hObj['kS38']) {
			const cols = hObj['kS38'].slice(0, hObj['kS38'].length - 1).split('|');
			cols.forEach(colStr => {
				const col = LegacyLevel.robArray(colStr, '_');
				if (legacyValues[col['6']]) {
					hDict[col['6']] = {
						red: col['1'],
						green: col['2'],
						blue: col['3']
					};
				}
			});
		}
		return hDict;
	}

	/**
	 * Builds legacy format header
	 * @param {string} header
	 * @param {string} target target version
	 * @returns {string} legacy header
	 */
	static header(header, target) {
		const hDict = LegacyLevel.defineHeader(header);
		const kA = header.split(',').slice(2);
		let legacyHeader = "";
		
		Object.keys(hDict).forEach(key => {
			Object.keys(hDict[key]).forEach(subkey => {
				legacyHeader += `${legacyValues[key][subkey]},${hDict[key][subkey]},`;
			});
		});
		
		legacyHeader += kA;
		return legacyHeader;
	}

	/**
	 * Parses a string into key-value pairs
	 * @param {string} str
	 * @param {string} char delimiter (default: ",")
	 * @returns {Object} parsed object
	 */
	static robArray(str, char = ",") {
		if (!str || str.length === 0) return str;
		
		const strArray = str.split(char);
		const parsedStr = {};
		
		for (let i = 0; i < strArray.length; i++) {
			if (i === 0 || i % 2 === 0) {
				parsedStr[strArray[i]] = strArray[i + 1];
			}
		}
		return parsedStr;
	}

	/**
	 * Gets version-specific object limits and info
	 * @param {string} version target version (e.g., "1.0", "1.8")
	 * @returns {Object} {max, gameVersion, songs}
	 */
	static perVersion(version) {
		const versionMap = {
			"1.0": { max: 44, gameVersion: 1, songs: 6 },
			"1.1": { max: 46, gameVersion: 2, songs: 7 },
			"1.2": { max: 47, gameVersion: 3, songs: 8 },
			"1.3": { max: 84, gameVersion: 4, songs: 9 },
			"1.4": { max: 104, gameVersion: 5, songs: 10 },
			"1.5": { max: 141, gameVersion: 6, songs: 11 },
			"1.6": { max: 199, gameVersion: 7, songs: 13 },
			"1.7": { max: 285, gameVersion: 10, songs: 14 },
			"1.8": { max: 505, gameVersion: 18, songs: 15 }
		};

		return versionMap[version] || versionMap["1.6"];
	}
}

export { LegacyLevel };
