/** @param {any} number */
export default function isNumber(number){
	if(number === 0) return true
	if(!number) return false

	number = Number(number)

	return Number.isFinite(number) && !Number.isNaN(number)
}
