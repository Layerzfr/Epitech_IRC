const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const documents = {}; //channel bdd

var curChannel = 'general';
var people = {};
var channelList = {};

io.on("connection", socket => {
    let previousId;

    console.log('a user connected');
    io.emit('chat message', 'user conected');

    const safeJoin = currentId => {
        socket.leave(previousId);
        socket.join(currentId);
        previousId = currentId;
    };

    socket.on("getDoc", docId => {
        safeJoin(docId);
        socket.emit("document", documents[docId]);
    });

    socket.on("addDoc", doc => {
        documents[doc.id] = doc;
        safeJoin(doc.id);
        io.emit("documents", Object.keys(documents));
        socket.emit("document", doc);
    });

    socket.on('delete room', function(channel){
        io.of('/').in(channel).clients(function(error, clients) {
            if (clients.length > 0) {
                clients.forEach(function (socket_id) {
                    io.sockets.sockets[socket_id].leave(channel);
                    io.sockets.sockets[socket_id].emit('leave',channel);
                });
                var msg = {content: "L'admin a supprimé le channel "+ channel, channel:'general'}
                socket.broadcast.emit('chat message',msg);
            }
        });
    });

    socket.on('message privé', function(MP){
        io.to(people[MP.content[1]]).emit('message privé', MP);
        io.to(people[MP.by]).emit('message privé', MP);
    });

    socket.on('change name room', function(room){
        var msg = {content : "L'admin a changé le nom du channel "+ room.actualroom +" en: " + room.nextroom, channel: room}
        socket.room = room.nextroom;
        socket.to(room.nextroom).emit('chat message', msg);
        socket.emit('change', room);
    });


    socket.on('users list', function(content){
        var msg = {content: "Liste des utilisateurs: "+ Object.keys(people), channel: content.channel};
        io.to(people[content.pseudo]).emit('chat message', msg);
    });

    socket.on('channel list', function(content){
        var room_list = {};
        var rooms = io.sockets.adapter.rooms;

        for (var room in rooms){
            if (!rooms[room].hasOwnProperty(room)) {
                //console.log(rooms[room]);
                room_list[room] = Object.keys(rooms[room]).length;
            }
        }
        console.log(Object.keys(room_list));
        var msg = {content: "Liste des channels: " + Object.keys(room_list), channel: content.channel};
        io.to(people[content.pseudo]).emit('chat message', msg);

    });

    socket.on("editDoc", doc => {
        documents[doc.id] = doc;
        socket.to(doc.id).emit("document", doc);
    });

    socket.on('disconnect', function(){
        console.log('user disconnected');
        io.emit('chat message', 'user disconected');
    });

    io.emit("documents", Object.keys(documents));
});

http.listen(4444);