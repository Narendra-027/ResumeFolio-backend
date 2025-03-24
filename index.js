const express = require("express");
const app = express();
const cors = require("cors");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");

dotenv.config();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_CONNECTION, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected..."))
  .catch((err) => console.log(err));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

// CORS Middleware
app.use(
  cors({
    origin: ["https://vercel.com/narendra-janis-projects/resume-builder", "http://localhost:3000"],
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
