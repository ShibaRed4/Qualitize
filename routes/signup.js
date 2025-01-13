const express = require('express');
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs');
const crypto = require('node:crypto')
const { User } = require('../lib/db');  // Assuming the User model is in 'db'

const router = express.Router();

router.post('/', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Check if the username already exists
        const existingUser = await User.findOne({ where: { username } });

        if (existingUser) {
            // If user exists, return an error
            return res.status(400).json({ message: 'Username already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);  // 10 is the salt rounds

        // Create the new user with the hashed password
        
        const newUser = await User.create({
            username: username,
            password: hashedPassword,
            user_data: [0]
        }).catch((err) => {
            console.log(err)
        })

        const token = jwt.sign({ id: newUser.id, username: newUser.username }, process.env.TOKEN_KEY, { expiresIn: '1h' });

        // Return success message
        return res.status(200).json({ message: 'User registered successfully', token: token });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
