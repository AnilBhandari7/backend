require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const Incident = require("./models/Incident");

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/safety_detective");
    console.log("MongoDB connected for seeding");

    // --- Admin user (upsert) ---
    const passwordHash = await bcrypt.hash("Admin1234!", 12);
    await User.findOneAndUpdate(
      { email: "admin@safetydetective.com" },
      { name: "Admin", email: "admin@safetydetective.com", passwordHash, phone: "0000000000", role: "admin" },
      { upsert: true, new: true }
    );
    console.log("Admin user seeded");

    // --- Warehouse Slip Incident (upsert) ---
    await Incident.findOneAndUpdate(
      { title: "Warehouse Slip Incident" },
      {
        title: "Warehouse Slip Incident",
        briefing: "A warehouse employee slipped near the loading dock this morning. No serious injury — but it could have been. Investigate the scene, find out what really happened, and figure out the root cause, not just what's sitting on the surface.",
        clues: [
          { _id: "wet-patch",        label: "Wet patch on the floor",   feedbackText: "This is where the slip happened.",          points: 10 },
          { _id: "cracked-container",label: "Cracked container",        feedbackText: "Looks like the source of the leak.",         points: 10 },
          { _id: "hazard-log",       label: "Hazard log with no entry", feedbackText: "Nobody logged this leak before the slip.",    points: 10 }
        ],
        decoys: [
          { _id: "fire-extinguisher", label: "Fire extinguisher",          feedbackText: "Standard equipment — not connected to this incident." },
          { _id: "overhanging-boxes", label: "Boxes overhanging shelf edge",feedbackText: "A hazard worth flagging separately — but not this one." },
          { _id: "safety-gloves",     label: "Safety gloves on a table",   feedbackText: "PPE, but unrelated to how this happened." },
          { _id: "wet-floor-sign",    label: "Wet floor sign in unrelated aisle", feedbackText: "A wet floor sign — just nowhere near the actual spill." }
        ],
        whyChain: [
          {
            order: 1, points: 5,
            question: "Why did the worker slip?",
            options: [
              { id: "A", text: "There was liquid on the floor" },
              { id: "B", text: "The worker was wearing the wrong shoes" },
              { id: "C", text: "The floor surface was worn and uneven" },
              { id: "D", text: "The worker was rushing and not looking down" }
            ],
            correctOptionId: "A"
          },
          {
            order: 2, points: 5,
            question: "Why was there liquid on the floor?",
            options: [
              { id: "A", text: "A container nearby had leaked" },
              { id: "B", text: "It had rained and the loading door was left open" },
              { id: "C", text: "Another worker spilled a drink" },
              { id: "D", text: "Condensation had built up overnight" }
            ],
            correctOptionId: "A"
          },
          {
            order: 3, points: 10,
            question: "Why wasn't the leak cleaned up before anyone slipped?",
            options: [
              { id: "A", text: "The leak was never reported" },
              { id: "B", text: "Cleaning staff were occupied elsewhere at the time" },
              { id: "C", text: "The leak had only just started minutes earlier" },
              { id: "D", text: "The puddle was too small to notice easily" }
            ],
            correctOptionId: "A"
          },
          {
            order: 4, points: 10,
            question: "Why wasn't the leak reported?",
            options: [
              { id: "A", text: "The worker who noticed it didn't know how to report a hazard" },
              { id: "B", text: "The worker assumed someone else already had" },
              { id: "C", text: "There was no reporting form available nearby" },
              { id: "D", text: "The worker didn't think it was serious enough to report" }
            ],
            correctOptionId: "A"
          },
          {
            order: 5, points: 30,
            question: "Why didn't staff know how to report hazards?",
            options: [
              { id: "A", text: "The safety training program wasn't effectively delivered or reinforced" },
              { id: "B", text: "The worker just hadn't been paying attention during training" },
              { id: "C", text: "There wasn't enough staff on shift to keep up with reporting" },
              { id: "D", text: "The hazard reporting policy existed but was outdated" }
            ],
            correctOptionId: "A"
          }
        ]
      },
      { upsert: true, new: true }
    );
    console.log("Incident seeded (5-Why chain)");

    console.log("Seeding complete!");
    process.exit(0);
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
};

seedData();
