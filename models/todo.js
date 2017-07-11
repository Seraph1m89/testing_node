const {mongoose} = require("../database/db");

var todoSchema = new mongoose.Schema({
   text: {
       type: String,
       required: true,
       minlength: 1,
       trim: true
   },
   completed: {
       type: Boolean,
       default: false
   },
   completedAt: Number
});

var Todo = mongoose.model("Todo", todoSchema);

module.exports = {Todo};