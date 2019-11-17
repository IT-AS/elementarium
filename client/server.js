// const socket = io('http://elementarium.admiral.access.ly');
const socket = io('http://localhost:4000');

const names = ["Mouse", "Gargoyle", "Dragon", "Cat", "Dog", "Fish", "Mermaid", "Horse", "Hedgehog", "Elefant", "Pony", "Orc",
               "Crocodile", "Turtle", "Pig", "Frog", "Ogre", "Behemoth"];
const attribs = ["Great", "Mighty", "Powerful", "Glorious", "Incredible", "Wonderful", "Georgeous", "Irresistible", "Broken",
                 "Poor", "Crazy", "Unstoppable", "Lovely", "Creative"];

function init() {
    view('Lobby');

    socket.on('games', function(games){
        const gameList = document.getElementById("games");
        gameList.innerHTML = '';
        for (const game of games) {
            const gameContainer = document.createElement("div");
            gameContainer.className = "joinable";
            gameContainer.innerText = game.gameId;

            const nameInput = document.createElement("input");
            const nickname = attribs[Math.floor(Math.random() * attribs.length)] + ' ' + 
                names[Math.floor(Math.random() * names.length)];
            nameInput.setAttribute("type", "text");
            nameInput.setAttribute("id", "id" + game.gameId);
            nameInput.setAttribute("value", nickname);

            const pwdInput = document.createElement("input");
            pwdInput.setAttribute("type", "password");
            pwdInput.setAttribute("placeholder", "Game password");
            pwdInput.setAttribute("id", "pwd" + game.gameId);

            gameContainer.appendChild(nameInput);
            gameContainer.appendChild(pwdInput);
            gameList.appendChild(gameContainer);

            for(const side of sides) {
                if (side !== "gray") {
                    const joinButton = document.createElement("button");

                    if (Object.values(game.players).includes(side)) {
                        joinButton.className = side + " pill filled";
                        for(playerName in game.players) {
                            if (game.players[playerName] === side) {
                                joinButton.innerText = playerName;
                                joinButton.setAttribute("onclick", "resumeGame('" + game.gameId + "','" + playerName + "')");
                            }
                        }
                    } else {
                        joinButton.className = side + " pill";
                        joinButton.innerText = "Join";
                        joinButton.setAttribute("onclick", "joinGame('" + game.gameId + "','" + side + "')");
                    }

                    gameContainer.appendChild(joinButton);
                }
            }
        }
    });	

    socket.emit("games", "");    
}

function view(viewName) {
    let content = '<p>Unknown view ' + viewName;

    if(viewName === "Lobby") {
        content = 
        '<div id="header" class="header">' + 
        '<h3>Available Games</h3>' +
        '<div id="games"></div>' +
        '<form class="creatable" action="">' + 
        '   <label for="gameId">Game Id</label>' + 
        '   <input type="text" id="gameId" name="gameId" autocomplete="off" maxlength="30" />' + 
        '   <label for="gamePassword">Game Password</label>' + 
        '   <input type="text" id="gamePassword" name="gamePassword" autocomplete="off" maxlength="30" />' + 
        '   <button onclick="createGame(event);">Create game</button>' +
        '</form>' +
        '</div>';
    } else if (viewName === "Game") {
        content =
        '<div id="overlay" class="hidden">Waiting for Opponent</div>' + 
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
    const gamePassword = document.getElementById("gamePassword").value;
    socket.emit("game", gameId, gamePassword);
}

function joinGame(gameId, side) {
    me = document.getElementById('id' + gameId).value;
    pwd = document.getElementById('pwd' + gameId).value;
    id = gameId;

    socket.on('game[' + gameId + ']', receive);	
    socket.emit('join', [gameId, me, pwd, side]);
}

function resumeGame(gameId, playerName) {
    me = playerName;
    pwd = document.getElementById('pwd' + gameId).value;
    id = gameId;

    socket.on('game[' + gameId + ']', receive);	
    socket.emit('resume', [gameId, playerName, pwd]);
}

function receive(gameObject) {
    // Dude, because it's javascript, some magic happens here:
    // const me
    // const id
    // are all captured through closures when registering to the event
    // so don't wonder that they aren't declared here.

    if (gameObject !== "" && gameObject.gameId) {
        game.from(gameObject);

        view('Game');
        game.board.draw();

        document.getElementsByTagName("body")[0].className = game.players[me];
    } else {
        alert(gameObject);
        socket.removeListener('game[' + id + ']', receive);

        view('Lobby');
        socket.emit("games", "");
    }
}

function move() {
    socket.emit('move', [id, game.players[me], game.payload()]);
    game.players = {};
    document.getElementsByTagName("body")[0].className = "";
    document.getElementById("overlay").className = "visible";
}