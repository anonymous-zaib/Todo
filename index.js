const express = require('express');
const bodyParser = require("body-parser")
const userRoute = require("./routes/userRoutes")
const todoRoute = require("./routes/todoRoutes")
const app = express();

require("dotenv").config();
require("./db")
const PORT = 3000

app.use(bodyParser.json());
app.use('/users', userRoute);
app.use('/todos', todoRoute)

app.use(bodyParser.json());
app.get('/', (req, res)=> {
    res.json({
        message: "todo api is working"
    })
})


app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`)
})