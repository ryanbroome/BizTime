// TODO change DB URI to correct for BIZTIME ln 7
/** Database setup for BizTime. */
const { Client } = require("pg");

let DB_URI;
if (process.env.NODE_ENV === "test") {
  DB_URI = "postgresql:///usersdb_test";
} else {
  DB_URI = "postgresql:///usersdb";
}

let db = new Client({
  connectionString: DB_URI,
});

db.connect();

module.exports = db;
