function Game() {
    this.gameId = '';
    this.players = {};

    this.turn = 1;
    this.journal = [];
    this.board = {};
    this.winner = "";

    this.moves = 0;
    this.history = [];

    this.payload = function() {
        return this.history.map( h => [h.from.row, h.from.column, h.to.row, h.to.column, h.from.greenLast.type, h.from.redLast.type] );
    }

    this.from = function(game) {
        this.gameId = game.gameId;
        this.players = game.players;
        this.turn = game.turn;
        this.board = new Board(game.board);
        this.journal = game.journal;
        this.winner = game.winner;
        this.moves = 0;
        this.history = []; 
    }

    this.info = function() {
        return "Turn: " + this.turn;
    }

    this.printJournal = function() {
        let result = '';

        for(i=0; i<this.journal.length; i++) {
            const greenEvents = this.journal[i].green;
            const redEvents = this.journal[i].red;
            result += '[' + (i+1) + ']: ';
            
            for(g=0; g<greenEvents.moves.length; g++) {
                result += "Green " + greenEvents.moves[g][4] 
                        + " [" + greenEvents.moves[g][0] + ", " + greenEvents.moves[g][1] + "] ->"
                        + " [" + greenEvents.moves[g][2] + ", " + greenEvents.moves[g][3] + "]<br />";
            }

            for(r=0; r<redEvents.moves.length; r++) {
                result += "Red " + redEvents.moves[r][5] 
                        + " [" + redEvents.moves[r][0] + ", " + redEvents.moves[r][1] + "] ->"
                        + " [" + redEvents.moves[r][2] + ", " + redEvents.moves[r][3] + "]<br />";
            }

            for(const capture of greenEvents.captures) {
                result += "Red captured green " + capture[2].type + " on [" 
                        + capture[0] + ", " + capture[1] + "]<br />" ;
            }

            for(const capture of redEvents.captures) {
                result += "Green captured red " + capture[2].type + " on [" 
                        + capture[0] + ", " + capture[1] + "]<br />" ;
            }

            for(const spawn of greenEvents.spawns) {
                result += "Green spawned " + spawn[2].type + " on [" 
                        + spawn[0] + ", " + spawn[1] + "]<br />" ;
            }

            for(const spawn of redEvents.spawns) {
                result += "Red spawned " + spawn[2].type + " on [" 
                        + spawn[0] + ", " + spawn[1] + "]<br />" ;
            }

            result += "<br />";
        }

        return result;
    }

    this.undo = function() {
        if (this.history.length > 0) {
            const move = this.history.pop();
            if (move.from.redLast.type) {
                move.from.current = move.from.redLast;
                move.from.redLast = {};
                move.to.redCandidate = {};
            }
            if (move.from.greenLast.type) {
                move.from.current = move.from.greenLast;
                move.from.greenLast = {};
                move.to.greenCandidate = {};
            }

            this.moves--;
            this.board.draw();
        }
    }
}

function Board(other) {
    this.fields = other.fields.map(row => row.map(cell => cell = new Field(cell)));
    this.dimension = other.dimension;
    this.targets = other.targets;

    this.move = function(sourceRow, sourceCol, targetRow, targetCol) {
        const sourceField = this.fields[sourceRow][sourceCol];
        const targetField = this.fields[targetRow][targetCol];
    
        if(sourceField.current.type && targetField.moveHere) {
            if (sourceField.current.side === "green") { 
                targetField.greenCandidate = sourceField.current;
                sourceField.greenLast = sourceField.current;
            }
            if (sourceField.current.side === "red") { 
                targetField.redCandidate = sourceField.current; 
                sourceField.redLast = sourceField.current;
            }
            sourceField.current = {};

            // Store for undo
            game.moves++;
            game.history.push({ 
                "from": sourceField, 
                "to": targetField});
        }
    
        this.draw();
    }

    this.showTargets = function(row, col) {
        if(game.moves < movelimit) {
            const unit = this.fields[row][col].current;

            // Check side to move
            if (unit.side != game.players[me]) {
                return;
            }

            const filteredTargets = this.targets.filter(f => f.side === unit.side && f.from[0] === row && f.from[1] === col)[0];
            for(const target of filteredTargets.to) {
                const field = this.fields[target[0]][target[1]];
                if(field.targetable(unit.side)) {
                    field.moveHere = true;
                    document.getElementById(field.coord()).className += " target";
                }
            }
        }
    }

    this.draw = function() {
        const target = document.getElementById("board");
        const infoTop = document.getElementById("info-top");
        const infoBottom = document.getElementById("info-bottom");

        while(target.firstChild){
            target.removeChild(target.firstChild);
        }

        if(game.winner === "") {
            if (game.players[me] === "green") {
                for(let row=0; row<this.dimension; row++) {
                    for(let column=0; column<this.dimension; column++) {
                        this.fields[row][column].moveHere = false;
                        this.fields[row][column].render(target);
                    }
                }
                infoTop.textContent = Object.keys(game.players)[1];
                infoBottom.textContent = Object.keys(game.players)[0];
            } else {
                for(let row=this.dimension-1; row>=0; row--) {
                    for(let column=this.dimension-1; column>=0; column--) {
                        this.fields[row][column].moveHere = false;
                        this.fields[row][column].render(target);
                    }
                }
                infoTop.textContent = Object.keys(game.players)[0];
                infoBottom.textContent = Object.keys(game.players)[1];
            }

            infoBottom.innerHTML += "<br />" + this.targets.length + " moves available";
            infoBottom.innerHTML += "<br />" + game.printJournal();
        } else {
            target.textContent = game.winner + " wins!";
        }
    }
}

