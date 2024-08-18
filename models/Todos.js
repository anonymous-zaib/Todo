const mongoose = require("mongoose");

const todoSchema = new mongoose.Schema({
   description: {
    type: String,
    required: true
   },
   complete:{
    type: Boolean,
    default: false
   },
   owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
   }
},
{
   timestamps: true
});



const Todo = mongoose.model('Todo', todoSchema)
module.exports = Todo