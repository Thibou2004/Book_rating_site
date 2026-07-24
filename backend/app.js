const express = require("express")
const mongoose = require("mongoose")
const app = express();
const bookRoutes = require("./routes/book")
const userRoutes = require("./routes/user")
const path = require("path")
// const cors = require("cors")

// app.use(cors({
//   origin: "http://localhost:3000",
//   credentials: true,
// }))

app.use((req, res, next) => {
  if (req.headers['content-type']?.includes('application/json')) {
    express.json()(req, res, next);
  } else {
    next();
  }
});

require("dotenv").config();
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

app.use(
  "/images",
  express.static(path.join(__dirname, "images"), {
    setHeaders: (res) => {
      res.setHeader("Cache-Control", "no-cache");
    },
  })
);

app.use((error, req, res, next) => {
  console.error('Erreur serveur :', error);
  res.status(500).json({ error: error.message });
});

app.use("/api/auth", userRoutes)
app.use("/api/books", bookRoutes)
module.exports = app;