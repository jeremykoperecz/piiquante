//configuration d'express// 
const express = require('express');
//utilisation de dotenv

//  mongoose
const mongoose = require('mongoose');
const app = express();
const sauceRoutes = require('./routes/sauce');
const userRoutes = require('./routes/user');
const path = require('path');


mongoose
  .connect(
    process.env.MONGOOSE_SECRET_KEY,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  )
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch(() => console.log("Connexion à MongoDB échouée !"));

app.use(express.json());


//middleware (ne pas oublier "next pour passser au middleware suivant)//

//middleware pour resoudre les erreurs CORS(permettre de communiquer entre le serveur 3000 et 4200)
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

app.use('/api/auth', userRoutes);
app.use('/api/sauces', sauceRoutes);
app.use('/images', express.static(path.join(__dirname, 'images')));


module.exports = app;