import Joi from 'joi'
import User from '../models/userModel.js'
import mongoose from 'mongoose'

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
        const value = await schema.validateAsync({ username: req.body.username, email: req.body.email, password: req.body.password, repeat_password: req.body.confirmPassword })
        next()
    } catch (err) {
        if (err.details[0].type === 'string.empty' && err.details[0].context.key === 'username') {
            res.status(400).json({ msg: 'Username is required', key: 'username' })
            return
        } else if (err.details[0].type === 'string.min' || err.details[0].type === 'string.max' && err.details[0].context.key === 'username') {
            res.status(400).json({ msg: 'Username should contain min. 2 and max. 30 characters', key: 'username' })
            return
        } else if (err.details[0].type === 'string.empty' && err.details[0].context.key === 'email') {
            res.status(400).json({ msg: 'Email is required', key: 'email' })
            return
        } else if (err.details[0].type === 'string.email' && err.details[0].context.key === 'email') {
            res.status(400).json({ msg: 'Invalid email format', key: 'email' })
            return
        } else if (err.details[0].type === 'string.empty' && err.details[0].context.key === 'password') {
            res.status(400).json({ msg: 'Password is required', key: 'password' })
            return
        } else if (err.details[0].type === 'string.pattern.base' && err.details[0].context.key === 'password') {
            res.status(400).json({ msg: 'Password do not match the required pattern. /^[a-zA-Z0-9]{3,30}$/', key: 'password' })
            return
        } else {
            res.status(400).json({ msg: 'Something went wrong while logging in. Please try it again.', key: 'password' })
            return
        }
    }
}

export async function validateLoginInput(req, res, next) {
    console.log('first')
    const schema = Joi.object({
        mailOrName: Joi.string(),
        password: Joi.string()
    })

    try {
        const value = await schema.validateAsync({ mailOrName: req.body.mailOrName, password: req.body.password })
        next()
    } catch (err) {
        console.log(err, err.details[0].context)
        if (err.details[0].type === 'string.empty' && err.details[0].context.key === 'mailOrName') {
            res.status(400).json({ msg: 'This field is required. Either login with your username or email.', key: 'email' })
        } else if (err.details[0].type === 'string.empty' && err.details[0].context.key === 'password') {
            res.status(400).json({ msg: 'This field is required. Please enter a password.', key: 'password' })
        } else {
            res.status(400).json({ msg: 'Something went wrong while logging in. Please try it again.', key: 'password' })
        }
    }
}