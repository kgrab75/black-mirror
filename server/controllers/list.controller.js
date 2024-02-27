const List = require("../models/list.model");
const jwt = require("jsonwebtoken");

/**
 * It's an async function that uses the List model to find all lists and then returns a status
 * of 200 with the lists in the response body.
 * @param req - The request object.
 * @param res - the response object
 */
const getLists = async (req, res) => {
  try {
    const lists = await List.find({ email: req.userData.email });
    res.status(200).json(lists);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * It creates a new list and saves it to the database.
 * @param req - The request object.
 * @param res - the response object
 */
const addList = async (req, res) => {
  console.log(req.userData);
  const list = new List({ ...req.body, email: req.userData.email });

  try {
    const newList = await list.save();
    res.status(201).json(newList);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = {
  getLists,
  addList,
};