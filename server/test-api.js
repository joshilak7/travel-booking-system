const axios = require("axios");

async function testAPI() {
  try {
    console.log("Testing API connection...");

    // Test cars endpoint
    const carsRes = await axios.get("http://localhost:5000/api/cars");
    console.log("Cars API:", carsRes.data.success ? "✅ Working" : "❌ Failed");
    console.log(`Found ${carsRes.data.cars?.length || 0} cars`);

    // Test places endpoint
    const placesRes = await axios.get("http://localhost:5000/api/places");
    console.log(
      "Places API:",
      placesRes.data.success ? "✅ Working" : "❌ Failed",
    );
    console.log(`Found ${placesRes.data.places?.length || 0} places`);
  } catch (error) {
    console.error("❌ API Test Failed:", error.message);
    console.log("\nPossible solutions:");
    console.log("1. Make sure MongoDB is running");
    console.log('2. Run "npm run seed" to add data');
    console.log("3. Make sure server is running on port 5000");
    console.log("4. Check your .env file has correct MONGODB_URI");
  }
}

testAPI();
