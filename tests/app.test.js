const expect = require("expect"),
      request = require("supertest");
      
const {app} = require("../app"),
      {Todo} = require("../models/todo");

const todos = [{
    text: "First test todo"
}, {
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