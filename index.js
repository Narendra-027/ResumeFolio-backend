const express = require("express");
const app = express();
const cors = require("cors");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");

dotenv.config();

// Connect to MongoDB
async function connectDB() {
  try {
    console.log("🔄 Attempting MongoDB connection...");
    console.log("mongoUri'", process.env.MONGO_CONNECTION);
    if (!process.env.MONGO_CONNECTION) {
      throw new Error("❌ MONGO_CONNECTION is undefined! Check your environment variables.");
    }

    await mongoose.connect(process.env.MONGO_CONNECTION, { 
      useNewUrlParser: true, 
      useUnifiedTopology: true 
    });

    console.log("✅ MongoDB Connected!");
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err);
    process.exit(1); // Stop server if MongoDB fails
  }
}

connectDB();


connectDB();



app.get("/", (req, res) => {
  res.json({ message: "Backend is running!" });
});
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

// Middleware for handling API errors
app.use((err, req, res, next) => {
  console.error("🚨 Error:", err.stack);
  res.status(500).json({ success: false, message: "Internal Server Error" });
});


// CORS Middleware
app.use(
  cors({
    origin: ["https://resume-folio-frontend.vercel.app/login", "http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.options("*", cors());

// API Routes
app.use("/api/users", require("./routes/users"));
app.use("/api/resume", require("./routes/resume"));

// Production Mode Logging
if (process.env.NODE_ENV === "production") {
  console.log("Running in production mode. No static frontend is served.");
}

// Start Server
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server Running at ${port}`);
});
