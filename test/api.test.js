import { after, before, beforeEach, describe, it, mock } from "node:test"
import assert from "node:assert/strict"
import { createServer } from "node:http"
import express from "express"

/** In-memory stand-in for the mysql connection (no database required). */
const state = {
	/** @type {Error | null} */
	failWith: null,
	rows: [{ id: 1, model: "Fusca", plate: "AAA1111" }]
}

const stubConnection = {
	/** @type {(sql: string, params: any, callback?: Function) => void} */
	query(sql, params, callback){
		if(typeof params === "function"){
			callback = params
			params = []
		}

		if(state.failWith) return callback(state.failWith)
		if(sql.startsWith("SELECT * FROM cars WHERE")) return callback(null, state.rows.filter(row => row.id === params[0]))
		if(sql.startsWith("SELECT")) return callback(null, state.rows)
		if(sql.startsWith("INSERT")) return callback(null, { insertId: 2 })
		if(sql.startsWith("UPDATE")) return callback(null, { affectedRows: state.rows.some(row => row.id === params[2]) ? 1 : 0 })

		callback(new Error(`Unexpected query: ${sql}`))
	}
}

mock.module("../src/db.js", { defaultExport: stubConnection })

const { default: routes } = await import("../src/routes.js")

describe("cars API", () => {
	/** @type {import("node:http").Server} */
	let server
	let baseUrl = ""

	/**
	 * @param {string} method
	 * @param {string} path
	 */
	async function request(method, path){
		const response = await fetch(baseUrl + path, { method })
		return { status: response.status, body: await response.json() }
	}

	before(async () => {
		const app = express()

		app.use("/api", routes)
		server = createServer(app)

		await new Promise(resolve => server.listen(0, "127.0.0.1", () => resolve(undefined)))

		// @ts-ignore
		baseUrl = `http://127.0.0.1:${server.address().port}`
	})

	after(() => new Promise(resolve => server.close(resolve)))

	beforeEach(() => {
		state.failWith = null
		mock.method(console, "error", () => {})
	})

	it("lists cars", async () => {
		const { status, body } = await request("GET", "/api/cars")

		assert.equal(status, 200)
		assert.deepEqual(body, { data: state.rows })
	})

	it("gets a car by id", async () => {
		const { status, body } = await request("GET", "/api/car/1")

		assert.equal(status, 200)
		assert.deepEqual(body, { result: state.rows[0] })
	})

	it("returns 404 for an unknown car", async () => {
		const { status, body } = await request("GET", "/api/car/99")

		assert.equal(status, 404)
		assert.deepEqual(body, { error: "Car not found" })
	})

	for(const id of ["abc", "1.5", "-1", "0", "1e3", "01"]){
		it(`rejects invalid id "${id}"`, async () => {
			const { status, body } = await request("GET", `/api/car/${id}`)

			assert.equal(status, 400)
			assert.deepEqual(body, { error: "Invalid id" })
		})
	}

	it("creates a car", async () => {
		const { status, body } = await request("POST", "/api/car?model=Gol&plate=BBB2222")

		assert.equal(status, 200)
		assert.deepEqual(body, { data: { id: 2, model: "Gol", plate: "BBB2222" } })
	})

	it("rejects creating a car without model or plate", async () => {
		const noModel = await request("POST", "/api/car?plate=BBB2222")
		const noPlate = await request("POST", "/api/car?model=Gol")

		assert.equal(noModel.status, 400)
		assert.deepEqual(noModel.body, { error: "Invalid car model" })
		assert.equal(noPlate.status, 400)
		assert.deepEqual(noPlate.body, { error: "Invalid license plate" })
	})

	it("edits an existing car", async () => {
		const { status, body } = await request("PUT", "/api/car/1?model=Gol&plate=BBB2222")

		assert.equal(status, 200)
		assert.deepEqual(body, { success: true })
	})

	it("returns 404 when editing an unknown car", async () => {
		const { status, body } = await request("PUT", "/api/car/99?model=Gol&plate=BBB2222")

		assert.equal(status, 404)
		assert.deepEqual(body, { error: "Car not found" })
	})

	it("does not leak database errors in 500 responses", async () => {
		state.failWith = new Error("ER_ACCESS_DENIED secret detail")

		for(const [method, path] of [["GET", "/api/cars"], ["GET", "/api/car/1"], ["POST", "/api/car?model=a&plate=b"], ["PUT", "/api/car/1?model=a&plate=b"]]){
			const { status, body } = await request(method, path)

			assert.equal(status, 500, `${method} ${path}`)
			assert.deepEqual(body, { error: "Internal server error" })
		}
	})
})