function Field(other) {

    this.row = other.row;
    this.column = other.column;
    this.moveHere = other.moveHere;
    this.current = new Unit(other.current);
    this.greenLast = new Unit(other.greenLast);
    this.greenCandidate = new Unit(other.greenCandidate);
    this.redLast = new Unit(other.redLast);
    this.redCandidate = new Unit(other.redCandidate);

    this.coord = function() {
        return "[" + this.row + ", " + this.column + "]";
    }

    this.side = function() {
        if(this.row < 4) { return "red"; }
        if(this.row < 7) { return "gray"; }
        return "green";
    }

    this.empty = function() { 
        return typeof(this.current.type) === 'undefined'; 
    }

    this.candidate = function(side){
        if(side === "red") {
            return this.redCandidate;
        }

        if(side === "green") {
            return this.greenCandidate;
        }

        return null;
    }

    this.targetable = function(side) {
        return side && 
            !this.candidate(side).type &&
            !this.goal(side) &&
            (this.empty() || this.current.side !== side);
    }

    this.goal = function(side) {
        return !this.empty() && this.current.type === "Source" && this.current.side !== side;
    }

    this.render = function(target) {
        const div = document.createElement("div");
        div.className = "square " + this.side();

        const dummy = document.createElement("div");
        dummy.className = "placeholder";
        dummy.innerText = "p";

        const span = document.createElement("span");
        span.innerText = this.coord();
        div.appendChild(dummy);

        div.setAttribute("ondrop", "drop(event)");
        div.setAttribute("ondragover", "allowDrop(event)");
        div.setAttribute("onclick", "clickField(event)");

        div.setAttribute("data-row", this.row);
        div.setAttribute("data-col", this.column);

        div.setAttribute("id", this.coord());

        if(this.current.type) {
            this.current.render(div, this.row, this.column);
        }
        
        if(this.greenCandidate.type && game.players[me]==="green") {
            const greenNext = document.createElement("div");
            greenNext.className = "next";

            div.appendChild(greenNext);
            this.greenCandidate.render(greenNext, this.row, this.column);
        }

        if(this.redCandidate.type && game.players[me]==="red") {
            const redNext = document.createElement("div");
            redNext.className = "next";

            div.appendChild(redNext);
            this.redCandidate.render(redNext, this.row, this.column);
        }

        target.appendChild(div);
    }
}

function Unit(other) {
    this.type = other.type;
    this.side = other.side;

    this.name = function() {
        return side[0].toUpperCase() + side.slice(1) + " " + this.type;
    }

    this.friendly = function(other) {
        return this.side === other.side;
    }

    this.render = function (target, row, col) {
        const div = document.createElement("div");
        div.className = "unit " + this.side + " " + this.type.toLowerCase();

        if (this.side !== "gray") {
            if (game.players[me] === this.side) {
                div.setAttribute("draggable", "true");
                div.setAttribute("ondragstart", "drag(event)");
            }

            div.setAttribute("ondrop", "drop(event)");
            div.setAttribute("ondragover", "allowDrop(event)");
        }

        div.setAttribute("data-row", row);
        div.setAttribute("data-col", col);

        target.appendChild(div);
    }
}
