import mysql from "mysql2";
import dotenv from "dotenv";
dotenv.config();

const pool = mysql
  .createPool({
    host: process.env.MYSQL_HOST || "localhost",
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || "",
    database: process.env.MYSQL_DATABASE,
  })
  .promise();

export async function getUsers() {
  const [rows] = await pool.query("SELECT * FROM users");
  return rows;
}

export async function getUser(id) {
  const [rows] = await pool.query(`SELECT * FROM users WHERE id = ?`, [id]);
  return rows[0];
}

export async function createUser(user) {
  const [result] = await pool.query(
    `INSERT INTO users (first_name, last_name,email,country,mobile,password,created_at) VALUES (?,?,?,?,?,?,NOW())`,
    [
      user.first_name,
      user.last_name,
      user.email,
      user.country,
      user.mobile,
      user.password,
    ]
  );
  const id = result.insertId;
  return getUser(id);
}

export async function login(email, password) {
  const [rows] = await pool.query(
    `SELECT * FROM users WHERE email = ? AND password = ?`,
    [email, password]
  );

  //   return rows[0];

  if (rows.length > 0) {
    const token = await updateOrInsertToken(rows[0].id);
    rows[0].token = token.token;
    return rows[0];
  } else {
    return null;
  }
}

// console.log(await login("cc@hotmail.com", "123456"));

async function updateOrInsertToken(id) {
  const [rows] = await pool.query(
    `SELECT * FROM tokens WHERE user_id = ? AND expired_at > NOW() AND is_deleted = 0`,
    [id]
  );

  //random string 60 characters
  const token =
    Math.random().toString(36).substring(2, 62) +
    Math.random().toString(36).substring(2, 62);

  if (rows.length > 0) {
    await pool.query(`UPDATE tokens SET is_deleted = 1 WHERE user_id = ?`, [
      id,
    ]);
  }

  const [result] = await pool.query(
    `INSERT INTO tokens (user_id, token, expired_at,created_at) VALUES (?,?,DATE_ADD(NOW(), INTERVAL 1 HOUR),NOW())`,
    [id, token]
  );
  const token_id = result.insertId;
  const [token_res] = await pool.query(
    `SELECT * FROM tokens WHERE id = ? AND is_deleted = 0`,
    [token_id]
  );

  return token_res[0];
}

// console.log(await updateOrInsertToken(1));

// const result = await createUser({
//   first_name: "John",
//   last_name: "Doe",
//   email: "johndoe@hotmail.com",
//   country: "60",
//   mobile: "08012345678",
//   password: "password",
// });

// const result = await getUsers();
// console.log(result);
