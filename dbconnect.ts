import mysql from "mysql";
import util from "util";

export const conn = mysql.createPool({
  connectionLimit: 10,
  host: "nv1.metrabyte.cloud",
  user: "aemandko_Node-W5",
  password: "12345",
  database: "aemandko_Node-W5",
});

export const queryAsync = util.promisify(conn.query).bind(conn);