const Sauce = require('../models/sauce');
const fs = require('fs');

const BAD_REQUEST = 400

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
    return res.status(201).json({ message: 'Sauce enregistrée !', sauceSaved})  
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

exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({
    _id: req.params.id
  }).then(
    (sauce) => {
      res.status(200).json(sauce);
    }
  ).catch(
    (error) => {
      res.status(404).json({
        error: error
      });
    }
  );
};

exports.modifySauce = (req, res, next) => {
    const deleteSauce = req.file ? {
        ...JSON.parse(req.body.thing),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };
  
    delete deleteSauce._userId;
    Sauce.findOne({_id: req.params.id})
        .then((sauce) => {
            if (sauce.userId != req.auth.userId) {
                res.status(401).json({ message : 'Not authorized'});
            } else {
                Sauce.updateOne({ _id: req.params.id}, { ...deleteSauce, _id: req.params.id})
                .then(() => res.status(200).json({message : 'Sauce modifiée !'}))
                .catch(error => res.status(401).json({ error }));
            }
        })
        .catch((error) => {
            res.status(BAD_REQUEST).json({ error });
        });
 };

exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id})
        .then(thing => {
            if (thing.userId != req.auth.userId) {
                res.status(401).json({message: 'Not authorized'});
            } else {
                const filename = thing.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    Sauce.deleteOne({_id: req.params.id})
                        .then(() => { res.status(200).json({message: 'Sauce supprimée !'})})
                        .catch(error => res.status(401).json({ error }));
                });
            }
        })
        .catch( error => {
            res.status(500).json({ error });
        });
 };

exports.getAllSauces = (req, res, next) => {
  Sauce.find().then(
    (sauces) => {
      res.status(200).json(sauces);
    }
  ).catch(
    (error) => {
      res.status(BAD_REQUEST).json({
        error: error
      });
    }
  );
};

exports.sauceLike = (req, res, next) => {

	Sauce.findOne({ _id: req.params.id })
		.then((sauce) => {
			switch (req.body.like) {
				case 1:

					if (!sauce.usersLiked.includes(req.body.userId)) {

						Sauce.updateOne(
							{ _id: req.params.id },
							{
								$inc: { likes: 1 },
								$push: { usersLiked: req.body.userId },
							}
						)
							.then(() => {res.status(201).json({ message: "wouha j'aime cette sauce" });
							})
							.catch((error) => res.status(400).json({ error }));
					}
					break;
				
				case -1:
					if (!sauce.usersDisliked.includes(req.body.userId)) {

						Sauce.updateOne(
							{ _id: req.params.id },
							{
								$inc: { dislikes: 1 },
								$push: { usersDisliked: req.body.userId },
							}
						)
							.then(() => {res.status(201).json({ message: "ah non, je ne l'aime pas" });
							})
							.catch((error) => res.status(400).json({ error }));
					}
					break;
				
				case 0:

					if (sauce.usersLiked.includes(req.body.userId)) {
						Sauce.updateOne(
							{ _id: req.params.id },
							{
								$inc: { likes: -1 },
								$pull: { usersLiked: req.body.userId },
								
							}
						)
							.then(() => {res.status(201).json({ message: "alors !!!!! on change d'avis???" });
							})
							.catch((error) => res.status(400).json({ error }));
					} else if (sauce.usersDisliked.includes(req.body.userId)) {

						Sauce.updateOne(
							{ _id: req.params.id },
							{
								$inc: { dislikes: -1 },
								$pull: { usersDisliked: req.body.userId },
							}
						)
							.then(() => {res.status(201).json({ message: 'finalement mmmmhhhh non' });
							})
							.catch((error) => res.status(400).json({ error }))
					}
					break;
				default:
					res.status(401).json({ message: 'nan nan nan tu ne peu pas voter' });
			}
		});
}