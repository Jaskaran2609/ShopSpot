const Item = require("../models/itemSchema");

exports.createItem = async (req, res) => {
  try {
    const { title, price, image, description } = req.body;
    const item = new Item({
      title,
      price,
      image,
      description,
    });

    const savedItem = await item.save();

    res.json({
      item: savedItem,
    });
  } catch (error) {
    return res.status(400).json({
      error: "Found error while creating the item",
    });
  }
};

exports.getAllItems = async (req, res) => {
  try {
    const items = await Item.find();

    res.json({
      items,
    });
  } catch (error) {
    return res.status(400).json({
      error: " ERROR WHILE FETCHING ALL THE ITEMS..",
    });
  }
};
