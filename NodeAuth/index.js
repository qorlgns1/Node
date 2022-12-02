const express = require("express");
const app = express();
const port = 3000;

const { Client } = require("pg");
const Query = require("pg").Query;

const dotenvConfig = require("dotenv").config().parsed;

const client = new Client({
  user: dotenvConfig.user,
  host: dotenvConfig.host,
  database: dotenvConfig.database,
  password: dotenvConfig.password,
  port: dotenvConfig.port,
});

client.connect((err) => {
  if (err) {
    console.error("connection error", err.stack);
  } else {
    console.log("success!");
  }
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
