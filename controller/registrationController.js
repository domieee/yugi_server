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
        const user = await User.create({ username: req.body.username, email: req.body.email, password: req.body.password, role: 'user', createdAt: getCurrentDate() })
        user.save()
        const token = createToken(user)
        res.status(200).json(token)
    } else {
        res.status(400).json(response)
    }
}
