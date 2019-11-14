const Koa = require('koa')
const app = new Koa()
var http = require('http').Server(app);
var io = require('socket.io')(http);
var utf8 = require('utf8');
var SSHClient = require('ssh2').Client;

function createNewServer(machineConfig, socket) {
    var ssh = new SSHClient();
    let {msgId, ip} = machineConfig;
    let username = 'root'
    let password ='123456'
    ssh.on('ready', function () {
        socket.emit(msgId, '\r\n***' + ip + ' SSH CONNECTION ESTABLISHED ***\r\n');
        ssh.shell(function(err, stream) {
            if(err) {
                return socket.emit(msgId, '\r\n*** SSH SHELL ERROR: ' + err.message + ' ***\r\n');
            }
            socket.on(msgId, function (data) {
                stream.write(data);
            });
            stream.on('data', function (d) {
                socket.emit(msgId, utf8.decode(d.toString('binary')));
            }).on('close', function () {
                ssh.end();
            });
        })
    }).on('close', function () {
        socket.emit(msgId, '\r\n*** SSH CONNECTION CLOSED ***\r\n');
    }).on('error', function (err) {
        ssh.end();
        socket.emit(msgId, '\r\n*** SSH CONNECTION ERROR: ' + err.message + ' ***\r\n');
    }).connect({
        host: ip,
        port: 22,
        username: username,
        password: password
    });
    socket.on('disconnect', function(){
        ssh.end();
    });
}
 
 
io.on('connection',async function(socket) {
    socket.on('createNewServer', function(machineConfig) {//新建一个ssh连接
        console.log("createNewServer："+machineConfig.msgId)
        createNewServer(machineConfig, socket);
    })
 
    socket.on('disconnect', function(){
        console.log('user disconnected');
    });
})
 
http.listen(8888, function() {
    console.log('listening on * 8888');
})