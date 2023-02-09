const SUCCES = 200
const CREATED = 201
const BAD_REQUEST = 400
const UNAUTHORIZED = 401
const SERVER_ERROR = 500

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
        return res.status(BAD_REQUEST).json({ message: 'Champ(s) manquant(s) pour inscription' });  
    }
    
    bcrypt.hash(password, SALT_ROUND)
      .then(hash => {
        const user = new User({
          email: email,
          password: hash
        });
        user.save()
          .then(() => res.status(CREATED).json({ message: 'Utilisateur créé !' }))
          .catch(error => res.status(BAD_REQUEST).json({ error }));
      })
      .catch(error => res.status(SERVER_ERROR).json({ error }));
};
// verification des donnees de l'utilisateur afin de le connecter 
exports.login = (req, res, next) => {
    User.findOne({ email: req.body.email })
        .then(user => {
            if (!user) {
                return res.status(UNAUTHORIZED).json({ message: 'login ou mot de passe incorrecte 1'});
            }
            // fonction compare de brypt afin de comparer le mdp fournie pas l'uilisateur et le mdp hash
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    if (!valid) {
                        return res.status(UNAUTHORIZED).json({ message: 'login ou mot de passe incorrecte 2' });
                    }
                    res.status(SUCCES).json({
                        userId: user._id,
                        token: jwt.sign(
                            { userId: user._id },
                            process.env.TOKEN_SECRET,
                            {expiresIn: '24h'}
                        )
                    });
                })
                .catch(error => res.status(SERVER_ERROR).json({ error }));
        })
        .catch(error => res.status(SERVER_ERROR).json({ error }));
 };