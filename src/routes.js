import { getCars, getCar, insertCar, editCar } from "./controllers/index.js"
import { Router } from "express"

/** @param {string} id */
const isValidId = id => /^[1-9][0-9]{0,14}$/.test(id)

const routes = Router()

routes.use("*", (request, response, next) => {
	response.shouldKeepAlive = true
	response.setHeader("Access-Control-Allow-Origin", "*")

	next()
})

/**
 * Logs the error on the server and sends a generic 500 response,
 * so stack traces and database details are never exposed to clients.
 * @param {import("express").Response} response
 * @param {unknown} error
 */
function sendInternalError(response, error){
	console.error(error)
	response.status(500).json({ error: "Internal server error" })
}

routes.get("/cars", async (request, response) => {
	try{
		const cars = await getCars()
		response.status(200).json({ data: cars })
	}catch(error){
		sendInternalError(response, error)
	}
})

routes.route("/car/:id")
	.get(async (request, response) => {
		const { id } = request.params

		try{
			if(!isValidId(id)) return response.status(400).json({ error: "Invalid id" })

			const car = await getCar(Number(id))

			if(!car) return response.status(404).json({ error: "Car not found" })

			response.status(200).json({ result: car })
		}catch(error){
			sendInternalError(response, error)
		}
	})
	.put(async (request, response) => {
		const { id } = request.params
		let { model, plate } = request.query

		try{
			if(!isValidId(id)) throw "Invalid id"
			if(typeof model !== "string" || !(model = model?.trim())) throw "Invalid car model"
			if(typeof plate !== "string" || !(plate = plate?.trim())) throw "Invalid license plate"

			const result = await editCar({ id: Number(id), model, plate })

			if(!result.affectedRows) return response.status(404).json({ error: "Car not found" })

			response.status(200).json({ success: true })
		}catch(error){
			if(typeof error === "string") return response.status(400).json({ error })

			sendInternalError(response, error)
		}
	})

routes.post("/car", async (request, response) => {
	let { model, plate } = request.query

	try{
		if(typeof model !== "string" || !(model = model?.trim())) throw "Invalid car model"
		if(typeof plate !== "string" || !(plate = plate?.trim())) throw "Invalid license plate"

		/** @type {Parameters<typeof insertCar>[0]} */
		const info = { model, plate }
		const id = await insertCar(info)

		/** @type {import("./typings/api.js").CarModel} */
		const data = {
			id,
			...info
		}

		response.status(200).json({ data })
	}catch(error){
		if(typeof error === "string") return response.status(400).json({ error })

		sendInternalError(response, error)
	}
})

export default routes
