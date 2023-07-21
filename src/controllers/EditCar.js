import connection from "../db.js"

/**
 * Edits an existing car in the database
 * @param {import("../typings/api.js").CarModel} info
 * @returns {Promise<import("mysql").OkPacket>}
 */
export default function EditCar({ id, model, plate }){
	return new Promise((resolve, reject) => {
		connection.query("UPDATE cars SET model = ?, plate = ? WHERE id = ?", [model, plate, id], (error, results) => {
			if(error) return reject(error)
			resolve(results)
		})
	})
}
