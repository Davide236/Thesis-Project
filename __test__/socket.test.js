const SocketMock = require('socket.io-mock');

describe('Testing the main functionalities of Socket.io', () => {
    let socket;
    let roomCreated;
    let room;

    beforeAll(() => {
        room = 'room1';
        socket = new SocketMock();
    });


    it('Testing creating a room', () => {
        socket.on('join', function(roomName) {
            roomCreated = roomName;
            expect(roomName).toBe(room);
        });
        socket.socketClient.emit('join',room);
    });

    it('Testing joining a room', () => {
        socket.on('join', function(roomName) {
            expect(roomName).toBe(roomCreated);
        });
        socket.socketClient.emit('join', room);
    });

    it('Testing user ready', () => {
        let user = 'user';
        socket.on('ready', function(roomName, username) {
            expect(roomName).toBe(room);
            expect(username).toBe(user);
        });
        socket.socketClient.emit('ready', room, user);
    });

    it('Checking ICE candidate', () => {
        let ICECandidate = 'candidate';
        socket.on('candidate', function(candidate, roomName) {
            expect(roomName).toBe(room);
            expect(candidate).toBe(ICECandidate);
        });
        socket.socketClient.emit('candidate',ICECandidate,room);
    });

    it('Testing offer exchange', () => {
        let users = [
            {name: 'User1'},
            {name: 'User2'}
        ]

        const accountSid = process.env.TWILIO_SID;
        const authToken = process.env.TWILIO_TOKEN;
        const client = require('twilio')(accountSid, authToken);
        let server;
        client.tokens.create().then(token => {
            server = JSON.parse(JSON.stringify(token.iceServers));
        })
        .then(()=>{
            socket.socketClient.emit('offer', 'offer', room, users, server);
        })

        socket.on('offer', function(offer, roomName, userList, iceServers) {
            expect(roomName).toBe('room1');
            expect(offer).toBe(room);
            expect(userList).toBe(users);
            expect(iceServers).toBe(servers);
        });
    });

    it('Test answer', () => {
        let exchange_answer = 'answer'
        socket.on('answer', function(answer, roomName) {
            expect(answer).toBe(exchange_answer);
            expect(roomName).toBe(room);
        });
        socket.socketClient.emit('answer', exchange_answer, room);
    });

    it('Testing user leave', () => {
        let user = 'user';
        socket.on('end-stream', function(roomName, username) {
            expect(roomName).toBe(room);
            expect(username).toBe(user);
        });
        socket.socketClient.emit('end-stream', room, user);
    });

    it('Testing questions functionality', () => {
        let q = 'Answer this question';
        let answers = '1,2,4';
        socket.on('question', function(roomName, question, answerPoll) {
            expect(roomName).toBe(room);
            expect(question).toBe(q);
            expect(answerPoll).toBe(answers);
        });
        socket.socketClient.emit('question', room, q, answers);
    });

    it('Testing stopping the stream', () => {
        socket.on('stop_simulation', function(roomName) {
            expect(roomName).toBe(room);
        });
        socket.socketClient.emit('stop_simulation', room);
    });
});
