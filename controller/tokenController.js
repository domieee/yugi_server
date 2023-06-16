import jwt from 'jsonwebtoken'

export const createToken = (user) => {
    const token = jwt.sign({ username: user.username, id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' })
    return token
}

export const receiveUserInformations = (req, res, next) => {
    console.log(req.body.token)
    const token = req.body.token
    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        console.log(decodedToken, 'decoded')
        res.json(decodedToken)
        console.log(decodedToken)
    } catch (err) {
        res.json({ msg: 'Your Session is expired. Please login again.' })
    }
}

export const validateModeratorAction = async (req, res, next) => {

    console.log('UserID', req.body.userId)
    const decodedToken = await jwt.verify(req.body.userId, process.env.JWT_SECRET);
    console.log('decodedToken', decodedToken)
    if (decodedToken.role === 'moderator' || decodedToken.role === 'administrator') {
        next()
    } else {
        res.status(401).json({ msg: 'You are not allowed to perform this action.' })
    }
}