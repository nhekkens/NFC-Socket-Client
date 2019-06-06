'use strict';

const session = require('express-session');
const dbConnection = require('./database');
const MongoStore = require('connect-mongo')(session);
const { NFC } = require('nfc-pcsc');
const nfc = new NFC(); // optionally you can pass logger
const express = require('express');
const app = express();
const cardUser = require('./database/models/cardUser');
const actions = require('./actions');
const PORT = 8080;
const io = require('socket.io')(1337);
const huejay = require('huejay');
const WebSocket = require('ws');

// Server ******************************************************************************************
// Sessions
app.use(
    session({
        secret: 'i-like-turtles-forever',
        store: new MongoStore({ mongooseConnection: dbConnection }),
        resave: false,
        saveUninitialized: false
    })
);

// Serve register
app.get('/register', function(req, res, next) {
    res.sendFile(__dirname + '/static/register.html');
});

// Serve the output
app.get('/output', function(req, res, next) {
    res.sendFile(__dirname + '/static/output.html');
});

// Port
app.listen(PORT, () => {
    console.log(`NFC - listening on PORT: ${PORT}`);
});

// Sockets ******************************************************************************************
io.on('connection', function(socket) {
    socket.emit('Welcome to NFC', function(data) {});

    // DELETE USER
    socket.on('Server_delete_cardUser', function(id) {
        // my msg
        console.log('NFC - Server_delete_cardUser: ' + id);

        cardUser.findOneAndDelete({ id: id }, err => {
            if (err) {
                socket.emit('Client_delete_cardUser_error', err);
            } else {
                socket.emit('Client_delete_cardUser_success');
            }
        });
    });

    // REGISTER USER
    socket.on('Server_register_cardUser', function(data) {
        console.log('NFC - Server_register_cardUser: ' + data);
        actions.saveCardUser(
            {
                id: data.id,
                name: data.name,
                country: data.country,
                company: data.company,
                title: data.title,
                email: data.email,
                companyNumber: data.companyNumber,
                companyAddress: data.companyAddress,
                companyColor1: data.companyColor1,
                companyColor2: data.companyColor2,
                companyColor3: data.companyColor3
            },
            io
        );
    });
});

// NFC ******************************************************************************************
nfc.on('reader', reader => {
    // All NFC interactions
    console.log(`NFC - ${reader.reader.name}  device attached`);

    reader.aid = 'F222222222';

    reader.on('card', card => {
        console.log('NFC - card Present: ' + card.uid);

        cardUser.find({ id: card.uid }, function(err, data) {
            // cardUser.findOne({ id: card.uid }, function(err, data) {
            if (!err) {
                console.log(data.length > 0);
                if (data.length > 0) {
                    console.log('NFC - User found ', data);
                    // let tempColor;
                    // if (data[0].company === 'bp') {
                    //     tempColor = 24255;
                    // } else if (data[0].company === 'shell') {
                    //     tempColor = 10509;
                    // } else {
                    //     tempColor = 42043;
                    // }
                    actions.hueChangeLightColor(hueClient, 1, data[0].companyColor1);
                    io.sockets.emit('Slave_login', data[0]);
                } else {
                    console.log('No User');
                    io.sockets.emit('Client_register_readyToRegister', card.uid);
                }
            } else {
                console.log('NFC - ERROR: ', err);
            }
        });
    });

    reader.on('card.off', card => {
        console.log('NFC - card Detacted - ID: ' + card.uid);
        io.sockets.emit('Slave_logout', card.uid);
    });

    reader.on('error', err => {
        console.log(`NFC - card Error: `, err);
    });

    reader.on('end', () => {
        console.log(`NFC - card Removed`);
    });

    nfc.on('error', err => {
        console.log('NFC - An error occurred', err);
    });
});

// parentSocket ******************************************************************************************
const url = 'wss://w5andww5o4.execute-api.eu-west-1.amazonaws.com/prod';
const parentSocket = new WebSocket(url);

// set up socket handlers
parentSocket.on('open', () => console.log('parentSocket - connected socket'));
parentSocket.on('message', data => {
    console.log(`From server onMessage: ${data}`);
});
parentSocket.on('close', () => {
    console.log('parentSocket - disconnected');
    process.exit();
});

// Hue ******************************************************************************************
let hueConnecitonInfo = {
    // ip: '192.168.1.152', // nicolay home ip
    ip: '10.159.8.7',
    port: 80,
    username: 'Kc4m3pRbf5-CRqU3WiowD9GMSp6CpKnplFWMMLVB'
};

let hueClient = new huejay.Client({
    host: hueConnecitonInfo.ip,
    port: hueConnecitonInfo.port, // Optional
    username: hueConnecitonInfo.username, // Optional
    timeout: 15000 // Optional, timeout in milliseconds (15000 is the default)
});

// actions.hueFindDevices(huejay);
// actions.hueFindDevices(hueClient);
// actions.hueTestConnection(hueClient);
// actions.hueGetLightInfo(hueClient);
// actions.hueCreateUser(hueClient);

let colorHue = {
    bb: 42043,
    bp: 24255
};

// actions.hueChangeLightColor(hueClient, 1, colorHue.bb);
