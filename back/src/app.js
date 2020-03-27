const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const fs = require('fs');

const documents = {}; //channel bdd

var curChannel = 'general';
var people = {};
var channelList = {};

var done = false;

var colors = {}

function generateHex(channel) {
    let hex = '#';
    if (!colors[channel]) {
        let length = 6;
        let chars = '0123456789ABCDEF';
        while (length--) {
            hex += chars[(Math.random() * 16) | 0];
        }
        colors[channel] = hex;
    }
    return colors[channel];
}

io.on("connection", socket => {
    let previousId;

    const safeJoin = currentId => {
        socket.leave(previousId);
        socket.join(currentId);
        previousId = currentId;
    };

    console.log('a user connected');
    documents["general"] = {
        id: 'general',
        doc: '',
        color: "#818181"
    };

    safeJoin("general");
    io.emit("documents", Object.values(documents));
    socket.emit("document", documents["general"]);


    io.emit("documents", Object.values(documents));
    previousId = "general";
    socket.emit("document", {
        id: "general",
        doc: '',
        color: "#818181"
    });

    socket.on("new-user", username => {
        var parsed = fs.readFile('./data.json', 'utf8', (err, jsonString) => {
            parsed = JSON.parse(JSON.stringify(jsonString));
            parsed = parsed.replace(/}{/g, ",\n");
            parsed = JSON.parse(parsed);
            for( let prop in parsed ){
                if(prop !== "general")
                {
                    continue;
                }
                for (let message in parsed[prop]) {
                    io.to(socket.id).emit('new-message', '[' + prop + '] ' + parsed[prop][message].date + ' ' + parsed[prop][message].message);
                }
            }
            people[socket.id] = username;
            io.to("general").emit('new-message', '[general] ' + username + ' vient de rejoindre le salon');
            if (err) {
                console.log("File read failed:", err)
                return
            }
        });
    })




    socket.on("getDoc", docId => {
        safeJoin(docId);
        socket.emit("document", documents[docId]);
    });

    socket.on("join", data => {
        socket.join(data.id);
        io.to(data.id).emit("new-message", "["+data.id+"] "+ data.user + " vient de rejoindre le salon");
    });

    socket.on("leave", data => {
        socket.leave(data.id);
        var parsed = fs.readFile('./data.json', 'utf8', (err, jsonString) => {
            parsed = JSON.parse(JSON.stringify(jsonString));
            parsed = parsed.replace(/}{/g, ",\n");
            parsed = JSON.parse(parsed);
            var color = parsed[data.id]['data']['color'];
            io.to(data.id).emit("new-message", "<p style='color: "+color+"'>["+data.id+"] </p>"+ data.user + " vient de quitter le salon");
            people[socket.id] = data.user;
            io.to("general").emit('new-message', '[general] ' + data.user + ' vient de rejoindre le salon');
            if (err) {
                console.log("File read failed:", err)
                return
            }
        });
        io.to(data.id).emit("new-message", "<p style='color: '>["+data.id+"] </p>"+ data.user + " vient de quitter le salon");
        io.to(socket.id).emit("new-message", "Vous avez quitté le salon " + data.id);
    });

    socket.on("addDoc", doc => {
        doc.color = generateHex(doc.id);
        documents[doc.id] = doc;
        // safeJoin(doc.id);
        io.emit("documents", Object.values(documents));
        console.log(documents);

        // socket.emit("document", doc);

        var parsed = fs.readFile('./data.json', 'utf8', (err, jsonString) => {
            parsed = JSON.parse(JSON.stringify(jsonString));
            parsed = parsed.replace(/}{/g, ",\n");
            parsed = JSON.parse(parsed);

            parsed[doc.id] = {
                "data": {
                    "color" : doc.color,
                    "creator": people[socket.id],
                }
            };


            fs.writeFile('data.json', JSON.stringify(parsed, null, 2), (err) => {
                if (err) throw err;
                console.log('Data written to file');
            });

            // fs.appendFileSync('data.json', JSON.stringify(parsed, null, 2));
            if (err) {
                console.log("File read failed:", err)
                return
            }
        });
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
        console.log(doc);
        socket.room = doc['new'];
        documents[doc['new']] = documents[doc['previous']];
        documents[doc['new']].id = doc['new'];
        delete(documents[doc['previous']]);
        io.emit("documents", Object.values(documents));
        console.log(documents);
    });

    socket.on('disconnect', function(){
        console.log('user disconnected');

        if(people[socket.id] !== undefined) {
            io.to("general").emit('new-message', "[general] " +people[socket.id] + " vient de quitter le salon");
        }
    });

    io.emit("documents", Object.values(documents));

    socket.on('new-message', (message) => {
        console.log(message);
        var today = new Date();
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = today.getFullYear();
        var h = today.getHours();
        var m = today.getMinutes()

        var command = message.message.split(" ")[0];
        console.log(command.substring(1));
        if(message.message[0] === "/" && !documents[command.substring(1)]) {
            io.to(socket.id).emit('new-message', "Commande ou salon introuvable");
            return;
        }
        if(documents[command.substring(1)]) {
            message.id = command.substring(1);
            message.message = message.message.replace(command, '');
            if(!io.sockets.adapter.rooms[message.id]) {
                io.to(socket.id).emit('new-message', "Vous n'appartenez pas à ce channel.")
                return;
            }
            var roster = io.sockets.adapter.rooms[message.id].sockets;
            console.log(roster);
            var isInRoom = false;
            if(!roster[socket.id]) {
                io.to(socket.id).emit('new-message', "Vous n'appartenez pas à ce channel.")
                return;
            }
        }

        today = dd + '/' + mm + '/' + yyyy + ' ' + h + 'h' + m;
        if(message.id === undefined)
        {
            message.id = "general";
        }
        io.to(message.id).emit('new-message', '[' + message.id + '] ' +  today + ': ' + people[socket.id] + ': ' + message.message);

        var parsed = fs.readFile('./data.json', 'utf8', (err, jsonString) => {
            parsed = JSON.parse(JSON.stringify(jsonString));
            // console.log(parsed);
            parsed = parsed.replace(/}{/g, ",\n");
            parsed = JSON.parse(parsed);


            if(parsed[message.id]) {
                parsed[message.id][Object.keys(parsed[message.id]).length + 1] = {
                    date: today,
                    channel: message.id,
                    message: message.message,
                    by: message.username
                };
            } else {
                parsed[message.id] = {
                    1: {
                        date: today,
                        channel: message.id,
                        message: message.message,
                        by: message.username
                    }
                }
            }


            fs.writeFile('data.json', JSON.stringify(parsed, null, 2), (err) => {
                if (err) throw err;
                // console.log('Data written to file');
            });

            // fs.appendFileSync('data.json', JSON.stringify(parsed, null, 2));
            if (err) {
                console.log("File read failed:", err)
                return
            }
        });

    });
});


http.listen(4444);