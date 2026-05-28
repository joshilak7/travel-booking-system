const mongoose = require("mongoose");
const dotenv = require("dotenv");

const Car = require("../models/Car");
const Place = require("../models/Place");

const carsData = require("../data/cars");
const placesData = require("../data/places");

// Load env variables
dotenv.config();

// Connect MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => {
    console.log("❌ MongoDB Error:", err);
    process.exit(1);
  });

const seedDatabase = async () => {
  try {
    // Delete old data
    await Car.deleteMany();
    await Place.deleteMany();

    console.log("🗑 Existing data cleared");

    // Insert new data
    const cars = await Car.insertMany(carsData);
    const places = await Place.insertMany(placesData);

    console.log(`✅ Added ${cars.length} cars`);
    console.log(`✅ Added ${places.length} places`);

    console.log("🎉 Database Seeded Successfully");

    process.exit();
  } catch (error) {
    console.log("❌ Seeding Error:", error);
    process.exit(1);
  }
};

seedDatabase();
