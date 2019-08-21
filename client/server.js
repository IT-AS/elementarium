const socket = io('http://localhost:4000');

function init() {
    view('Lobby');

    socket.on('games', function(games){
        const list = document.getElementById("games");
        list.innerHTML = '';
        for (const gameId of games) {
            const item = document.createElement("div");
            item.innerText = gameId;

            const nickname = document.createElement("input");
            nickname.setAttribute("type", "text");
            nickname.setAttribute("id", gameId);
            nickname.setAttribute("value", "Player");

            const button = document.createElement("button");
            button.setAttribute("onclick", "joinGame('" + gameId + "')");
            button.innerText = "Join";
            item.appendChild(nickname);
            item.appendChild(button);
            list.appendChild(item);
        }
    });	

    socket.emit("games", "");    
}

function view(viewName) {
    let content = '<p>Unknown view ' + viewName;

    if(viewName === "Lobby") {
        content = 
        '<div id="header" class="header">' + 
        '<h3>Available</h3>' +
        '<div id="games"></div>' +
        '<form action="">' + 
        '    <input id="gameId" autocomplete="off" /><button onclick="createGame(event);">Create game</button>' +
        '</form>' +
        '</div>';
    } else if (viewName === "Game") {
        content = 
        '<div id="header" class="header">' + 
        '   <span id="info-top"></span><br />' + 
        '   <button class="game" onclick="game.undo();">Undo</button>' + 
        '   <button class="game" onclick="move();">Next</button>' +
        '</div>' +
        '<div id="board" class="board"></div>' +
        '<div id="footer" class="footer">' +
        '   <button class="game" onclick="game.undo();">Undo</button>' +
        '   <button class="game" onclick="move();">Next</button>' +
        '   <br />' +
        '   <span id="info-bottom"></span>' +
        '</div>';
    }

    document.getElementsByTagName("body")[0].innerHTML = content;
}

function createGame(e) {
    e.preventDefault();
    const gameId = document.getElementById("gameId").value;
    console.log(gameId);
    socket.emit("game", gameId);
}

function joinGame(gameId) {
    me = document.getElementById(gameId).value;
    id = gameId;

    socket.on('game[' + gameId + ']', function(gameObject) {

        if (gameObject !== "") {
            game.from(gameObject);

            view('Game');
            game.board.draw();

            document.getElementsByTagName("body")[0].className = game.players[me];
        } else {
            alert('Game full!');
            view('Lobby');
            socket.emit("games", "");
        }
    });	

    socket.emit('join', [gameId, me]);
}

function move() {
    socket.emit('move', [id, game.players[me], game.payload()]);
    game.players = {};
    document.getElementsByTagName("body")[0].className = "";
}