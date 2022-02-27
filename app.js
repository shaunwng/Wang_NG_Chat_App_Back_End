import express from 'express';
import { Server } from 'socket.io';
import { createServer } from 'http';


const app = express();
const httpServer = createServer(app);

// app.get('/', (req, res) => {
//         console.log('you connected');
//         res.send('you connected');
//     })


// use the Server library to set up our chat infrastructure
//CORS is Cross Origin Restrictions -> security policy to avoid script attacks, etc
// our CORS policy is allowing connections from ANYWHERE (not good) and allowing the GET and Post methods.
//this opens a door to our server/ chat app and lets users do things like save their info, track who's connected, etc
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }

});


//use a dynamically generated port, or if one doesn't exist use port 3000
const port = process.env.PORT || 3000;

//tell the server to listen for incoling connections
httpServer.listen(port, () => {
    console.log(`chat server up and running on ${port}`);
})

//the socket.io stuff will go here - manage incoming connections, sending notifications, managing users, and managing chat messages
//io is the connection manager  switchboard operator -  it has access to ALL connections
//to the chat server and can manage them, broadcast events to eveyone, assign IDs etc.

// sockets is the individual connection to that server - when you join the chat, you're the socket
//You can emit an event on the client side that gets caught on the server side
// - a message, a typing event, a connection/ disconnection etc. io manages
//all og those events and can broadcast them to everyone connected to the server.

io.on('connection', (socket) => {
    console.log('a user conneted!');

    socket.emit("CONNECTED", socket.id);

    socket.on('SEND_MESSAGE', function(data) {
        console.log('SEND_MESSAGE event!', data);

        io.emit('MESSAGE', data);
    })

    socket.on('USER_TYPING', (data => {
        io.emit('SOMEONE_TYPING', data);
    }))
});