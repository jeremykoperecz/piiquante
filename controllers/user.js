const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const dotenv = require("dotenv");
dotenv.config();
 

//utilisation de la fonction hash afin de crypter le mdp utilisateur. 
exports.signup = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const SALT_ROUND = process.env.SALT_ROUND
    if (!email || !password ) {
        return res.status(400).json({ message: 'Champ(s) manquant(s) pour inscription' });  
    }
    
    bcrypt.hash(password, SALT_ROUND)
      .then(hash => {
        const user = new User({
          email: email,
          password: hash
        });
        user.save()
          .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
          .catch(error => res.status(400).json({ error }));
      })
      .catch(error => res.status(500).json({ error }));
};
// verification des donnees de l'utilisateur afin de le connecter 
exports.login = (req, res, next) => {
    User.findOne({ email: req.body.email })
        .then(user => {
            if (!user) {
                return res.status(401).json({ message: 'login ou mot de passe incorrecte 1'});
            }
            // fonction compare de brypt afin de comparer le mdp fournie pas l'uilisateur et le mdp hash
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    if (!valid) {
                        return res.status(401).json({ message: 'login ou mot de passe incorrecte 2' });
                    }
                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign(
                            { userId: user._id },
                            process.env.TOKEN_SECRET,
                            {expiresIn: '24h'}
                        )
                    });
                })
                .catch(error => res.status(500).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
 };