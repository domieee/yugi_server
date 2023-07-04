import User from '../models/userModel.js'

import { createToken } from './tokenController.js';

let response = {}

const cookieConfig = {
    httpOnly: true,
    secure: true,
    sameSite: 'none'
}

function getCurrentDate() {
    const date = new Date();
    const formattedDate = date.toISOString().replace('Z', '+00:00');
    return formattedDate
}

async function checkMail(email) {
    try {
        const checkEmailExists = await User.findOne({ email: email });
        if (checkEmailExists === null) {
            console.log('REGISTER: email not registered');
            return true;
        } else {
            console.log('REGISTER: email registered');
            response = { msg: 'E-Mail already registered', key: 'email' };
            return false
        }
    } catch (error) {
        console.error('Error finding user:', error);
        return false;
    }
}

async function checkUsername(username) {
    try {
        const checkUsernameExists = await User.findOne({ username: username });
        if (checkUsernameExists === null) {
            console.log('REGISTER: username not registered');
            return true;
        } else {
            console.log("🚀 ~ file: registrationController.js:44 ~ checkUsername ~ username:", username)
            console.log('REGISTER: username registered');
            response = { msg: 'Username already registered', key: 'email' };
            return false
        }
    } catch (error) {
        console.error('Error finding user:', error);
        return false;
    }
}

export async function completeRegistration(req, res) {

    if (await checkUsername(req.body.username) && await checkMail(req.body.email)) {
        const user = await User.create({ username: req.body.username, email: req.body.email, password: req.body.password, role: 'administrator', createdAt: getCurrentDate() })
        user.save()
        const token = createToken(user)
        res.json(token)
    } else {
        res.status(400).json(response)
    }
}

async function checkMailOrName(mailOrName) {
    const checkMailOrNameExists = await User.findOne({ username: mailOrName }) || await User.findOne({ email: mailOrName });
    if (checkMailOrNameExists === null) {
        response = { msg: 'The login infomations u provided seems to be incorrect.', key: 'mailOrPassword' };
        return false
    } else {
        return true
    }
}

async function checkPassword(mailOrName, password) {
    const user = await User.findOne({ username: mailOrName }) || await User.findOne({ email: mailOrName })
    if (user.password === password) {
        return true
    } else {
        response = { msg: 'The login infomations u provided seems to be incorrect.', key: 'mailOrPassword' };
        return false
    }
}

export async function completeLogin(req, res) {
    if (await checkMailOrName(req.body.mailOrName)) {
        if (await checkPassword(req.body.mailOrName, req.body.password)) {
            const user = await User.findOne({ username: req.body.mailOrName }) || await User.findOne({ email: req.body.mailOrName });
            user.save()
            const token = createToken(user)
            res.json(token)
        } else {
            res.status(400).json(response)
        }
    } else {
        res.status(400).json(response)
    }
}
