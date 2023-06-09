import { createHmac } from 'crypto'

export function encrypt(req, res, next) {
    const hmac = createHmac('sha512', req.body.password)
    req.body.password = hmac.digest('hex')
    next()
}