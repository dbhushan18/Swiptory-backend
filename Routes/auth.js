const user = require("../Models/user");
const express = require("express");
const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt");
const router = express.Router();

router.post("/register", async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.json({ error: "Please fill in all fields properly" });
        }

        const isExistingUser = await user.findOne({ username: username })
        if (isExistingUser) {
            return res.json({ error: "User already exists" })
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const userData = new user({
            username,
            password: hashedPassword,
        })

        const userResponse = await userData.save();

        const token = await jwt.sign(
            { userId: userResponse._id },
            process.env.JWT_SECRET)

        return res.status(200).json(
            { message: "user Registered successfully", success: true, token: token, username: username, id: userResponse._id });

    }
    catch (err) {
        console.log("Something went wrong", err);
    }
})

router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.json({ error : "Please fill in all fields properly" });
        }

        const userDetails = await user.findOne({ username })
        if (!userDetails) {
            return res.json({ error: "User doesn't exist" });
        }

        const passwordMatch = await bcrypt.compare(
            password,
            userDetails.password
        )

        if (!passwordMatch) {
            return res.json({ error: "Invalid credentials" });
        }

        const token = await jwt.sign(
            { userId: userDetails._id },
            process.env.JWT_SECRET
        )
        return res.status(200).json(
            { message: "User logged in successfully", success: true, token: token, username: username,  id: userDetails._id});
    }
    catch (err) {
        res.status(401).json({message: "something went wrong"});
        console.log(err);
    }

})

module.exports = router;
