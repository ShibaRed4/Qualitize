const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const { User } = require('../lib/db');  // Assuming the User model is in 'db'

const router = express.Router();

router.post('/', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Find the user by username
        const user = await User.findOne({ where: { username } });

        if (!user) {
            // If no user is found, return an error
            return res.status(404).json({ message: 'User not found' });
        }

        // Compare the entered password with the stored hashed password
        const isPasswordValid = await bcrypt.compare(password, user.password);



        if (isPasswordValid) {
            // If password matches, send success response

            const token = jwt.sign(
                { id: user.id, username: user.username }, // Payload
                process.env.TOKEN_KEY, // Secret key
                { expiresIn: '1h' } // Token expiration
            );

            return res.status(200).json({ message: 'Login successful', token: token });
        } else {
            // If password does not match, send an error response
            return res.status(401).json({ message: 'Invalid password' });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
