const express = require("express");
const router = express.Router();
const Car = require("../models/Car");
const { protect, admin } = require("../middleware/auth");

// @route   GET /api/cars
// @desc    Get all cars
// @access  Public
router.get("/", async (req, res) => {
  try {
    const { brand, minPrice, maxPrice, seats, transmission, location } =
      req.query;
    let query = {};

    if (brand) query.brand = brand;
    if (seats) query.seats = parseInt(seats);
    if (transmission) query.transmission = transmission;
    if (location) query.location = new RegExp(location, "i");
    if (minPrice || maxPrice) {
      query.pricePerDay = {};
      if (minPrice) query.pricePerDay.$gte = parseInt(minPrice);
      if (maxPrice) query.pricePerDay.$lte = parseInt(maxPrice);
    }

    const cars = await Car.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: cars.length, cars });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// @route   GET /api/cars/:id
// @desc    Get single car
// @access  Public
router.get("/:id", async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) {
      return res.status(404).json({ success: false, message: "Car not found" });
    }
    res.json({ success: true, car });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// @route   POST /api/cars
// @desc    Create a car
// @access  Private/Admin
router.post("/", protect, admin, async (req, res) => {
  try {
    const car = await Car.create(req.body);
    res.status(201).json({ success: true, car });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// @route   PUT /api/cars/:id
// @desc    Update a car
// @access  Private/Admin
router.put("/:id", protect, admin, async (req, res) => {
  try {
    let car = await Car.findById(req.params.id);
    if (!car) {
      return res.status(404).json({ success: false, message: "Car not found" });
    }
    car = await Car.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.json({ success: true, car });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// @route   DELETE /api/cars/:id
// @desc    Delete a car
// @access  Private/Admin
router.delete("/:id", protect, admin, async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) {
      return res.status(404).json({ success: false, message: "Car not found" });
    }
    await car.deleteOne();
    res.json({ success: true, message: "Car deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// @route   POST /api/cars/:id/reviews
// @desc    Add review to car
// @access  Private
router.post("/:id/reviews", protect, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const car = await Car.findById(req.params.id);
    if (!car) {
      return res.status(404).json({ success: false, message: "Car not found" });
    }

    const alreadyReviewed = car.reviews.find(
      (review) => review.user.toString() === req.user.id,
    );

    if (alreadyReviewed) {
      return res
        .status(400)
        .json({ success: false, message: "Already reviewed" });
    }

    const review = {
      user: req.user.id,
      rating: Number(rating),
      comment,
    };

    car.reviews.push(review);
    car.rating =
      car.reviews.reduce((acc, item) => item.rating + acc, 0) /
      car.reviews.length;
    await car.save();

    res.status(201).json({ success: true, car });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
