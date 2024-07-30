const User = require("../models/userSchema");
const Item = require("../models/itemSchema");

exports.purchaseItem = async (req, res) => {
  try {
    const { cart, email } = req.body;
    console.log("i am in the backend and the cart i am getting is ---> ", cart);
    console.log("the email i am getting from the frontend is ", email);

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Get the user's current purchased items
    const currentPurchasedItems = user.itemsPurchased.map((item) =>
      item.toString()
    );

    // Filter out items that are already purchased
    const itemsToPurchase = cart.filter(
      (itemId) => !currentPurchasedItems.includes(itemId.toString())
    );

    if (itemsToPurchase.length === 0) {
      return res.status(400).json({
        success: false,
        message: "All items in the cart are already purchased",
      });
    }

    // Update the Item model and User model separately
    const updatePromises = itemsToPurchase.map(async (itemId) => {
      // Update the Item model to add the user to the purchasedby array
      await Item.findByIdAndUpdate(
        itemId,
        { $addToSet: { purchasedby: user._id } }, // Use $addToSet to avoid duplicates
        { new: true }
      );

      // Update the User model to add the item to itemsPurchased array
      await User.findByIdAndUpdate(
        user._id,
        { $addToSet: { itemsPurchased: itemId } }, // Use $addToSet to avoid duplicates
        { new: true }
      );
    });

    // Wait for all updates to complete
    await Promise.all(updatePromises);

    // Fetch the updated user details
    const updatedUser = await User.findById(user._id).populate(
      "itemsPurchased"
    );

    res.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error while purchasing the item", error);
    return res.status(400).json({
      success: false,
      error: "Error while purchasing the item",
    });
  }
};
