// Shape reference for each collection (JS objects, validated in routes).
// Field names mirror what a Mongoose schema would declare, so migrating to
// real MongoDB later is a matter of swapping db/store.js for a Mongo driver.

export const UserShape = {
  _id: "string",
  name: "string",
  email: "string",
  passwordHash: "string",
  campusId: "string|null",
  avatarSeed: "string",
  greenPoints: "number",       // lifetime total points
  greenScore: "number",        // derived score (points + streak weighting)
  level: "number",
  currentStreak: "number",
  longestStreak: "number",
  lastCompletionDate: "string|null", // YYYY-MM-DD
  co2SavedKg: "number",
  isDemo: "boolean",
};

export const CampusShape = {
  _id: "string",
  name: "string",
  city: "string",
  totalPoints: "number",
  memberCount: "number",
};

export const ChallengeShape = {
  _id: "string",
  title: "string",
  description: "string",
  category: "string", // transport | energy | water | waste | biodiversity | community
  points: "number",
  co2SavedKg: "number",
  frequency: "string", // daily | weekly | once
  icon: "string",
};

export const ChallengeCompletionShape = {
  _id: "string",
  userId: "string",
  challengeId: "string",
  completedOn: "string", // YYYY-MM-DD
  pointsAwarded: "number",
  co2SavedKg: "number",
};

export const CarbonActivityShape = {
  _id: "string",
  userId: "string",
  category: "string", // transport | energy | water | waste
  activityType: "string",
  quantity: "number",
  unit: "string",
  co2eKg: "number",
  date: "string", // YYYY-MM-DD
};

export const BadgeShape = {
  _id: "string",
  name: "string",
  description: "string",
  icon: "string",
  condition: "object", // { type: 'points'|'streak'|'challengeCount'|'category', value, category? }
};

export const UserBadgeShape = {
  _id: "string",
  userId: "string",
  badgeId: "string",
  earnedAt: "string",
};

export const EcoTipShape = {
  _id: "string",
  category: "string",
  title: "string",
  body: "string",
};

export const RecyclingItemShape = {
  _id: "string",
  name: "string",
  category: "string", // plastic | paper | e-waste | glass | metal | organic | hazardous
  instructions: "string",
  binColor: "string",
};
