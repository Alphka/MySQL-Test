# MySQL-Test

<p align="center">
	<a href="LICENSE.md">
		<img alt="License" src="https://img.shields.io/badge/License-ISC-5271FF?style=for-the-badge">
	</a>
	<img alt="Node.js" src="https://img.shields.io/badge/Node.js-%3E%3D22-5FA04E?style=for-the-badge&logo=node.js&logoColor=white">
	<img alt="Express" src="https://img.shields.io/badge/Express-4-000000?style=for-the-badge&logo=express&logoColor=white">
	<img alt="MySQL" src="https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white">
</p>

Small REST API test built with Node.js, Express and MySQL. It exposes basic CRUD-style endpoints for a `cars` table.

> [!NOTE]
> This is a learning/test project, not production software. It has no authentication, its tests do not run the SQL against a real database, and the create/update endpoints receive data through the query string.

## Features

- List all cars, get a car by id, create a car and edit a car.
- Parameterized SQL queries (values are never concatenated into SQL).
- Input validation for the car id (positive integer), model and license plate.
- Server-side logging of errors; clients only receive a generic message on `500` responses.
- Configuration through environment variables (`.env`).

## Tech stack

- Node.js (ES modules)
- [Express](https://expressjs.com/) 4
- [mysql](https://github.com/mysqljs/mysql) 2
- [dotenv](https://github.com/motdotla/dotenv)
- [nodemon](https://nodemon.io/) (development)

## Requirements

- Node.js `>=22.18.0`. `npm test` also needs the `--experimental-test-module-mocks` flag, which Node.js 22.2.0 does not accept.
- npm
- A running MySQL server with a database containing a `cars` table that has the columns `id` (auto-increment primary key), `model` and `plate`

## Installation

```bash
npm install
cp .env.example .env
```

Edit `.env` with your database settings:

| Variable      | Description                                  | Example default |
| ------------- | -------------------------------------------- | --------------- |
| `PORT`        | HTTP port (falls back to `3000` if not set)  | `3000`          |
| `DB_HOST`     | MySQL host                                   | `localhost`     |
| `DB_USER`     | MySQL user                                   | `root`          |
| `DB_PASSWORD` | MySQL password                               | (empty)         |
| `DB_NAME`     | Database name                                |                 |

Never commit your `.env` file (it is listed in `.gitignore`).

## Usage

```bash
npm start
```

This runs `nodemon`, which starts `node .` (entry point `src/index.js`) and restarts on changes in `src/`. The server fails to start if it cannot connect to the database.

## API

All routes are prefixed with `/api`.

| Method | Route                              | Description                         |
| ------ | ---------------------------------- | ----------------------------------- |
| `GET`  | `/api/cars`                        | List all cars (`{ data: [...] }`)   |
| `GET`  | `/api/car/:id`                     | Get a car (`{ result: {...} }`)     |
| `POST` | `/api/car?model=...&plate=...`     | Create a car, returns the new car   |
| `PUT`  | `/api/car/:id?model=...&plate=...` | Edit a car (`{ success: true }`)    |

Errors are returned as `{ "error": "..." }` with status `400` (invalid input), `404` (car not found) or `500` (internal error). Responses send `Access-Control-Allow-Origin: *`.

Example:

```bash
curl -X POST "http://localhost:3000/api/car?model=Fusca&plate=ABC1D23"
curl http://localhost:3000/api/cars
```

## Project structure

```text
src/
  index.js          Express/HTTP server bootstrap
  routes.js         Route definitions and validation
  db.js             MySQL connection (from environment variables)
  controllers/      Database access (GetCars, GetCar, InsertCar, EditCar)
  helpers/          Small utilities
  typings/          TypeScript typings (checked via jsconfig.json)
```

## Testing

The test suite uses the built-in `node:test` runner and needs no database: the `src/db.js` connection is replaced by an in-memory stub.

```bash
npm test
```

The tests cover the HTTP routes (status codes, validation, and that database errors are not exposed in `500` responses). They do not exercise the SQL statements against a real MySQL server.

## License

[ISC](LICENSE.md) © 2023 Kayo Souza
