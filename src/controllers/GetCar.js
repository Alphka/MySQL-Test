import connection from "../db.js"

/**
 * Gets car by id from database
 * @param {number} id
 * @returns {Promise<import("../typings/api.js").CarModel | null>}
 */
export default function GetCar(id){
	return new Promise((resolve, reject) => {
		connection.query("SELECT * FROM cars WHERE id = ?", [id], (error, results) => {
			if(error) return reject(error)
			resolve(results.length ? results[0] : null)
		})
	})
}
