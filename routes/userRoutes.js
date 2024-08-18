const express = require("express")
const User = require("../models/User");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const auth = require("../middlewares/auth")

const router = express.Router();

router.get('/', (req, res) => {
    res.send("user routes are working")
})

// user registration
router.post('/register', async (req, res) => {

    try {
        const { name, email, password } = req.body;
        const user = new User({ name, email, password });
        await user.save();
        res.status(201).send({ user, message: "user created successfully", status: true });
    }
    catch (err) {
        res.status(400).send({ error: err, status: false })
    }
});

// user login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            throw new Error('unable to login, user not found');
        }
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            throw new Error('unable to login, invalid credentials')
        }

        const token = jwt.sign({
            _id: user._id.toString()
        }, process.env.JWT_SECRET_KEY);
        res.send({ user, token, message: "Logged in successfully", status: true });
    }
    catch (err) {
        res.status(400).send({ error: err, status: false });
    }
});

// profile route
router.get('/profile', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('name email');
        res.send({ user, status: true });
    } catch (err) {
        res.status(500).send({ error: 'Server error', status: false });
    }
});

// Update profile
router.put('/profile', auth, async (req, res) => {
    try {
        const { name, email } = req.body;

        // Find the user by ID and update the profile fields
        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            { name, email },
            { new: true, runValidators: true } // Return the updated document and run validators
        ).select('name email'); // Select only the fields you want to return

        if (!updatedUser) {
            return res.status(404).send({ error: 'User not found' });
        }

        res.send({ updatedUser, message: "Profile Update successfuly", status: true });
    } catch (err) {
        res.status(500).send({ error: 'Server error', status: false });
    }
});

// logout route
router.post('/logout', auth, (req, res) => {
    try {
        res.clearCookie('token');
        res.send({ message: 'Logged out successfully', status: true });
    } catch (err) {
        res.status(500).send({ error: 'Server error', status: false });
    }
});

module.exports = router;