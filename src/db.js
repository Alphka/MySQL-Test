import mysql from "mysql"

const {
	DB_HOST,
	DB_USER,
	DB_NAME,
	DB_PASSWORD
} = process.env

const connection = mysql.createConnection({
	host: DB_HOST,
	user: DB_USER,
	database: DB_NAME,
	password: DB_PASSWORD
})

connection.connect(error => {
	if(error) throw error
	console.log(`Database connected (${DB_NAME})`)
})

export default connection
