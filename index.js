const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

// Mongo
const mongo = require("./mongo");

// Routes
const authRoutes = require("./routes/auth.routes");
const plansRoutes = require("./routes/plans.routes");

//services
const authService = require("./services/auth.services");

const app = express();
const PORT = (process.env.PORT) ? (process.env.PORT) : 3001;

(async function load() {
  try {
    await mongo.connect();

    app.use(express.json());    //body params -> json

    app.use(cors());    // allow Cross-Origin Resource sharing

    app.use("/auth", authRoutes);

    //allow only registered users to access following routes
    app.use(authService.validateAccessToken);

    app.get("/check", (req, res) => {
      res.send("Server is running");
    });
    
    app.use("/plans", plansRoutes);

    app.listen(PORT, () =>
      console.log(`Server running at port ${PORT}`)
    );
  } catch (err) {
    console.log(err);
  }
})(); //imediately invoked function

