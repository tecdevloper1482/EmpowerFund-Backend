const User = require('../models/users');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not configured');
    }

    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '1d',
    });
};

// Register a new user

exports.registerUser = async (req, res) => {
    try {

        const { fullname, email, password, role } = req.body;
        // Check if the user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // create a new user 

        const user = await User.create({
            fullname,
            email,
            password,
            role
        })
        if (user) {
            res.status(201).json({
                _id: user._id,
                fullname: user.fullname,
                email: user.email,
                role: user.role,
                token: generateToken(user._id)
            })
        }
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
}

// Login user and generate token

exports.loginUser = async (req, res) => {
    try{
        const {email , password, role} = req.body;
        // Check for user email
        const user = await User.findOne({ email }).select('+password'); // Find the user by email and include the password field in the result
        if (user && (await user.matchPassword(password))) { // If the user exists and the entered password matches the hashed password in the database
            if (role && role !== user.role) {
                return res.status(403).json({ message: `This account is registered as ${user.role}. Please select the correct role.` });
            }

            return res.json({
                _id: user._id,
                fullname: user.fullname,
                email: user.email,
                role: user.role,
                token: generateToken(user._id) // Generate a token for the user and include it in the response
            })
        }

        return res.status(401).json({ message: 'Invalid email or password' });

    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
}