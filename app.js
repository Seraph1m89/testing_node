const express = require("express"),
      app = express(),
      bodyParser = require("body-parser");

var {mongoose} = require("./database/db"),
    {Todo} = require("./models/todo"),
    {User} = require("./models/user");
      
app.use(bodyParser.json());

app.post("/todos", (req, res) => {
   var todo = new Todo({
       text: req.body.text
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
})

app.get("/todos/:id", (req, res) => {
   Todo.findById(req.params.id).then(todos => {
       res.send({todos});
   }, err => {
       res.status(400).send(err);
   });
});

app.listen(process.env.PORT, process.env.IP);

module.exports = {app};