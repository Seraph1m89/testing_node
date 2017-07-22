const {Todo} = require("./../../models/todo"),
      {User} = require("./../../models/user"),
      mongoose = require("mongoose"),
      jwt = require("jsonwebtoken");

const userOneId = new mongoose.Types.ObjectId;
const usetTwoId = new mongoose.Types.ObjectId;
const users = [{
    _id: userOneId,
    email: "denis.test@test.test",
    password: "testpass",
    tokens: [{
        access: "auth",
        token: jwt.sign({_id: userOneId, access: "auth"}, "abc").toString()
    }]
}, {
    _id: usetTwoId,
    email: "secondUser@second.user",
    password: "userTwoPass"
}]

const todos = [{
    _id: new mongoose.Types.ObjectId,
    text: "First test todo"
}, {
    _id: new mongoose.Types.ObjectId,
    text: "Second test todo"
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