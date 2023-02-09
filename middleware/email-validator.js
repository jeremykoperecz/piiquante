const validatorEmails = require('validator');
const BAD_REQUEST = 400


module.exports = (req, res, next) => {
	if (validatorEmails.isEmail(req.body.email)) {
		next();
	} else {
        return res
            .status(BAD_REQUEST).json({ error: 'cet le bordel ton email' })
        console.log('caca email')
	}
};