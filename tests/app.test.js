const expect = require("expect"),
      request = require("supertest"),
      mongoose = require("mongoose");
      
const {app} = require("../app"),
      {Todo} = require("../models/todo");

const todos = [{
    _id: new mongoose.Types.ObjectId,
    text: "First test todo"
}, {
    _id: new mongoose.Types.ObjectId,
    text: "Second test todo"
}];

beforeEach((done) => {
   Todo.remove({}).then(() => {
        return Todo.insertMany(todos);
    }).then(() => done()); 
});

describe("POST /todos", () => {
    it("Should create a new todo", (done) => {
        var text = "Test todo text";
        request(app)
        .post("/todos")
        .send({text})
        .expect(200)
        .expect((res) => {
           expect(res.body.text).toBe(text); 
        })
        .end((err, res) => {
            if(err) {
                return done(err);
            }
            Todo.find({text}).then((todos) => {
                expect(todos.length).toBe(1);
                expect(todos[0].text).toBe(text);
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
           expect(res.body.message).toBe("Todo validation failed: text: Path `text` is required.");
       })
       .end((err, res) => {
           if(err) {
               return done(err);
           }
           Todo.find().then(todos => {
               expect(todos.length).toBe(2);
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
           expect(res.body.todos.length).toBe(2);
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
            expect(res.body.todo._id).toBe(todos[0]._id.toHexString());
            expect(res.body.todo.text).toBe(todos[0].text);
        })
        .end((err, res) => {
           if(err) {
               return done(err);
           } 
           
           return done();
        });
    });
    
    it("should not find todo in the database", done => {
        var id = new mongoose.Types.ObjectId;
        request(app)
        .get(`/todos/${id}`)
        .expect(res => {
            expect(res.todo).toNotExist();
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
           expect(res.body.todo._id).toBe(todos[0]._id.toHexString());
       })
       .end((err, res) => {
           if(err) {
               return done(err);
           }
           
           Todo.find().then(data => {
               expect(data.length).toBe(1);
               return Todo.findById(todos[0]._id);
           }).then(todo => {
               expect(todo).toNotExist();
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
           Todo.find().then(items => {expect(items.length).toBe(2)
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
      .expect(res => expect(res.body.todo).toNotExist())
      .end((err, res) => {
          if(err) {
              return done(err);
          }
          
          Todo.find().then(items => {
              expect(items.length).toBe(2);
              done()
          })
          .catch(err => done(err));
      })
   });
});