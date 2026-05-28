const express = require("express");
const router = express.Router();
const Place = require("../models/Place");
const { protect, admin } = require("../middleware/auth");

// @route   GET /api/places
// @desc    Get all places
// @access  Public
router.get("/", async (req, res) => {
  try {
    const { category, city, state, country, minRating } = req.query;
    let query = {};

    if (category) query.category = category;
    if (city) query.city = new RegExp(city, "i");
    if (state) query.state = new RegExp(state, "i");
    if (country) query.country = new RegExp(country, "i");
    if (minRating) query.rating = { $gte: parseInt(minRating) };

    const places = await Place.find(query).sort({ rating: -1, createdAt: -1 });
    res.json({ success: true, count: places.length, places });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// @route   GET /api/places/:id
// @desc    Get single place
// @access  Public
router.get("/:id", async (req, res) => {
  try {
    const place = await Place.findById(req.params.id);
    if (!place) {
      return res
        .status(404)
        .json({ success: false, message: "Place not found" });
    }
    res.json({ success: true, place });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// @route   POST /api/places
// @desc    Create a place
// @access  Private/Admin
router.post("/", protect, admin, async (req, res) => {
  try {
    const place = await Place.create(req.body);
    res.status(201).json({ success: true, place });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// @route   PUT /api/places/:id
// @desc    Update a place
// @access  Private/Admin
router.put("/:id", protect, admin, async (req, res) => {
  try {
    let place = await Place.findById(req.params.id);
    if (!place) {
      return res
        .status(404)
        .json({ success: false, message: "Place not found" });
    }
    place = await Place.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.json({ success: true, place });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// @route   DELETE /api/places/:id
// @desc    Delete a place
// @access  Private/Admin
router.delete("/:id", protect, admin, async (req, res) => {
  try {
    const place = await Place.findById(req.params.id);
    if (!place) {
      return res
        .status(404)
        .json({ success: false, message: "Place not found" });
    }
    await place.deleteOne();
    res.json({ success: true, message: "Place deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// @route   POST /api/places/:id/reviews
// @desc    Add review to place
// @access  Private
router.post("/:id/reviews", protect, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const place = await Place.findById(req.params.id);
    if (!place) {
      return res
        .status(404)
        .json({ success: false, message: "Place not found" });
    }

    const alreadyReviewed = place.reviews.find(
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

    place.reviews.push(review);
    place.rating =
      place.reviews.reduce((acc, item) => item.rating + acc, 0) /
      place.reviews.length;
    await place.save();

    res.status(201).json({ success: true, place });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
