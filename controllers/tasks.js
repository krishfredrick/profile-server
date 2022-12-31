
const createTask = (req,res)=>{
    res.send('creating the task')
}

const getTask = (req,res)=>{
    res.send('Getting the task')
}

const updateTask = (req, res)=>{
    res.send('update Task')
}

const deleteTask = (req,res)=>{
    res.send('delete task')
}


module.exports ={
    getTask,
    createTask,
    updateTask,
    deleteTask
}