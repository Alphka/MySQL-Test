import { GetCars, GetCar, InsertCar, EditCar } from "./controllers/index.js"
import { Router } from "express"
import isNumber from "./helpers/isNumber.js"

const routes = Router()

routes.use("*", (request, response, next) => {
	response.shouldKeepAlive = true
	response.setHeader("Access-Control-Allow-Origin", "*")

	next()
})

/** @param {unknown} error */
function GetErrorMessage(error){
	switch(typeof error){
		case "string": return error
		case "object": if(error instanceof Error) return error.stack
	}

	return String(error)
}

routes.get("/cars", async (request, response) => {
	try{
		const carros = await GetCars()
		response.status(200).json({ data: carros })
	}catch(error){
		console.error(error)

		const message = GetErrorMessage(error)

		response.status(500).json({ error: message })
	}
})

routes.route("/car/:id")
	.get(async (request, response) => {
		const { id } = request.params

		try{
			if(!isNumber(id)) return response.status(400).json({ error: "Invalid id" })

			const car = await GetCar(Number(id))

			if(!car) return response.status(404).json({ error: "Car not found" })

			response.status(200).json({ result: car })
		}catch(error){
			console.error(error)

			const message = GetErrorMessage(error)

			response.status(500).json({ error: message })
		}
	})
	.put(async (request, response) => {
		const { id } = request.params
		let { model, plate } = request.query

		try{
			if(!isNumber(id)) throw "Invalid id"
			if(typeof model !== "string" || !(model = model?.trim())) throw "Invalid car model"
			if(typeof plate !== "string" || !(plate = plate?.trim())) throw "Invalid license plate"

			await EditCar({ id: Number(id), model, plate })

			response.status(200).json({ success: true })
		}catch(error){
			if(typeof error === "string") return response.status(400).json({ error })

			const message = GetErrorMessage(error)

			response.status(500).json({ error: message })
		}
	})

routes.post("/car", async (request, response) => {
	let { model, plate } = request.query

	try{
		if(typeof model !== "string" || !(model = model?.trim())) throw "Invalid car model"
		if(typeof plate !== "string" || !(plate = plate?.trim())) throw "Invalid license plate"

		/** @type {Parameters<typeof InsertCar>[0]} */
		const info = { model, plate }
		const id = await InsertCar(info)

		/** @type {import("./typings/api.js").CarModel} */
		const data = {
			id,
			...info
		}

		response.status(200).json({ data })
	}catch(error){
		if(typeof error === "string") return response.status(400).json({ error })

		const message = GetErrorMessage(error)

		response.status(500).json({ error: message })
	}
})

export default routes
