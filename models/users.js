const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: [true, 'Full name is required'],

    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        match: [/\S+@\S+\.\S+/, 'Please use a valid email address'],
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long'],
        select: false,

    },
    role: {
        type: String,
        enum: ['Creator', 'Investor'],
        required: [true, 'Role is required'],
        default: 'Investor',
    },
    verificationLink: String,
    profileImage: String,
    bio: String,
    createdAt: {
        type: Date,
        default: Date.now,
    },

})

// Hash the password before saving the user

userSchema.pre('save', async function (next) {
    try {
        if (!this.isModified('password')) {    // If the password field is not modified, skip hashing and move to the next middleware
            return next();
        }
        const salt = await bcrypt.genSalt(10); // Generate a salt with 10 rounds 
        this.password = await bcrypt.hash(this.password, salt); // Hash the password using the generated salt
        return next();
    } catch (error) {
        return next(error);
    }
})

// Method to compare entered password with the hashed password in the database
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password); // Compare the entered password with the hashed password and return true if they match, otherwise false
}

module.exports = mongoose.model('User', userSchema)