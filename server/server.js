const express = require('express');
const bp = require('body-parser');
const mongoose = require('mongoose');
const port = 5000;
const app = express();
// const { v4: uuidv4 } = require('uuid');
app.use(bp.urlencoded({extended: false}));
app.use(bp.json());

const con = ()=>{console.log('db connected');}
mongoose.connect('mongodb+srv://admin:admin@cluster0.hic7i5m.mongodb.net/ToDoList', con());


const userSchema = mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    password: String,
    tasks: [{ taskId: Number, taskName: String, completed: Boolean, priority: String}],
});

const userModel = mongoose.model('Users',userSchema);

// get the users array from DB
app.get('/users', async(req, res) => {
    try {
      const users = await userModel.find();
      res.json({ users });
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).send('Internal server error');
    }
  });


  //Create a user
app.post('/', async (req, res) => {
    try {
        // Check if the email already exists
        const existingUser = await userModel.findOne({ email: req.body.email });
        if (existingUser) {
            return res.status(400).send('error');
        }

        // Create a new user document
        await userModel.create({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password: req.body.password,
            tasks: [],
            completedTasks: []
        });

        return res.redirect('/');
    } catch (error) {
        console.error('Error creating user:', error);
        return res.status(500).send('Internal server error');
    }
});

//Create a task and push it the the user tasks array
app.post('/tasks', async (req, res) => {
    try {
        // Extract task data from the request body
        const { userEmail, taskName, completed, priority } = req.body;
        const uniqueID = Date.now() + Math.floor(Math.random() * 1000);
        // Find the user by their email
        const user = await userModel.findOne({ email: userEmail });
        if (!user) {
            return res.status(404).send('User not found');
        }

        // Create a new task object
        const newTask = {
            taskId: uniqueID,
            taskName: taskName,
            completed: completed || false, 
            priority: priority || 'low'
        };

        // Add the new task to the user's tasks array
        user.tasks.push(newTask);

        // Save the updated user document
        await user.save();

        // Send a success response
        return res.status(201).json({ message: 'Task created successfully', task: newTask });
    } catch (error) {
        console.error('Error creating task:', error);
        return res.status(500).send('Internal server error');
    }
});

// Update task status (move between tasks and completedTasks arrays)
app.put('/tasks/:taskId', async (req, res) => {
  try {
    const { userEmail, completed, taskId, taskName } = req.body;
  
    // Find the user by their email
    const user = await userModel.findOne({ email: userEmail });
    if (!user) {
    return res.status(404).send('User not found');
    }
  
    // Find the task by its ID
    const taskToUpdate = user.tasks.find((task) => task.taskId === parseInt(taskId));
    if (!taskToUpdate) {
      return res.status(404).send('Task not found');
    }
  
    // Update the task's completion status and name
    if (completed !== undefined) {
      taskToUpdate.completed = completed;
    }
    if (taskName !== undefined) {
      taskToUpdate.taskName = taskName;
    }
  
    // Save the updated user document
    await user.save();
  
    return res.status(200).json({ message: 'Task status updated', task: taskToUpdate });
  } catch (error) {
    console.error('Error updating task:', error);
    return res.status(500).send('Internal server error');
  }
  });

  app.delete('/tasks/:taskId', async (req,res)=>{
    try{
      const {userEmail} = req.body;
      const taskId = req.params.taskId

      const user = await userModel.findOne({ email: userEmail });
      if (!user) {
        return res.status(404).send('User not found');
      }
      // Find the task by its ID
      const taskIndex = user.tasks.findIndex((task) => task.taskId === parseInt(taskId));
      if (taskIndex === -1) {
      return res.status(404).send('Task not found');
      }

      const deletedTask = user.tasks[taskIndex];
      user.tasks.splice(taskIndex, 1);
      // Save the updated user document
      await user.save();
      // Corrected response to not reference taskToUpdate
      return res.status(200).json({ message: 'Task deleted', task: deletedTask });
    }catch (error) {
      console.error('Error deleting task:', error);
      return res.status(500).send('Internal server error');
    }
  });


























app.listen(port,()=>{
console.log(`server is running on ${port}`);
})
