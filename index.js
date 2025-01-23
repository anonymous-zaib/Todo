const express = require('express');
const bodyParser = require("body-parser")
const userRoute = require("./routes/userRoutes")
const todoRoute = require("./routes/todoRoutes")
const app = express();
const cors = require('cors')

require("dotenv").config();
require("./db")
const PORT = 3000

app.use(express.json());
app.use(cors({
    origin: ["http://localhost:5173"]  
}))
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