const factory = require('@elementarium/engine');

const http = require('http');
const express = require('express');
const bcrypt = require('bcrypt');

const app = module.exports.app = express();
const server = http.createServer(app);
const io = require('socket.io').listen(server);

const port = 4000;

const games = {};
const pwds = {};

const gameList = function() {
    return Object.values(games).map(g => ({gameId: g.gameId, players: g.players, turn: g.turn}));
}

app.get('/', (request, response) => {
    response.send('I\'m fine, bro');
});

server.listen(port, () => {
    console.log(`App is running on port ${port}`);
});

io.on('connection', (socket) => {
    console.log('connected');

    socket.on('games', function(msg){
        socket.emit('games', gameList());
    });    

    socket.on('game', function(gameId, password) {
        // Initialize new game
        const game = factory.create(gameId);
        game.start();

        // Store it
        games[gameId] = game;
        pwds[gameId] = bcrypt.hashSync(password, 10);

        // Send updated list of games to clients
        io.emit('games', gameList());
    });

    socket.on('join', function(joiner) {
        const gameId = joiner[0];
        const playerId = joiner[1];
        const pwd = joiner[2];
        const side = joiner[3];
        const game = games[gameId];
        const gamePwd = pwds[gameId];

        if (game && gamePwd) {
            if(bcrypt.compareSync(pwd, pwds[gameId])) {
                game.players[playerId] = side;
                io.emit('game[' + gameId + ']', game);
            } else {
                socket.emit('game[' + gameId + ']', "Wrong password!");
            }
        } else {
            socket.emit('game[' + gameId + ']', "Unknown game!");
        }
    });

    socket.on('resume', function(resumer) {
        const gameId = resumer[0];
        const playerId = resumer[1];
        const pwd = resumer[2];
        const game = games[gameId];
        const gamePwd = pwds[gameId];

        if (game && gamePwd) {
            if(bcrypt.compareSync(pwd, pwds[gameId])) {
                if (Object.keys(game.players).includes(playerId) ) {
                    socket.emit('game[' + gameId + ']', game);
                } else {
                    socket.emit('game[' + gameId + ']', "Unknown player!");
                }                
            } else {
                socket.emit('game[' + gameId + ']', "Wrong password!");
            }
        } else {
            socket.emit('game[' + gameId + ']', "Unknown game!");
        }
    });


    socket.on('move', function(move) {

        const gameId = move[0];
        const side = move[1];
        const moves = move[2];
        const game = games[gameId];

        if(moves) {
            if(!game.journal[game.turn-1]) {
                game.journal[game.turn-1] = {};
            }

            const turn = game.journal[game.turn-1];
            turn[side] = moves;
            if(turn.green && turn.red) {
                for(const playermoves of Object.values(turn)) {
                    for(let i=0; i<playermoves.length; i++) {
                        const move = playermoves[i];
                        game.board.move(move[0],move[1],move[2],move[3]);
                    }
                }

                game.board.resolve();
                game.turn++;
                io.emit('game[' + gameId + ']', game);
            }
        }
    });
});
