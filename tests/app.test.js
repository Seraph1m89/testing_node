const {expect} = require("chai"),
      request = require("supertest"),
      mongoose = require("mongoose"),
      jwt = require("jsonwebtoken");
      
const {app} = require("../app"),
      {Todo} = require("../models/todo"),
      {User} = require("./../models/user"),
      {todos, users, populateTodos, populateUsers} = require("./seed/seed");

beforeEach(populateUsers);
beforeEach(populateTodos);

describe("POST /todos", () => {
    it("Should create a new todo", (done) => {
        var text = "Test todo text";
        request(app)
        .post("/todos")
        .send({text})
        .expect(200)
        .expect((res) => {
           expect(res.body.text).to.equal(text); 
        })
        .end((err, res) => {
            if(err) {
                return done(err);
            }
            Todo.find({text}).then((todos) => {
                expect(todos).to.have.length(1);
                expect(todos[0].text).to.equal(text);
                done();
            }).catch(err => done(err));
        });
    });
    
    it("should not create todo with invalid body data", done => {
       request(app)
       .post("/todos")
       .send({})
       .expect(400)
       .expect(res => {
           expect(res.body.message).to.equal("Todo validation failed: text: Path `text` is required.");
       })
       .end((err, res) => {
           if(err) {
               return done(err);
           }
           Todo.find().then(todos => {
               expect(todos).to.have.length(2);
               done();
           })
           .catch(err => done(err));
       });
    });
});

describe("GET /todos", () => {
    it("should get all todos", done => {
       request(app)
       .get("/todos")
       .expect(200)
       .expect(res => {
           expect(res.body.todos).to.have.length(2);
       })
       .end((err,res) => {
           if(err) {
               return done(err);
           }
           done();
       });
    });
});

describe("GET /todos/:id", () => {
    it("should return first mock of todo", done => {
        request(app)
        .get(`/todos/${todos[0]._id}`)
        .expect(200)
        .expect(res => {
            expect(res.body.todo._id).to.equal(todos[0]._id.toHexString());
            expect(res.body.todo.text).to.equal(todos[0].text);
        })
        .end((err, res) => {
           if(err) {
               return done(err);
           } 
           done();
        });
    });
    
    it("should not find todo in the database", done => {
        var id = new mongoose.Types.ObjectId;
        request(app)
        .get(`/todos/${id}`)
        .expect(res => {
            expect(res.todo).to.be.undefined;
        })
        .expect(404)
        .end((err, res) => {
            if(err) {
                return done(err);
            }
            done();
        });
    });
    
    it("should be invalid id", done => {
        request(app)
        .get('/todos/1234')
        .expect(400)
        .end((err, res) => {
            if(err) {
                return done(err);
            }
            done();
        });
    });
});

describe("DELETE /todos/:id", () => {
   it("Should delete todo", done => {
       var id = todos[0]._id;
       request(app)
       .delete(`/todos/${id}`)
       .expect(200)
       .expect(res => {
           expect(res.body.todo._id).to.equal(todos[0]._id.toHexString());
       })
       .end((err, res) => {
           if(err) {
               return done(err);
           }
           
           Todo.find().then(data => {
               expect(data).to.have.lengthOf(1);
               return Todo.findById(todos[0]._id);
           }).then(todo => {
               expect(todo).to.be.null;
               done();
           }).catch(err => done(err));
       });
   });
   
   it("should be invalid id", done => {
       request(app)
       .delete("/todos/1234")
       .expect(400)
       .expect(res => {
       }).end((err, res) => {
           if(err) {
               return done(err);
           }
           Todo.find().then(items => {expect(items).to.have.lengthOf(2)
               done();
           }).catch(err => { if(err) {
                   done(err);
               }
           });
       });
   });
   
   it("should not exist in database", done => {
      var id = new mongoose.Types.ObjectId();
      
      request(app)
      .delete(`/todos/${id}`)
      .expect(404)
      .expect(res => expect(res.body.todo).to.be.undefined)
      .end((err, res) => {
          if(err) {
              return done(err);
          }
          
          Todo.find().then(items => {
              expect(items.length).to.equal(2);
              done()
          })
          .catch(err => done(err));
      })
   });
});

describe("PUT /todos/:id", () => {
    it("Should update todo", done => {
        var updatedTodo = {
            text: "Updated todo",
            completed: true
        }

        request(app)
        .put(`/todos/${todos[0]._id}`)
        .send(updatedTodo)
        .expect(200)
        .expect(res => {
            expect(res.body.todo.text).to.equal(updatedTodo.text);
            expect(res.body.todo.completed).to.be.a("boolean");
            expect(res.body.todo.completed).to.equal(updatedTodo.completed);
            expect(res.body.todo.completedAt).to.exist;
        })
        .end((err, res) => {
            if(err) {
                return done(err);
            }
            done();
        });
    });

    it("Should not add additional properties to object", done => {
        var additionalUpdate = {
            script: "This will do no good"
        }

        request(app)
        .put(`/todos/${todos[0]._id}`)
        .expect(200)
        .expect(res => {
            expect(res.body.todo.script).to.be.undefined;
        })
        .end(err => {
            if(err) {
                return done(err);
            }
            done();
        });
    });

    it("Should be malformed id", done => {
        request(app)
        .put("/todos/12345")
        .expect(400)
        .end(err => {
            if(err) {
                return done(err);
            }
            done();
        });
    });

    it("Should not find item by given id", done => {
        var id = new mongoose.Types.ObjectId();

        request(app)
        .put(`/todo/${id}`)
        .expect(404)
        .end(err => {
            if(err) {
                return done(err);
            }
            done();
        });
    });
});

