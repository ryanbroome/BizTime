/** Database setup for BizTime. */
/**resource for db */
const { Client } = require("pg");

/**set the DB URI to test db or regular db */
let DB_URI;
if (process.env.NODE_ENV === "test") {
  DB_URI = "postgresql:///biztime_test";
} else {
  DB_URI = "postgresql:///biztime";
}

/**setup db*/
let db = new Client({
  connectionString: DB_URI,
});

/**connect to db */
db.connect();

module.exports = db;
