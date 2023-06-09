import jwt from 'jsonwebtoken'

export const createToken = (user) => {
    console.log(user, 'tokennnnnnnnnnnnnnnnnnnnnn')
    const token = jwt.sign({ user: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' })
    console.log(token)
    return token
}