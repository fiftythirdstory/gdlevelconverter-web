import { LegacyLevel } from "./legacy-level-converter.mjs?v=1";
import { objChart, colObjs, legacyValues } from "./legacy-obj-charts.mjs?v=1";

/**
 * Converts a 1.9 level string to a legacy format (1.0-1.8)
 * @param {string} levelString19 - Level string in 1.9 format (header;object1;object2;...)
 * @param {string} targetVersion - Target version (e.g., "1.0", "1.8")
 * @returns {Object} {converted: string, removedCount: number, illegalObjects: string[]}
 */
export function convertLegacyLevel(levelString19, targetVersion = "1.0") {
	try {
		const level = new LegacyLevel(levelString19);
		
		// Get version-specific limits
		const versionInfo = LegacyLevel.perVersion(targetVersion);
		const maxObjs = versionInfo.max;
		
		// Objects that don't exist in legacy format
		const illegals = [
			'14', '31', '34', '37', '38', '42', '43', '44', 
			'55', '63', '64', '79', '100', '102', '108', '109', 
			'112', '142', '189'
		];
		
		// Color-related object IDs
		const colorObjs = ['29', '30', '104', '105'];
		
		// Accepted key indices for normal objects
		const acceptedValues = ['1', '2', '3', '4', '5', '6'];
		
		// Color-specific key indices
		const colValues = ['7', '8', '9', '10', '11', '14'];
		
		const illegalObjs = [];
		let newObj = "";
		
		// Process each object
		level.objects.forEach(object => {
			if (!object || object.indexOf(",") === -1) {
				// Skip completely invalid objects
				return;
			}
			
			const objInfo = LegacyLevel.robArray(object);
			let objId = objInfo['1'];
			
			// Handle color trigger conversion (2.1 color trigger 899 → legacy)
			if (objId === '899') {
				const colorType = objInfo['23'];
				if (colObjs[colorType] !== undefined) {
					objId = colObjs[colorType];
					objInfo['1'] = objId;
				}
			}
			
			// Convert object ID using objChart if needed
			if (objId > maxObjs && objChart[objId] !== undefined) {
				objId = objChart[objId];
				objInfo['1'] = objId;
			}
			
			// Check if object is illegal for this version
			if (illegals.indexOf(objId) !== -1 || objId > maxObjs) {
				illegalObjs.push(objId);
				return;
			}
			
			// Rebuild object with only accepted keys
			let tempObj = "";
			for (const [key, value] of Object.entries(objInfo)) {
				// Accept standard keys or color-specific keys
				if (acceptedValues.includes(key) || 
					(colorObjs.includes(objId) && colValues.includes(key))) {
					if (key > '1') {
						newObj += ",";
						tempObj += ",";
					}
					newObj += `${key},${value}`;
					tempObj += `${key},${value}`;
				}
			}
			
			newObj += ";";
		});
		
		// Build the final level string with legacy header
		const legacyHeader = LegacyLevel.header(level.header, targetVersion);
		const finalLevelString = `${legacyHeader};${newObj}`;
		
		return {
			converted: finalLevelString,
			removedCount: illegalObjs.length,
			illegalObjects: illegalObjs
		};
	} catch (error) {
		throw new Error(`Legacy conversion error: ${error.message}`);
	}
}
