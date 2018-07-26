var io = require('socket.io').listen(52723);
io.on("connection", function (socket) {
    console.log("A user connected");

    socket.on("sMsg", function (data) {
        console.log(data);
        io.sockets.emit("rMsg", data);
    });
});