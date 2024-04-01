import express from "express";
import { getUsers, getUser, createUser, login } from "./database.js";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());
app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
});

app.get("/users", async (req, res) => {
  const users = await getUsers();
  res.send(users);
});
app.get("/user/:id", async (req, res) => {
  const id = req.params.id;
  const user = await getUser(id);
  res.send(user);
});

app.post("/user", async (req, res) => {
  console.log(req.body);
  const user = req.body;
  const newUser = await createUser(user);
  res.status(201).send(newUser);
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await login(email, password);
  res.status(201).send(user);
});

app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500).send(err);
});

app.listen(8080, () => {
  console.log("Server is running on port 8080");
});
