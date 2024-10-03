import express from 'express'
import cors from 'cors'
import { Server } from 'socket.io'
import http from 'http';


const app=express();


//1. Create server using HttP
const server=http.createServer(app);


//2. Create socket server.
const io=new Server(server,
   { cors:{
        origin:'*',
        methods:['GET','POST'],
    }
})

io.on('connection',(socket)=>{
    console.log('Client connected');
    socket.on('createUser',(data)=>{
        console.log(data);
        socket.userName=data.userName;
        socket.avatar=data.avatar
        io.emit('onlineStatus',socket.userName);
    })
    socket.on('message',(message)=>{
        let userMessage={
            userName:socket.userName,
            message:message,
            avatar:socket.avatar
        }
        console.log(userMessage);
        //Broadcast message to all connected clients
        socket.broadcast.emit('broadcastMessage',userMessage);
    })
    socket.on('disconnect',()=>{
        socket.broadcast.emit('offline',socket.userName);
        console.log('Client disconnected');
    })
})


server.listen(3200,()=>{
    console.log('Server is running on port 3200')
})