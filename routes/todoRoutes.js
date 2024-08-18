const express = require("express")
const router = express.Router();
const auth = require('../middlewares/auth')
const Todo = require('../models/Todos') 

router.get('/test', (req, res) =>{
    res.send("todo routes are working")
})

// create a task
router.post('/add', auth, async (req, res)=>{
try {
    const task = new Todo({
        ...req.body,
        owner: req.user._id
    });
    await task.save();
    res.status(201).json({ task, message: "Task Created successfully", status: true})
}
 catch (err) {
    res.status(400).send({error: err})
}
})

// get user tasks
router.get('/get', auth, async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    
    try {
        const tasks = await Todo.find({ owner: req.user._id })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();
        
        const count = await Todo.countDocuments({ owner: req.user._id });

        res.status(200).json({
            tasks,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            count
        });
    } catch (err) {
        res.status(500).send({ error: err });
    }
});

// get task by id
router.get('/gettodobyid/:id', auth, async (req, res)=>{
    try {
        const taskid = req.params.id;
        const task = await Todo.findOne({
            _id: taskid,
            owner: req.user._id
        });
        if(!task){
            return res.status(404).json({ message: "task not found"})
        }
        res.status(200).json({ task, message: "task fetch successfully", status: true})
    } 
    catch (err) {
        res.status(500).send({ error: err})
        
    }
})

// update a task
router.patch('/update/:id', auth, async (req, res)=>{
    try {
        const taskid = req.params.id;
        const update = Object.keys(req.body);
        const allowedUpdate = [ 'description', 'complete'];
        const isValidOperation = update.every(update => allowedUpdate.includes(update));

        if(!isValidOperation){
            return res.status(400).json({error: "invalid update"});
        }


        const task = await Todo.findOne({
            _id: taskid,
            owner: req.user._id
        });
        if(!task){
            return res.status(404).json({ message: "task not found"})
        }
        update.forEach(update => task[update] = req.body[update]);
        await task.save();
        
        res.json({
            message: "Task Updated successfully",
            status: true
        })
    } 
    catch (err) {
        res.status(500).send({ error: err})
        
    }
})

// delete a task
router.delete('/delete/:id', auth, async (req, res)=>{
    try {
        const taskid = req.params.id;
        const task = await Todo.findOneAndDelete({
            _id: taskid,
            owner: req.user._id
        });
        if(!task){
            return res.status(404).json({ message: "task not found"})
        }
        res.status(200).json({ message: "task deleted successfully", status: true})
    } 
    catch (err) {
        res.status(500).send({ error: err})
        
    }
})

// Get all completed tasks
router.get('/completed', auth, async (req, res) => {
    try {
        const tasks = await Todo.find({
            owner: req.user._id,
            complete: true
        });
        res.status(200).json({tasks, count: tasks.length, message: "Completed tasks fetched successfully", status: true});
    } catch (err) {
        res.status(500).send({error: err});
    }
});

// Get all incomplete tasks
router.get('/incomplete', auth, async (req, res) => {
    try {
        const tasks = await Todo.find({
            owner: req.user._id,
            complete: false
        });
        res.status(200).json({tasks, count: tasks.length, message: "Incomplete tasks fetched successfully", status: true});
    } catch (err) {
        res.status(500).send({error: err});
    }
});


// Filter tasks by date range
router.get('/filter', auth, async (req, res) => {
    const { startDate, endDate } = req.query;
    try {
        const tasks = await Todo.find({
            owner: req.user._id,
            createdAt: { 
                $gte: new Date(startDate), 
                $lte: new Date(endDate) 
            }
        });
        res.status(200).json({tasks, count: tasks.length, message: "Tasks filtered by date fetched successfully", status: true});
    } catch (err) {
        res.status(500).send({error: err.message});
    }
});

// Search tasks by keywords
router.get('/search', auth, async (req, res) => {
    const { keywords } = req.query;
    try {
        const tasks = await Todo.find({
            owner: req.user._id,
            $or: [
                { description: { $regex: keywords, $options: 'i' } }
            ]
        });
        res.status(200).json({tasks, count: tasks.length, message: "Tasks search results fetched successfully", status: true});
    } catch (err) {
        res.status(500).send({error: err.message});
    }
});

module.exports = router;