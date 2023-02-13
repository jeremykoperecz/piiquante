const passwordValidator = require('password-validator');
const BAD_REQUEST = 400

let passwordSchema = new passwordValidator();

passwordSchema
	.is().min(8)
	.has().uppercase()
	.has().lowercase()
	.has().digits(1)
	.has().not().spaces()
	.is().not().oneOf(['Passw0rd', 'Password123', 'Azerty1', 'Azerty2']);

module.exports = (req, res, next) => {
	if (passwordSchema.validate(req.body.password)) {
		next();
	} else {
        res.status(BAD_REQUEST).json({ message: 'le mot de passe doit contenir minimum 6 caracteres, maximum 15, une majuscule et un chiffre:' + passwordSchema.validate('req.body.password', { list: true }) });
	}
};