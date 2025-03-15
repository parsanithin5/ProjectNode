const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB using a consistent database name
mongoose.connect("mongodb://127.0.0.1:27017/fooddelivery")
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error("MongoDB Connection Error:", err));

// Define Schemas and Models
const RestaurantSchema = new mongoose.Schema({
  name: String,
  menu: [{ item: String, price: Number }],
});
const Restaurant = mongoose.model("Restaurant", RestaurantSchema);

const OrderSchema = new mongoose.Schema({
  customerName: String,
  restaurantName: String,
  items: [{ item: String, price: Number }],
  totalPrice: Number,
  orderDate: { type: Date, default: Date.now },
});
const Order = mongoose.model("Order", OrderSchema);

// API Endpoints

// Fetch all restaurants
app.get("/restaurants", async (req, res) => {
  try {
    const restaurants = await Restaurant.find();
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch restaurants" });
  }
});

// Add a new restaurant
app.post("/restaurants", async (req, res) => {
  try {
    const { name, menu } = req.body;
    const newRestaurant = new Restaurant({ name, menu });
    await newRestaurant.save();
    res.json({ message: "Restaurant added successfully!", restaurant: newRestaurant });
  } catch (error) {
    res.status(500).json({ error: "Failed to add restaurant" });
  }
});

// Place an order
app.post("/orders", async (req, res) => {
  try {
    const { customerName, restaurantName, items } = req.body;
    const totalPrice = items.reduce((sum, item) => sum + item.price, 0);
    const newOrder = new Order({ customerName, restaurantName, items, totalPrice });
    await newOrder.save();
    res.json({ message: "Order placed successfully!", order: newOrder });
  } catch (error) {
    res.status(500).json({ error: "Failed to place order" });
  }
});

// Fetch all orders
app.get("/orders", async (req, res) => {
  try {
    const orders = await Order.find();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// Insert sample restaurants if none exist
const insertRestaurants = async () => {
  try {
    const count = await Restaurant.countDocuments();
    if (count === 0) {
      await Restaurant.insertMany([
        { name: "Dominos", menu: [{ item: "Cheese Burst", price: 200 }, { item: "Farmhouse", price: 250 }] },
        { name: "Subway", menu: [{ item: "Veggie Delight", price: 150 }, { item: "Chicken Sub", price: 180 }] }
      ]);
      console.log("Restaurants added successfully!");
    } else {
      console.log("Restaurants already exist, skipping insertion.");
    }
  } catch (error) {
    console.error("Error inserting restaurants:", error);
  }
};

insertRestaurants();

const PORT = 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
