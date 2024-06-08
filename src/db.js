const mysql = require('mysql2');

// Buat koneksi ke database
const db = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  socketPath: process.env.INSTANCE_CONNECTION_NAME
});

// Hubungkan ke database
db.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err);
    return;
  }
  console.log("Connected to the MySQL database.");
});

// Membuat instance Promise untuk menggunakan async/await
const dbPromise = db.promise();

module.exports = dbPromise;