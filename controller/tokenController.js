import jwt from 'jsonwebtoken'

export const createToken = (user) => {
    const token = jwt.sign(
        { username: user.username, id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '2h' }
    );
    return token
}

export const receiveUserInformations = (req, res, next) => {
    console.log(req.body.token)
    const token = req.body.token
    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        res.json(decodedToken)
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            res.status(401).json({ msg: 'Your Session is expired. Please login again.' })
        }
    }
}

export const validateModeratorAction = async (req, res, next) => {

    try {
        const decodedToken = jwt.verify(req.body.userId, process.env.JWT_SECRET);

        if (decodedToken.role === 'moderator' || decodedToken.role === 'administrator') {
            next()
        }
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            res.json({ msg: 'Your Session is expired. Please login again.' })
        }
    }
}

export const validateTournamentCreationPermission = async (req, res, next) => {
    try {
        const decodedToken = jwt.verify(req.body.token, process.env.JWT_SECRET);
        if (decodedToken.role === 'moderator' || decodedToken.role === 'administrator') {
            const createdBy = {
                name: decodedToken.username,
                id: decodedToken.id,
                createdAt: new Date()
            };
            req.createdBy = createdBy;
            next()
        } else (
            res.end()
        )
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            // TODO: Add handling for the case where the token is expired
            res.json({ msg: 'Your Session is expired. Please login again.' })
        }
    }
}