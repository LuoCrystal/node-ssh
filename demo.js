import "xterm/dist/xterm.css"
import openSocket from 'socket.io-client';
import { Terminal } from 'xterm';
import * as fit from 'xterm/dist/addons/fit/fit';
//xterm版本
// "xterm": "^3.10.1"


Terminal.applyAddon(fit);
let terminalContainer = document.getElementById(nodename);
xterm = new Terminal({cursorBlink: true});
xterm.open(terminalContainer);
xterm.fit();
socket = openSocket(`${global.socket_host}?token=${localStorage.getItem('token')}`);
socket.emit("createNewServer", {msgId: nodename, ip: res, username: "", password: ""});
xterm.on("data", function(data) {
    socket.emit(nodename, data);
})
socket.on(nodename, (data)=>{
xterm.write(data)
if(data.indexOf('CLOSED')!==-1){
    this.setState({loadnode:false})
    socket.disconnect()
    xterm.dispose()
}else if(data.indexOf('ERROR')!==-1){
    this.setState({loadnode:false})
    message.error('终端连接错误')
    socket.disconnect()
    xterm.dispose()
}else if(data.indexOf('ESTABLISHED')!==-1){
    this.setState({loadnode:false})
}
})
socket.on('disconnect', function(){
xterm.write('\r\n*** SSH CONNECTION CLOSED ***\r\n')
socket.disconnect()
});