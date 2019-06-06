const express = require('express');
const app = express();
const PORT = 80;
const io = require('socket.io')(9000);
const router = express.Router();

// You send it this:
// {
//     command: 'String',
//     payload: 'Anything - depends what the command is exspecting.'
// }
// It will send that command to all clients, relevant clients will Act
router.post('/broadcast', (req, res) => {
    const { command, payload } = req.body;
    console.log('BB Socket Command API - broadcast request received: ', command, payload);
    io.sockets.emit(command, payload);
    console.log('BB Socket Command API - broadcast received');
    return res.json({ success: true, data: data });
});

// Port
app.listen(PORT, () => {
    console.log(`BB Socket Command - listening on PORT: ${PORT}`);
});
