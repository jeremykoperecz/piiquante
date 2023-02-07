// middleware pour extraire le mdp 
const jwt = require('jsonwebtoken');

const dotenv = require("dotenv");
dotenv.config();
 
module.exports = (req, res, next) => {
   try {
       const token = req.headers.authorization.split(' ')[1];
       const decodedToken = jwt.verify(token, /*process.env.TOKEN_SECRET*/'?mh8Ypnn_;Te#aHRLU2)P*`PG)uq=6V%>J^fpTH5cfb4V8onT"ghF4$b6hAq^ye');
       const userId = decodedToken.userId;
       req.auth = {
           userId: userId
       };
	next();
   } catch(error) {
       res.status(401).json({ error });
   }
};