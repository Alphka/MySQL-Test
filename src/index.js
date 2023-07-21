import "dotenv/config.js"
import { createServer } from "http"
import isNumber from "./helpers/isNumber.js"
import express from "express"
import routes from "./routes.js"

const app = express()
const server = createServer(app)
const port = isNumber(process.env.PORT) ? Number(process.env.PORT) : 3000

app.disable("x-powered-by")
app.disable("etag")

app.use("/api", routes)

server.listen(port, () => console.log(`Listening: http://localhost:${port}`))
