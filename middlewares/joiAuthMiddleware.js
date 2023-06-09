import Joi from 'joi'

export async function validateRegisterInput(req, res, next) {
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
}