require("./settings/config");

const express = require("express"),
      app = express(),
      bodyParser = require("body-parser"),
      _ = require("lodash");
      
var {mongoose} = require("./database/db"),
    {Todo} = require("./models/todo"),
    {User} = require("./models/user"),
    {authenticate} = require("./middleware/authenticate");
      
app.use(bodyParser.json());

app.post("/todos", (req, res) => {

    var body = _.pick(req.body, ["text"]);
    var todo = new Todo({
        text: body.text
    });

    todo.save().then((item) => {
        res.send(item);
    }, (err) => {
        res.status(400).send(err);
    });
});

app.get("/todos", (req, res) => {
    Todo.find().then(todos => {
        res.send({todos});
    }, err => {
        res.status(400).send(err);
    });
});

app.get("/todos/:id", (req, res) => {
    if(!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).send("Invalid id");
    }
    
    Todo.findById(req.params.id).then(todo => {
        if(!todo) {
            return res.status(404).send("No todo found");
        }
        
        res.send({todo});
    }, err => {
        res.status(400).send(err);
    });
});

app.delete("/todos/:id", (req, res) => {
    if(!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).send("Invalid id");
    }
    
    Todo.findByIdAndRemove(req.params.id).then(todo => {
        if(!todo) {
            return res.status(404).send();
        }
        res.send({todo});
    }).catch(err => {
        res.status(400).send(err);
    });
});

app.put("/todos/:id", (req, res) => {
    var id = req.params.id;
    if(!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).send("Invalid id");
    }

    var body = _.pick(req.body, ['text', 'completed']);

    if(_.isBoolean(body.completed) && body.completed) {
        body.completedAt = new Date().getTime();
    } else {
        body.completed = false;
        body.completedAt = null;
    }

    Todo.findByIdAndUpdate(id, body, {new: true})
    .then(todo => {
        if(!todo) {
            return res.status(404).send();
        }

        res.send({todo});
    }).catch(err => res.status(400).send());
});

app.post("/users", (req, res) => {
    var body = _.pick(req.body, ['email', 'password']);
    var user = new User(body);

    user.save().then(() => {
        if(!user) {
            return res.status(400).send("no user was created");
        }
        return user.generateAuthToken();
    })
    .then((token) => {
        res.header('x-auth', token).send(user);
    })
    .catch(err => {
        res.status(400).send(err);
    })
});

app.get("/users/me", authenticate, (req, res) => {
    res.send(res.locals.user);
});

app.post("/users/login", (req, res) => {
    var body = _.pick(req.body, ["email", "password"]);

    User.findByCredentials(body.email, body.password)
    .then(user => user.generateAuthToken())
    .then(token => res.setHeader("x-auth", token).send())
    .catch(err => {
        res.status(401).send(err);
    });
});

app.listen(process.env.PORT, process.env.IP);

module.exports = {app};