import jwt from 'jsonwebtoken'

export const createToken = (user) => {
    const token = jwt.sign(
        { username: user.username, id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '30s' }
    );
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
        if (err.name === 'TokenExpiredError') {
            res.status(401).json({ msg: 'Your Session is expired. Please login again.' })
        } else {
        }
    }
}

export const validateModeratorAction = async (req, res, next) => {

    try {
        console.log('UserID', req.body.userId)
        const decodedToken = jwt.verify(req.body.userId, process.env.JWT_SECRET);
        console.log('decodedToken', decodedToken)
        if (decodedToken.role === 'moderator' || decodedToken.role === 'administrator') {
            next()
        }
    } catch (err) {
        console.log(err)
        if (err.name === 'TokenExpiredError') {
            res.json({ msg: 'Your Session is expired. Please login again.' })
        } else {

        }
    }


}