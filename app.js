require("./settings/config");

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

app.listen(process.env.PORT, process.env.IP);

module.exports = {app};