describe("/GET users/me", () => {
    it("Should return user if authenticated", done => {
        request(app)
        .get("/users/me")
        .set("x-auth", users[0].tokens[0].token)
        .expect(200)
        .expect(res => {
            expect(res.body.email).to.be.equal(users[0].email);
            expect(res.body._id).to.be.equal(users[0]._id.toHexString());
        })
        .end((err, res) => {
            if(err) {
                return done(err);
            }
            
            done();
        });
    });

    it("Should return 401 for not authenticated user", done => {
        request(app)
        .get("/users/me")
        .expect(401)
        .end((err, res) => {
            if(err) {
                return done(err);
            }
            expect(res.body).to.be.empty;

            done();
        });
    });

    it("Should return 401 for incorrect token", done => {
        request(app)
        .get("/users/me")
        .set("x-auth", jwt.sign({_id: users[0]._id, access: "auth"}, "1234").toString())
        .expect(401)
        .end((err, res) => {
            if(err) {
                return done(err);
            }
            expect(res.body).to.be.empty;            

            done();
        });
    });
});

describe("/POST users", () => {

    it("Should create new user", done => {
        var newUser = {
            email: "someNewEmail@someEmail.com",
            password: "123456"
        };
        request(app)
        .post("/users")
        .send(newUser)
        .expect(200)
        .end((err, res) => {
            if(err) {
                return done(err);
            }

            expect(res.body.email).to.be.equal(newUser.email);
            expect(res.body._id).to.be.a('string');
            expect(res.headers["x-auth"]).to.exist;

            User.findOne({email: newUser.email})
            .then(user => {
                expect(user).to.exist;
                expect(user.email).to.be.equal(newUser.email);
                expect(user.password).to.not.equal(newUser.password);
                done();
            })
            .catch(err => done(err));
        });
    });

    it("Should return email validation error", done => {
        var newUser = {
            email: "someNewEmail@someinvalidemail",
            password: "123456"
        };
        request(app)
        .post("/users")
        .send(newUser)
        .expect(400)
        .end((err, res) => {
            if(err) {
                return done(err);
            }

            expect(res.body.errors).to.exist;
            expect(res.body.errors.email).to.exist;

            User.findOne({email: newUser.email})
            .then(user => {
                expect(user).to.not.exist;
                done();
            })
            .catch(err => done(err));
        });
    });

    it("Should return password validation error", done => {
        var newUser = {
            email: "someNewEmail@someEmail.com",
            password: "12345"
        };
        request(app)
        .post("/users")
        .send(newUser)
        .expect(400)
        .end((err, res) => {
            if(err) {
                return done(err);
            }

            expect(res.body.errors).to.exist;
            expect(res.body.errors.password).to.exist;

            User.findOne({email: newUser.email})
            .then(user => {
                expect(user).to.not.exist;
                done();
            })
            .catch(err => done(err));
        });
    });

    it("Should not create user if email already taken", done => {
        request(app)
        .post("/users")
        .send(users[0])
        .expect(400)
        .end((err, res) => {
            if(err) {
                return done(err);
            }

            expect(res.body.code).to.be.equal(11000);
            done();
        });
    });
});

describe("/POST users/login", () => {

    it("Should return token", done => {
        request(app)
        .post("/users/login")
        .send({email: users[1].email, password: users[1].password})
        .expect(200)
        .end((err, res) => {
            if(err) {
                return done(err);
            }
            expect(res.header["x-auth"]).to.exist;

            User.findById(users[1]._id)
            .then(user => {
                expect(user.tokens[0]).to.include({
                    access: "auth",
                    token: res.headers["x-auth"]
                })
                done();
            })
            .catch(err => {
                done(err);
            });
        });
    });

    it("Should return status 401", done => {
        request(app)
        .post("/users/login")
        .send({email: users[1].email, password: users[1].password + 1})
        .expect(401)
        .end((err, res) => {
            if(err) {
                return done(err);
            }

            expect(res.headers["x-auth"]).to.not.exist;
            User.findById(users[1]._id)
            .then(user => {
                expect(user.tokens).to.have.length(0);
                done();
            })
            .catch(err => {
                done(err);
            });
        });
    });
});

describe("DELETE /users/me/token", () => {
    it("Should delete token", done => {
        request(app)
        .delete("/users/me/token")
        .set("x-auth", users[0].tokens[0].token)
        .expect(200)
        .end((err, res) => {
            if(err) {
                return done(err);
            }

            expect(res.body).to.be.empty;
            User.findById(users[0]._id)
            .then(user => {
                expect(user).to.exist;
                expect(user.tokens).to.have.lengthOf(0);
                done();
            });    
        });
    });

    it("Should return 400 and keep token", done => {
        request(app)
        .delete("/users/me/token")
        .set("x-auth", users[0].tokens.token + 1)
        .expect(401)
        .end((err, res) => {
            if(err) {
                return done(err);
            }

            User.findById(users[0]._id)
            .then(user => {
                expect(user).to.exist;
                expect(user.tokens).to.have.lengthOf(1);
                done();
            });
        });
    });
});