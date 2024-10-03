import express from 'express'
import cors from 'cors'
import { Server } from 'socket.io'
import http from 'http';
import { Chat } from './mongoose.schema.js';
import { mongooseConnect } from './mongoose.config.js';

const app = express();
const server = http.createServer(app);

// 2. Create socket server with CORS settings
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    }
});

let onlineUsers = []; // List of online users

// 3. Handle socket connection
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // When a user is created
    socket.on('createUser', (data) => {
        socket.userName = data.userName;
        socket.avatar = data.avatar;

        // Add the user to the onlineUsers list
        onlineUsers.push({ userName: socket.userName, avatar: socket.avatar });

        // Load old messages from the database and send to the user
        Chat.find().sort({ timestamp: 1 }).limit(50)
            .then(messages => {
                socket.emit('load_messages', messages);
                  // Send welcome message to the user
         socket.emit('welcomeMessage', { userName: socket.userName, avatar: socket.avatar, message: "Welcome" });
        
         // Broadcast to others that a user has joined
         socket.broadcast.emit('welcomeMessage', { userName: socket.userName, avatar: socket.avatar, message: "has joined the chat" });
 
            })
            .catch(err => console.log(err));

       

        // Broadcast the updated list of online users
        io.emit('onlineStatus', onlineUsers);
    });

    // When a message is sent
    socket.on('message', (message) => {
        const userMessage = {
            userName: socket.userName,
            message: message,
            avatar: socket.avatar,
            timestamp: new Date()
        };

        // Save the message to the database
        const newChat = new Chat(userMessage);
        newChat.save()
            .then(() => {
                // Broadcast the message to other clients
                socket.broadcast.emit('broadcastMessage', userMessage);
            })
            .catch(err => console.log(err));
    });

    // Handle user disconnection
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);

        // Remove the user from the online users list
        onlineUsers = onlineUsers.filter(user => user.userName !== socket.userName);
        
        // Notify all clients of the updated list of online users
        io.emit('onlineStatus', onlineUsers);

        
    });
});

// Start the server
server.listen(3200, () => {
    mongooseConnect();
    console.log('Server is running on port 3200');
});
