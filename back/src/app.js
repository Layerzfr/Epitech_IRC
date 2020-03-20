class Parser {

    constructor() {
        this.fileParsed = null;
        this.fileName = null;
    }

    doParse(filename) {

        var fileJson = fs.readFile('./' + filename, 'utf8', (err, jsonString) => {
            this.fileParsed = jsonString;
            this.fileName = filename;
            if (err) {
                console.log("File read failed:", err)
                return
            }
        })
    }

    async addToFile(data = null, filename = null)
    {
        if(filename == null)
        {
            this.fileName = "new_file-"+Date.now()+".json";
        } else {
            this.fileName = filename;
        }

        if(data === null)
        {
            data = {};
        }




        let datae = JSON.stringify(data, null, 2);

        await this.doParse(filename);

        if(this.fileParsed !== null)
        {

            let test = this.fileParsed;
            datae = datae.concat(test);
        }
        this.fileParsed = datae;


        fs.writeFile(this.fileName, datae, (err) => {
            if (err) throw err;
            console.log('Data written to file');
        });
    }
}



const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const fs = require('fs');

const documents = {}; //channel bdd

var curChannel = 'general';
var people = {};
var channelList = {};
let parse = new Parser();


io.on("connection", socket => {
    let previousId;

    console.log('a user connected');
    // io.emit('new-message', 'user connected');

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
        console.log(doc);
        socket.room = doc['new'];
        documents[doc['new']] = documents[doc['previous']];
        documents[doc['new']].id = doc['new'];
        delete(documents[doc['previous']]);
        io.emit("documents", Object.keys(documents));
        console.log(documents);
    });

    socket.on('disconnect', function(){
        console.log('user disconnected');
        // io.emit('new-message', 'user disconected');
    });

    io.emit("documents", Object.keys(documents));

    socket.on('new-message', (message) => {
        console.log(message);
        io.to(message.id).emit('new-message', message.message);


        parse.doParse("data.json");
        var today = new Date();
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = today.getFullYear();
        var h = today.getHours()

        today = mm + '/' + dd + '/' + yyyy + ' ' + h;
        var data = {};
        data[message.id] = {
                date: today,
                channel: message.id,
                message: message.message,
                by: message.username
        };

        console.log(parse.fileParsed);

        fs.appendFileSync('data.json', JSON.stringify(data, null, 2));
        // parse.addToFile({
        //     date: today,
        //     channel: message.id,
        //     message: message.message,
        //     by: message.username
        // }, "data.json");


    });
});


http.listen(4444);