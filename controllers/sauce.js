const Sauce = require('../models/sauce');
const fs = require('fs');

const SUCCES = 200
const CREATED = 201
const BAD_REQUEST = 400
const UNAUTHORIZED = 401
const NOT_FOUND = 404
const SERVER_ERROR = 500

// permet a l'utilisateur de cree une sauce
exports.createSauce = /*async */(req, res, next) => {
  try {
    const addSauce = JSON.parse(req.body.sauce);
    delete addSauce._id;
    delete addSauce._userId;
    const sauce = new Sauce({
      ...addSauce,
      userId: req.auth.userId,
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
      likes: 0,
      dislikes: 0,
      usersLiked: [''],
      usersDisliked: ['']

    });
    const sauceSaved = /*await */sauce.save()
    return res.status(CREATED).json({ message: 'Sauce enregistrée !', sauceSaved})  
  } catch (error) {
    console.error(error);
    // delete image if any error occurs
    fs.unlink(`images/${req.file.filename}`, () => {  
      res
        .status(BAD_REQUEST)
        .json({ message: "sauce non enregistrée !", error });
    }
 )}
}
//permet a l'utilisateur de trouver une sauce
exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({
    _id: req.params.id
  }).then(
    (sauce) => {
      res.status(SUCCES).json(sauce);
    }
  ).catch(
    (error) => {
      res.status(NOT_FOUND).json({
        error: error
      });
    }
  );
};
//permet a l'utilsateur de modifier sa sauce
exports.modifySauce = (req, res, next) => {
    const deleteSauce = req.file ? {
        ...JSON.parse(req.body.thing),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };
  
    delete deleteSauce._userId;
    Sauce.findOne({_id: req.params.id})
        .then((sauce) => {
            if (sauce.userId != req.auth.userId) {
                res.status(UNAUTHORIZED).json({ message : 'Not authorized'});
            } else {
                Sauce.updateOne({ _id: req.params.id}, { ...deleteSauce, _id: req.params.id})
                .then(() => res.status(SUCCES).json({message : 'Sauce modifiée !'}))
                .catch(error => res.status(UNAUTHORIZED).json({ error }));
            }
        })
        .catch((error) => {
            res.status(BAD_REQUEST).json({ error });
        });
 };
//permet a l'utilisateur de supprimer sa sauce
exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id})
        .then(thing => {
            if (thing.userId != req.auth.userId) {
                res.status(UNAUTHORIZED).json({message: 'Not authorized'});
            } else {
                const filename = thing.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    Sauce.deleteOne({_id: req.params.id})
                        .then(() => { res.status(SUCCES).json({message: 'Sauce supprimée !'})})
                        .catch(error => res.status(UNAUTHORIZED).json({ error }));
                });
            }
        })
        .catch( error => {
            res.status(SERVER_ERROR).json({ error });
        });
 };
//permet a l'utilisateur de trouver toutes les sauces
exports.getAllSauces = (req, res, next) => {
  Sauce.find().then(
    (sauces) => {
      res.status(SUCCES).json(sauces);
    }
  ).catch(
    (error) => {
      res.status(BAD_REQUEST).json({
        error: error
      });
    }
  );
};
//permet a l'utilisateur de like ou dislike une sauce
exports.likeSauce = (req, res, then) => {
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
      switch (req.body.like) {
        //l'utilisateur n'aime pas la sauce
        case -1:
          sauce.dislikes++;
          sauce.usersDisliked.push(req.body.userId);
          if (sauce.usersLiked.includes(req.body.userId)) {
            sauce.likes--;
            let index = sauce.usersLiked.indexOf(req.body.userId);
            sauce.usersLiked.splice(index, 1);
          }
          break;
        case 0:
          // annulation du vote
          if (sauce.usersLiked.includes(req.body.userId)) {
            sauce.likes--;
            let index = sauce.usersLiked.indexOf(req.body.userId);
            sauce.usersLiked.splice(index, 1);
          } else if (sauce.usersDisliked.includes(req.body.userId)) {
            sauce.dislikes--;
            let index = sauce.usersDisliked.indexOf(req.body.userId);
            sauce.usersDisliked.splice(index, 1);
          }
          break;
        case 1:
         // l'utilisateur aime la sauce
          sauce.likes++;
          sauce.usersLiked.push(req.body.userId);
          if (sauce.usersDisliked.includes(req.body.userId)) {
            sauce.dislikes--;
            let index = sauce.usersDisliked.indexOf(req.body.userId);
            sauce.usersDisliked.splice(index, 1);
          }
          break;
      }
      // met à jour la BDD avec les valeurs modifiés précédemment 
      Sauce.updateOne({ _id: req.params.id }, {
        likes: sauce.likes,
        dislikes: sauce.dislikes,
        usersLiked: sauce.usersLiked,
        usersDisliked: sauce.usersDisliked,
        _id: req.params.id
      })
        .then(() => {
          // retourne un message confirmant la mise à jour
          res.status(SUCCES).json({ message: "alors!!!! on change d'avis??!" });
        })
        .catch(error => {
          // message d'erreur si la sauce n'a pu être mise à jour
          res.status(BAD_REQUEST).json({ error });
        });
    })
    // message d'erreur si la sauce n'a pu être recherché
    .catch(error => {
      res.status(NOT_FOUND).json({ error });
    });
}