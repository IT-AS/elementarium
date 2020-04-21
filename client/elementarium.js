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

    this.inside = function(row, col) {
        return row >= 0 && row < this.dimension && col >= 0 && col < this.dimension;
    }

    this.move = function(sourceRow, sourceCol, targetRow, targetCol) {
        const sourceField = this.fields[sourceRow][sourceCol];
        const targetField = this.fields[targetRow][targetCol];
    
        if(sourceField.current.type && targetField.moveHere) {
            let drop = true;
            if (targetField.current.type) {
                if (targetField.current.side === "gray") { drop = false; }
                if (sourceField.current.friendly(targetField.current)) { drop = false; }
    
                if (sourceField.current.friendly(targetField.greenCandidate)) { drop = false; }
                if (sourceField.current.friendly(targetField.redCandidate)) { drop = false; }
            }
    
            if(drop){
                if (sourceField.current.side === "green") { 
                    targetField.greenCandidate = sourceField.current;
                    sourceField.greenLast = sourceField.current;

                    targetField.greenCandidate.last = sourceField;
                }
                if (sourceField.current.side === "red") { 
                    targetField.redCandidate = sourceField.current; 
                    sourceField.redLast = sourceField.current;

                    targetField.redCandidate.last = sourceField;
                }
                sourceField.current = {};

                // Store for undo
                game.moves++;
                game.history.push({ 
                    "from": sourceField, 
                    "to": targetField});
            }
        }
    
        this.draw();
    }

    this.showMoves = function(row, col) {
        if (game.moves < movelimit) {
            const unit = this.fields[row][col].current;

            // Check side to move
            if (unit.side != game.players[me]) {
                return;
            }

            // Check if source and blocked
            if (unit.type === "Source") {
                for(let rowOffset=-1;rowOffset<=1;rowOffset++) {
                    for(let colOffset=-1;colOffset<=1;colOffset++) {
                        const nextRow = row+rowOffset;
                        const nextCol = col+colOffset;
                        if (this.inside(nextRow, nextCol)) {
                            const candidate = this.fields[nextRow][nextCol].current;
                            if(candidate.type && !unit.friendly(candidate)) {
                                for(let b=0;b<blocks[candidate.type].length;b++) {
                                    const rowBlock = blocks[candidate.type][b][0] + rowOffset;
                                    const colBlock = blocks[candidate.type][b][1] + colOffset;
                                    if (rowBlock === 0 && colBlock === 0) {
                                        return;
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // Check normal moves
            for(let i=0; i<moves[unit.type].length; i++) {
                const direction = (unit.side === "green") ? -1 : 1;
                const offsetRow = moves[unit.type][i][0] * direction;
                const offsetCol = moves[unit.type][i][1];
                const nextRow = row + offsetRow;
                const nextCol = col + offsetCol;
        
                if ( this.inside(nextRow, nextCol) ) {

                    const field = this.fields[nextRow][nextCol];
                    let possible = true;

                    // Can't jump multiple times on the same field
                    if (field.greenCandidate.type && unit.side === "green" || 
                        field.redCandidate.type && unit.side === "red" ||
                        field.current.type && field.current.friendly(unit.side)) {
                        possible = false;
                    }

                    // Source can only run on his territory
                    if (unit.type === "Source" && unit.side !== field.side()) {
                        possible = false;
                    }

                    // Can't jump on gray
                    if (field.current.side !== "gray" && possible) {

                        // Air can jump over everything
                        if (unit.type !== "Air") {
                            // Check diagonals
                            if (Math.abs(offsetRow) > 0 && Math.abs(offsetCol) > 0 && Math.abs(offsetRow) === Math.abs(offsetCol)) {
                                for(let d=1; d<=Math.abs(offsetRow); d++) {
                                    const targetField = this.fields[row+d*Math.sign(offsetRow)][col+d*Math.sign(offsetCol)]
                                    if(targetField.current.type) {
                                        if(unit.friendly(targetField.current) || d < Math.abs(offsetRow)) {
                                            possible = false;
                                        }
                                    }
                                }
                            }

                            // Check vertical movement
                            if (Math.abs(offsetRow) > 0 && offsetCol === 0) {
                                for(let d=1; d<=Math.abs(offsetRow); d++) {
                                    const targetField = this.fields[row+d*Math.sign(offsetRow)][col]
                                    if(targetField.current.type) {
                                        if(unit.friendly(targetField.current) || d < Math.abs(offsetRow)) {
                                            possible = false;
                                        }
                                    }
                                }
                            }
                            
                            // Check horizontal movement
                            if (offsetRow === 0 && Math.abs(offsetCol) > 0) {
                                for(let d=1; d<=Math.abs(offsetCol); d++) {
                                    const targetField = this.fields[row][col+d*Math.sign(offsetCol)]
                                    if(targetField.current.type) {
                                        if(unit.friendly(targetField.current) || d < Math.abs(offsetCol)) {
                                            possible = false;
                                        }
                                    }
                                }
                            }
                        }
                    } else {
                        possible = false;
                    }

                    if (possible) {
                        field.moveHere = true;
                        document.getElementById(field.coord()).className += " target";
                    }
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
    this.last = other.last;

    this.name = function() {
        return side[0].toUpperCase() + side.slice(1) + " " + this.type;
    }
    this.same = function(other) {
        return this.type === other.type && this.friendly(other);
    }
    this.friendly = function(other) {
        return this.side === other.side;
    }
    this.letter = function () { return this.type.charAt(0); }
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

        //div.innerText = this.letter();
        target.appendChild(div);
    }
}
