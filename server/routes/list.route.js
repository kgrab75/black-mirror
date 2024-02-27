const express = require("express");

const {
  getLists,
  addList,
} = require("../controllers/list.controller");
//const auth = require("../middleware/auth");

const router = express.Router();

/* Creating a route for the get request. */
router.get("/lists", getLists);
/* Creating a route for the post request. */
router.post("/list", addList);

module.exports = router;