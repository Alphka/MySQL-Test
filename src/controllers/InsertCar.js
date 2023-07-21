import connection from "../db.js"

/**
 * Inserts a new car in the database
 * @param {Omit<import("../typings/api.js").CarModel, "id">} info
 * @returns {Promise<number>}
 */
export default function InsertCar({ model, plate }){
	return new Promise((resolve, reject) => {
		connection.query("INSERT INTO cars (model, plate) VALUES (?, ?)", [model, plate], (error, results) => {
			if(error) return reject(error)
			resolve(results.insertId)
		})
	})
}
