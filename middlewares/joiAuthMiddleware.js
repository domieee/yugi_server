import Joi from 'joi'

export async function validateRegisterInput(req, res, next) {

    res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL);
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    const schema = Joi.object({
        username: Joi.string()
            .required()
            .alphanum()
            .min(2)
            .max(30),

        // TODO: CHANGE THE REGEXP
        password: Joi.string()
            .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),

        repeat_password: Joi.ref('password'),

        email: Joi.string()
            .email({ minDomainSegments: 2 })
    })

    try {
        const value = await schema.validateAsync({ username: req.body.username, email: req.body.mail, password: req.body.password, repeat_password: req.body.confirmPassword })
        next()
    } catch (err) {
        res.status(400).send(err)
        if (err.details[0].type === 'string.empty' && err.details[0].context.key === 'email') {
            res.status(400).json({ msg: 'Email is required', key: 'email' })
        } else if (err.details[0].type === 'string.email' && err.details[0].context.key === 'email') {
            res.status(400).json({ msg: 'Invalid email format', key: 'email' })
        } else if (err.details[0].type === 'string.empty' && err.details[0].context.key === 'password') {
            res.status(400).json({ msg: 'Password is required', key: 'password' })
        } else if (err.details[0].type === 'string.pattern.base' && err.details[0].context.key === 'password') {
            res.status(400).json({ msg: 'Password do not match the required pattern. /^[a-zA-Z0-9]{3,30}$/', key: 'password' })
        } else {
            res.status(400).json({ msg: 'Something went wrong while logging in. Please try it again.', key: 'password' })
        }
    }
}