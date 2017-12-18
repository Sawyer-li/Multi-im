var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
	res.send('<h1>Welcome Realtime Server</h1>');
});

//在线用户
var onlineUsers = {};
//当前在线人数
var onlineCount = 0;
var roomInfo = {};

io.on('connection', function(socket){
	console.log('a user connected');
	var roomID = 0;
	var userid = "";
	//监听新用户加入
	socket.on('login', function(user){
		//创建房间
		userid = user.userid;
		roomID = user.room; 
	 	console.log('roomID房间号为'+roomID);
		if(!roomInfo[roomID]){
			roomInfo[roomID] = {
				onlineCount: 0,
				onlineUsers: {}
			};
		}
		try{

		
		if(!roomInfo[roomID].onlineUsers.hasOwnProperty(user.userid)){
			roomInfo[roomID].onlineCount++;
			roomInfo[roomID].onlineUsers[user.userid] = user.username;
		}
		console.log(roomInfo);
		}catch(e){

		}
		//将用户信息加入房间 
		socket.join(roomID);
		io.to(roomID).emit('login',  { onlineUsers:roomInfo[roomID].onlineUsers, onlineCount:roomInfo[roomID].onlineCount, user: user});  

		/*
		socket.name = obj.userid;
		
		console.log(obj.username+'加入了聊天室');

		
		//检查在线列表，如果不在里面就加入
		if(!onlineUsers.hasOwnProperty(obj.userid)) {
			onlineUsers[obj.userid] = obj.username;
			//在线人数+1
			onlineCount++;
		}
		
		//向所有客户端广播用户加入
		io.emit('login', {onlineUsers:onlineUsers, onlineCount:onlineCount, user:obj});*/
	});
	
	//监听用户退出
	socket.on('disconnect', function(){
		//将退出的用户从在线列表中删除
		try{
		
		if(roomInfo[roomID].onlineUsers.hasOwnProperty(userid)){
			//退出用户的信息
			console.log(roomInfo[roomID].onlineUsers[userid]);
			var obj = {userid:userid, username:roomInfo[roomID].onlineUsers[userid]};
			
			//删除
			delete roomInfo[roomID].onlineUsers[userid];
			//在线人数-1
			roomInfo[roomID].onlineCount--;
			
			//向所有客户端广播用户退出
			io.emit('logout', {onlineUsers:onlineUsers, onlineCount:roomInfo[roomID].onlineCount, user:obj});
			console.log(obj.username+'退出了聊天室');
		}
		}catch(e){

		}
	});
	
	//监听用户发布聊天内容
	socket.on('message', function(obj){
		//向所有客户端广播发布的消息
		try{
		if(!roomInfo[roomID].onlineUsers.hasOwnProperty(obj.userid)){
				return false;
		}
		console.log(roomID);
		io.to(roomID).emit('message', obj);
		console.log(obj.username+'说：'+obj.content);
		}catch(e){
		}
	});
  
});

http.listen(3000, function(){
	console.log('listening on *:3000');
});
