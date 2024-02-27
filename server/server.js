const express = require("express");

const app = require("./app");

/* Loading the environment variables from the .env file. */
require("dotenv").config();

const PORT = process.env.PORT || 5000;

/* Starting the server. */
app.listen(PORT, console.log("Server stated on port 5000"));