import connection from "../db.js"

/**
 * Gets all cars in the database
 * @returns {Promise<import("../typings/api.js").CarModel[]>}
 */
export default function GetCars(){
	return new Promise((resolve, reject) => {
		connection.query("SELECT * FROM cars", (error, results) => {
			if(error) return reject(error)
			resolve(results)
		})
	})
}
