const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const AuthRoute = require('./Routes/auth')
const StoryRoute = require('./Routes/stories')

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI).then(()=>{
    console.log("Connected to the DB!!");
}).catch((err)=>{
    console.log("error connecting to the DB", err);
})

port = process.env.PORT || 4000;

app.get("/",(req,res)=>{
    res.json({message:"home route"});
})

app.get("/health", (req,res)=>{
    res.json({
        service: "Swiptory",
        status: "Active",
        time: new Date(),
    })
})

app.use("/api/v1/auth", AuthRoute);
app.use("/api/v1/story", StoryRoute);

app.listen(port,()=>{
    console.log(`App is connected to the port ${port}`)
})