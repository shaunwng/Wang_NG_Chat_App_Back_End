import express from 'express';
import { Server } from 'socket.io';
import { createServer } from 'http';


const app = express();
const httpServer = createServer(app);

const members = [];
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

const LOGIN = 'login';
const LOGIN_SUCCESS = 'loginsuccess';
const LOGIN_FAILED = 'loginfailed'
const MEMBERS = 'members';
const MESSAGES = 'messages';
const JOIN = 'join';
const LEAVE = 'leave';
const DISCONNECT = 'disconnect';
const TYPING = 'typing';
const END_TYPING = 'endtyping';

io.on('connection', (socket) => {
    console.log('a user conneted!');

    socket.on(LOGIN, (data) => {

        //check if the username exist or not, if already exist, tell the user.
        if (members.findIndex((m) => m.username === data.username) > -1) {
            return socket.emit(LOGIN_FAILED, { msg: "Username already exist!! Try different One" })
        }

        let user = {...data, id: socket.id }
        socket.emit(LOGIN_SUCCESS, user)

        //when user log in successfully, notice welcome words.
        members.push(user);
        io.emit(JOIN, { msg: 'Welcome ' + data.username + ' joined this room!!' });
        //tell all users someone join in the room, broadcasting events :io.emit
        io.emit(MEMBERS, members);

        socket.username = data.username
    })

    // disconnect function
    socket.on(DISCONNECT, () => {
        let idx = members.findIndex(e => e.username === socket.username)
        if (idx === -1) {
            return;
        }
        members.splice(idx, 1)
        io.emit(LEAVE, { msg: socket.username + ' left the room!!' })
        io.emit(MEMBERS, members)
    })

    socket.on(MESSAGES, function(data) {
        console.log('SEND_MESSAGE event!', data);

        io.emit(MESSAGES, data);
    })

    //mention users when someone is typing
    socket.on(TYPING, (data => {
        io.emit(TYPING, { id: socket.id });
    }))

    socket.on(END_TYPING, (data => {
        io.emit(END_TYPING, { id: socket.id });
    }))
});