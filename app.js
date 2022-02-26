import express from 'express';
import { Server } from 'socket.io';
import { createServer } from 'http';

const app = express();
const httpServer = createServer(app);

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