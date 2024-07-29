const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const http = require('http');
require('dotenv').config();
const authenticateAdminToken = require('./middleware/authenticateAdminToken'); // Import the middleware

const app = express();
app.use(express.json());
app.use(cors());

const userUri = process.env.MONGODB_URI;
const adminUri = process.env.MONGODB_URI;
const jwtSecret = process.env.JWT_SECRET;
const port = process.env.PORT || 5000;

// User Database Connection
const userConnection = mongoose.createConnection(userUri, {
    serverSelectionTimeoutMS: 30000, // 30 seconds
    socketTimeoutMS: 45000 // 45 seconds
});
userConnection.on('connected', () => console.log('MongoDB User Database Connected...'));
userConnection.on('error', (err) => console.error('MongoDB (user) connection error:', err));

// Admin Database Connection
const adminConnection = mongoose.createConnection(adminUri, {
    serverSelectionTimeoutMS: 30000, // 30 seconds
    socketTimeoutMS: 45000 // 45 seconds
});
adminConnection.on('connected', () => console.log('MongoDB Admin Database Connected...'));
adminConnection.on('error', (err) => console.error('MongoDB (admin) connection error:', err));

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    connectionId: { type: String, unique: true },
});

const adminSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

const User = userConnection.model('User', userSchema);
const Admin = adminConnection.model('Admin', adminSchema);



app.post('/api/users/login', async (req, res) => {
    const { username, password } = req.body;
    console.log('Received Login Request for:', username);

    try {
        const user = await User.findOne({ username });

        if (!user) {
            console.log('User not Found');
            return res.status(401).send('Invalid Credentials');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
            console.log(username,': Password Matched');
            try {
                const token = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: '1h' });
                console.log('Generated User Token :', token);
                res.json({ success: true, token });
            } catch (error) {
                console.error('Error Generating User Token:', error);
                res.status(500).send('Error generating token');
            }
        } else {
            console.log(username,": User Password Doesn't match");
            res.status(401).send('Invalid Credentials');
        }
    } catch (error) {
        console.error('Error During Login:', error);
        res.status(500).send('Server error');
    }
});

// app.post('/admin/login', async (req, res) => {
//     const { username, password } = req.body;

//     try {
//         const admin = await Admin.findOne({ username });

//         if (!admin) {
//             return res.status(401).send('Invalid Credentials');
//         }

//         const isMatch = await bcrypt.compare(password, admin.password);
//         if (isMatch) {
//             const token = jwt.sign({ id: admin._id }, jwtSecret, { expiresIn: '1h' });
//             res.json({ success: true, token });
//         } else {
//             res.status(401).send('Invalid Credentials');
//         }
//     } catch (error) {
//         res.status(500).send('Server error');
//     }
// });

// Import admin routes
const adminRoutes = require('./routes/admin');
app.use('/admin', adminRoutes(Admin, jwtSecret));

app.get('/api/getConnectionId', async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, jwtSecret);
        const userId = decoded.id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send('User not found');
        }

        const connectionId = user.connectionId;
        res.json({ connectionId });
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            res.status(401).send('Token Expired. Please Login Again.');
        } else {
            res.status(500).send('Error fetching connectionId');
        }
    }
});

app.post('/addUser', authenticateAdminToken, async (req, res) => {
    const { username, password } = req.body;
    try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        let uniqueConnectionId;
        let connectionIdExists = true;

        while (connectionIdExists) {
            uniqueConnectionId = generateConnectionId(8);
            const existingUser = await User.findOne({ connectionId: uniqueConnectionId });
            if (!existingUser) {
                connectionIdExists = false;
            }
        }

        const newUser = new User({
            username,
            password: hashedPassword,
            connectionId: uniqueConnectionId
        });

        await newUser.save();
        res.status(201).json({ message: 'User Added Successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error adding user' });
    }
});
app.delete('/deleteUser/:id', authenticateAdminToken, async (req, res) => {
    // Delete user logic
    try {
        await User.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'User Removed Successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting user' });
    }
});

app.get('/getUsers', authenticateAdminToken, async (req, res) => {
    // Get users logic
    try {
        const users = await User.find({});
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching users' });
    }
});

function generateConnectionId(length = 8) {
    const minLength = 10;
    const finalLength = Math.max(length, minLength);
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let connectionId = '';
    for (let i = 0; i < finalLength; i++) {
        connectionId += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return connectionId;
}

const server = http.createServer(app);
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
