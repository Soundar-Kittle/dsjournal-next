import mysql from "mysql2/promise";

function safeJSON(val) {
  if (val === null) return null;
  if (typeof val === "object") return val;
  if (typeof val === "string") {
    try {
      return JSON.parse(val);
    } catch {
      return val;
    }
  }
  return val;
}

export async function createDbConnection() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,

    typeCast(field, next) {
      // MariaDB JSON comes as TEXT/BLOB
      if (
        field.type === "JSON" ||
        field.type === "BLOB" ||
        field.type === "VAR_STRING" ||
        field.type === "STRING"
      ) {
        const val = field.string();
        return safeJSON(val);
      }
      return next();
    },
  });

  return connection;
}
