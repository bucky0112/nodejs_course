import mongoose from 'mongoose'

const todosSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { versionKey: false })

const Todos = mongoose.model("Todos", todosSchema, "TodosExample")

export default Todos