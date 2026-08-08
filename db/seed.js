import { db } from "./store.js";

function seedIfEmpty(collection, items, label) {
  if (collection.count() > 0) {
    console.log(`[seed] ${label}: already has ${collection.count()} records, skipping.`);
    return;
  }
  items.forEach((item) => collection.insertOne(item));
  console.log(`[seed] ${label}: inserted ${items.length} records.`);
}

seedIfEmpty(
  db.campuses,
  [
    { name: "Green Valley University", city: "Bengaluru", totalPoints: 0, memberCount: 0 },
    { name: "Riverside Institute of Technology", city: "Pune", totalPoints: 0, memberCount: 0 },
    { name: "Sunrise College of Engineering", city: "Hyderabad", totalPoints: 0, memberCount: 0 },
    { name: "Maple Leaf State University", city: "Delhi", totalPoints: 0, memberCount: 0 },
  ],
  "campuses"
);

seedIfEmpty(
  db.challenges,
  [
    { title: "Carry a reusable bottle", description: "Skip single-use plastic bottles today.", category: "waste", points: 10, co2SavedKg: 0.08, frequency: "daily", icon: "bottle" },
    { title: "Walk or cycle to class", description: "Choose a zero-emission commute today.", category: "transport", points: 20, co2SavedKg: 1.2, frequency: "daily", icon: "bike" },
    { title: "Unplug idle chargers", description: "Turn off and unplug devices that aren't in use.", category: "energy", points: 10, co2SavedKg: 0.15, frequency: "daily", icon: "plug" },
    { title: "Take a 5-minute shorter shower", description: "Save water with a quicker shower.", category: "water", points: 10, co2SavedKg: 0.05, frequency: "daily", icon: "droplet" },
    { title: "Eat a plant-based meal", description: "Swap one meal for a plant-based option.", category: "waste", points: 15, co2SavedKg: 1.5, frequency: "daily", icon: "leaf" },
    { title: "Sort your recyclables", description: "Properly separate recyclables this week.", category: "waste", points: 25, co2SavedKg: 0.6, frequency: "weekly", icon: "recycle" },
    { title: "Join a campus clean-up drive", description: "Participate in a community clean-up event.", category: "community", points: 50, co2SavedKg: 0, frequency: "weekly", icon: "users" },
    { title: "Switch to LED bulbs in your room", description: "Replace one incandescent/CFL bulb with an LED.", category: "energy", points: 30, co2SavedKg: 4.5, frequency: "once", icon: "lightbulb" },
    { title: "Plant a sapling", description: "Plant a tree or sapling on campus grounds.", category: "biodiversity", points: 40, co2SavedKg: 6, frequency: "once", icon: "sprout" },
    { title: "Carpool to campus", description: "Share a ride instead of driving alone.", category: "transport", points: 15, co2SavedKg: 0.9, frequency: "daily", icon: "car" },
  ],
  "challenges"
);

seedIfEmpty(
  db.badges,
  [
    { name: "First Step", description: "Complete your first challenge.", icon: "footprints", condition: { type: "challengeCount", value: 1 } },
    { name: "Habit Builder", description: "Complete 10 challenges.", icon: "target", condition: { type: "challengeCount", value: 10 } },
    { name: "Eco Champion", description: "Complete 50 challenges.", icon: "trophy", condition: { type: "challengeCount", value: 50 } },
    { name: "3-Day Streak", description: "Maintain a 3-day streak.", icon: "flame", condition: { type: "streak", value: 3 } },
    { name: "7-Day Streak", description: "Maintain a 7-day streak.", icon: "flame", condition: { type: "streak", value: 7 } },
    { name: "30-Day Streak", description: "Maintain a 30-day streak.", icon: "flame", condition: { type: "streak", value: 30 } },
    { name: "Point Collector", description: "Earn 100 Green Points.", icon: "coins", condition: { type: "points", value: 100 } },
    { name: "Green Influencer", description: "Earn 500 Green Points.", icon: "star", condition: { type: "points", value: 500 } },
    { name: "Waste Warrior", description: "Complete 5 waste-category challenges.", icon: "recycle", condition: { type: "category", value: 5, category: "waste" } },
    { name: "Transport Trailblazer", description: "Complete 5 transport-category challenges.", icon: "bike", condition: { type: "category", value: 5, category: "transport" } },
  ],
  "badges"
);

seedIfEmpty(
  db.ecoTips,
  [
    { category: "energy", title: "Unplug, don't just switch off", body: "Devices on standby still draw power. Unplug chargers and electronics when not in use." },
    { category: "water", title: "Fix that drip", body: "A single leaking tap can waste over 10,000 litres of water a year." },
    { category: "waste", title: "Compost your food scraps", body: "Composting keeps organic waste out of landfills and cuts methane emissions." },
    { category: "transport", title: "Batch your errands", body: "Combine multiple trips into one to cut down on fuel use and emissions." },
    { category: "energy", title: "Let natural light in", body: "Open curtains during the day instead of relying on artificial lighting." },
    { category: "waste", title: "Say no to single-use plastic", body: "Carry a reusable bag, bottle, and cutlery set to avoid disposable plastic." },
    { category: "water", title: "Collect rainwater", body: "Use a rain barrel to water plants instead of using treated tap water." },
    { category: "biodiversity", title: "Plant native species", body: "Native plants need less water and support local pollinators better than exotic ones." },
  ],
  "ecoTips"
);

seedIfEmpty(
  db.recyclingItems,
  [
    { name: "Plastic water bottle", category: "plastic", instructions: "Empty, rinse, and crush before placing in the blue recycling bin.", binColor: "Blue" },
    { name: "Newspaper", category: "paper", instructions: "Keep dry and bundle with other paper waste in the green bin.", binColor: "Green" },
    { name: "Old smartphone", category: "e-waste", instructions: "Drop off at a certified e-waste collection point; never bin electronics.", binColor: "E-waste kiosk" },
    { name: "Glass jar", category: "glass", instructions: "Rinse and remove lid, place in the glass recycling bin.", binColor: "White" },
    { name: "Aluminium can", category: "metal", instructions: "Rinse and crush, place in the metal recycling bin.", binColor: "Yellow" },
    { name: "Vegetable peels", category: "organic", instructions: "Add to the compost bin or campus composting unit.", binColor: "Brown" },
    { name: "Used batteries", category: "hazardous", instructions: "Never bin regular waste; drop off at the hazardous waste collection point.", binColor: "Hazardous kiosk" },
    { name: "Cardboard box", category: "paper", instructions: "Flatten and keep dry before placing in the green bin.", binColor: "Green" },
    { name: "Plastic bag", category: "plastic", instructions: "Most curbside programs reject these — reuse or return to store drop-off points.", binColor: "Store drop-off" },
    { name: "Paint can (empty, dried)", category: "hazardous", instructions: "Dried paint cans go to hazardous waste collection, not regular recycling.", binColor: "Hazardous kiosk" },
  ],
  "recyclingItems"
);

console.log("[seed] Done.");
