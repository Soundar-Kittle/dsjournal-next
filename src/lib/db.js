// lib/db.js
import mysql from "mysql2/promise";

export async function createDbConnection() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "dream_science",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  return connection;
}
