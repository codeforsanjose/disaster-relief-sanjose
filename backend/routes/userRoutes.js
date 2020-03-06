import { Router } from 'express'
import { db } from '../lib/db'
import { users_db_name } from '../Utilities/API_utilities'
import bcrypt from 'bcryptjs'

const usersRouter = Router()


usersRouter.post('/api/user', (req, res) => {
    // It is good practice to specifically pick the fields we want to insert here *in the backend*,
    // even if we have already done so on the front end. This is to prevent malicious users
    // from adding unexpected fields by modifying the front end JS in the browser.
    var newUser =  {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        passphrase: req.body.passphrase,
    }
    createNewUser(newUser).then(result => {
        return res.json(result)
    }).catch(error => {
        console.log(error)
        return res.status(522).json(error)
    })
})

usersRouter.get('/api/user/:id', (req, res) => {
    console.log('req is', req.user)
    db.getById(users_db_name, req.params.id)
    .then(user => {
        delete user.passphrase
        req.user = user[0]
        return res.status(201).json({ user: user[0] })
    })
    .catch(error => {
        res.status(501).json({ error })
    })
})

const createNewUser = (newUser) => {
    return bcrypt.hash(newUser.passphrase, 10, (err, hash) => {
        newUser.passphrase = hash
        return db.insertOne(users_db_name, newUser)
    })
}

export {
    usersRouter
}