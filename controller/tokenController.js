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
        console.log(err)
    }
}