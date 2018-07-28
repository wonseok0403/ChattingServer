var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
var http = require('http');
var io = require('socket.io');
var server = http.createServer(function (req, res){
    // http create for client accessing
});
//server.listen(52724);               // server has to listen port number 52724 (52723 is for app which is chatting with others)
server.listen(52724);
var sock = io.listen(server);       // 'socket' has parameter named 'socket'. so I changed it to sock
var Users = [];                     // cleints
var config = {                      // config for accessing Azure SQL.
    userName: 'jws786',
    password: 'Wonseok786!',
    server: 'wonseoksample.database.windows.net',
    port:1433,
    options: {
        database: 'mySampleDatabase',
        encrypt: true
    }
}
console.log("OK LET's getit");
var vector = [0, 0, 0, ""];

 /*   var connection = new Connection(config);
    connection.on("connect", function (err) {
        if (err) {
            console.debug(err);
        }
        else {
            console.log("DB done!");
            requestX = new Request("SELECT STARTX, STARTY, STARTZ from dbo.GameStatus WHERE EMAIL='" + "wonseok786@khu.ac.kr" + "'", function (err, rowCount, rows) {
                if (err) {
                    console.log(err);
                }
            });
            requestX.on('row', function (columns) {
                columns.forEach(function (column) {
                    console.log(column.value);
                    vector[0] = column.value;
                    if (column == null) {
                        console.log("null");
                    }
                });
            });
            requestX.on('done', function (rowcount, more) {
                vector[0] = column.value;
                console.log("Request done");
            })
            connection.execSql(requestX);
        }
    });*/
sock.on("gamestart", function (data) {
    console.log("One user is comming!");
    newMemberAdd(vector, data);
});
sock.on("sMsg", function (data) { // Decide button clicked
    console.log("sMsgxxx");
    Users = Users.push([ data, 0,0, 0 ]);
    console.log("sMsgend");
});
/*
sock.on("connections", function (data) {
    console.log("connections success");
    data.emit("connectionssuccess");
    datas.on("connections", function (data) {
        console.log("Here I am~");
    });
});*/

var num = 0;
sock.on("connection", function (datas) {
    console.log("One user is comming!");
    var _datas = datas;
    datas.on("Logout", function (data) {
        var DisconnectedJson = JSON.parse(JSON.stringify(data));
        var DisconnectedMail = data;//DisconnectedJson['mail'];
        console.log(" Logout : " + DisconnectedMail);
        for (var i = 0; i < Users.length; i++) {
            if (Users[i][0] == DisconnectedMail) {
                console.log("Memory disallocation start");
                Users.splice(i, 1);
                // delete makes empty item. don't use
                // delete Users[i];
                console.log(Users);
            }
        }
        console.log(JSON.stringify(data));
    });
    datas.on("disconnect", function (data) {
        console.log("close!");
    });

    datas.on("SMSG", function (data) {
        console.log("Button is cliked");
        sock.sockets.emit("RMSG",data);
    });

    /*
     * This function is for connecting nodes location.
     * In this function, It returns all information of nodes.
    */// broad cast is for all members connected with this server.
    datas.on("connections", function (data) {
        num++;
        //console.log(Users);
        var contact = JSON.parse(data);
        console.log(contact);
        for (var i = 0; i < Users.length; i++) {
            //console.log("i = " + i.toString() + " Users[i][0] = " + Users[i][0] + "contact[3] = " + contact['name']);
            if (Users[i][0] == contact['name']) {
                console.log("equals");
                Users[i][1] = contact['x'];
                Users[i][3] = contact['z'];
                Users[i][2] = contact['y'];
                //console.log(Users[i][0], Users[i][1]);
                break;
            }
        }       // End.
        // New location is added. I will send message for all member's location in 'json'.
        // Users = [ [x,y,z,name], [x1,y1,z1,name1], [x2,y2.z2,name2] .. ] 
    });
    /*datas.on("RequestLocation", function (data) {
          datas.emit("Locations", JSON.stringify(Users));
    });*/
    setInterval(function () {
        if (Users.length > 1) {
            var tmp = JSON.stringify(Users);
            datas.broadcast.emit("Locations", tmp);
        }
    }, 300);

    datas.on("sMsg", function (data) { // Decide button clicked
        console.log("sMsaag");
        //console.log(typeof (data));
        str = data;
        console.log(str, "I pushed!");
        Users.push([str, 0,  0, 0 ]);
        //console.log("sMsgend");
        vector = [0, 0, 0, str];
        //console.log("vector : ", vector);
        var connection = new Connection(config);
        connection.on("connect", function (err) {
            if (err) {
                console.debug(err);
            }
            else {
                console.log("DB done!");
                requestX = new Request("SELECT STARTX, STARTY, STARTZ from dbo.GameStatus WHERE EMAIL='" +str + "'", function (err, rowCount, rows) {
                    if (err) {
                        console.log(err);
                    }
                });
                requestX.on('row', function (columns) {
                    var i = 0;
                    columns.forEach(function (column) {
                        vector[i] = column.value;
                        //console.log(vector[i]);
                        i++;
                        if (column == null) {
                            console.log("null");
                        }
                    });
                    //console.log("vector:", vector);
                    var bj = {};
                    bj.name = vector[3];
                    bj.x = vector[0]; bj.y = vector[1]; bj.z = vector[2];
                    _datas.emit("NewBee", JSON.stringify(bj));
                });
                requestX.on('done', function (rowcount, more) {
                    vector[0] = column.value;
                    console.log("Request done");
                })
                connection.execSql(requestX);
            }
            var tmp = {};
            tmp.name = str;
            datas.broadcast.emit("NewBeeIsHere", JSON.stringify(tmp));
        });
    });
    
});
function GetArrayNumByMail(mail) {
    var cnt = 0;
    for (var i in Users) {
        console.log(i);
        console.log(i[3]);
        console.log(mail);
        if (i[3] == mail) {
            return cnt;
            cnt++;
        }
    }
    return -1;
}
function newMemberAdd(vector, data) {
    console.log("New member is adding");

    var newUser = Users.lastIndexOf();
    var newMail = data;
    vector[3] = newMail;
    console.log(vector);
    sock.emit("NewBee", newMail);
    console.log("Request done");
    connection = new Connection(config);
    connection.on('connect', function (err) {
        if (err) {
            console.log(err);
        }
        console.log("connect -> connect'");
        requestX = new Request("SELECT STARTX, STARTY, STARTZ from dbo.GameStatus WHERE EMAIL='" + newMail + "'", function (err, rowCount, rows) {
            if (err) {
                console.log(err);
            }
        });
        requestX.on('row', function (columns) {
            var i = 0;
            columns.forEach(function (column) {
                vector[i] = column.value;
                console.log("i : ", vector[i]);
                i++;
                if (column == null) {
                    console.log("null");
                }
            });
        });
        requestX.on('done', function (rowcount, row) {
            console.debug(vector);
        })
        connection.execSql(requestX);
    });
}
/*
function SpawnNewbee(newMail, vector) {
    io.sockets.emit("NewBee", newMail);
}
*/