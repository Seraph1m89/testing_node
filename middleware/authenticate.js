var {User} = require("../models/user");
var {Todo} = require("../models/todo");

const authenticate = (req, res, next) => {
    var token = req.header('x-auth');

    User.findByToken(token).then(user => {
        if(!user) {
            return Promise.reject();
        }

        res.locals.user = user;
        res.locals.token = token;
        next();
    })
    .catch(err => {
        res.status(401).send();
    });;
}

const isAuthor = (req, res, next) => {
    Todo.findById(req.params.id)
    .then(todo => {
        if(!todo || todo.author.toHexString() !== res.locals.user._id.toHexString()) {
            return Promise.reject();
        }

        next();
    })
    .catch(err => {
        res.status(401).send();
    });;
}

module.exports = {authenticate, isAuthor};