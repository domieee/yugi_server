import Joi from 'joi'

export async function validateRegisterInput(req, res, next) {

    const schema = Joi.object({
        username: Joi.string()
            .required()
            .alphanum()
            .min(2)
            .max(30),

        email: Joi.string()
            .email({ minDomainSegments: 2 }),


        // TODO: CHANGE THE REGEXP
        password: Joi.string()
            .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),

        repeat_password: Joi.ref('password'),
    })

    try {
        const value = await schema.validateAsync({ username: req.body.username, email: req.body.mail, password: req.body.password, repeat_password: req.body.confirmPassword })
        res.status(200).json({ msg: 'Registration successful' })
    } catch (err) {
        if (err.details[0].type === 'string.empty' && err.details[0].context.key === 'username') {
            res.status(400).json({ msg: 'Username is required', key: 'username' })
        } else if (err.details[0].type === 'string.min' || err.details[0].type === 'string.max' && err.details[0].context.key === 'username') {
            res.status(400).json({ msg: 'Username should contain min. 2 and max. 30 characters', key: 'username' })
        } else if (err.details[0].type === 'string.empty' && err.details[0].context.key === 'email') {
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