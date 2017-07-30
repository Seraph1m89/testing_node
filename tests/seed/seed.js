const {Todo} = require("./../../models/todo"),
      {User} = require("./../../models/user"),
      mongoose = require("mongoose"),
      jwt = require("jsonwebtoken");

const userOneId = new mongoose.Types.ObjectId;
const userTwoId = new mongoose.Types.ObjectId;
const users = [{
    _id: userOneId,
    email: "denis.test@test.test",
    password: "testpass",
    tokens: [{
        access: "auth",
        token: jwt.sign({_id: userOneId, access: "auth"}, process.env.SALT).toString()
    }]
}, {
    _id: userTwoId,
    email: "secondUser@second.user",
    password: "userTwoPass",
    tokens: [{
        access: "auth",
        token: jwt.sign({_id: userTwoId, access: "auth"}, process.env.SALT).toString()
    }]
}]

const todos = [{
    _id: new mongoose.Types.ObjectId,
    author: userOneId,
    text: "First test todo"
}, {
    _id: new mongoose.Types.ObjectId,
    text: "Second test todo",
    author: userTwoId
}];

const populateTodos = (done) => {
   Todo.remove({}).then(() => {
        return Todo.insertMany(todos);
    }).then(() => done()); 
};

const populateUsers = done => {
    User.remove({}).then(() => {
        var userOne = new User(users[0]).save();
        var userTwo = new User(users[1]).save();
        return Promise.all([userOne, userTwo]);
    }).then(() => done());
};

module.exports = {todos, users, populateTodos, populateUsers};