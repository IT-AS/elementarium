function Game() {
    this.turn = 1;
    this.phase = 0;
    this.winner = "";
    this.board = new Board(11);

    this.moves = 0;
    this.history = [];

    this.info = function() {
        return "Turn: " + this.turn + ", " + sides[this.phase] + " side";
    }

    this.start = function() {
        this.phase = 0;
        this.turn = 1;
        this.moves = 0;
        this.history = [];

        this.board.initialize();
        document.getElementById("info-top").innerText = this.info();
        document.getElementById("info-bottom").innerText = this.info();
    }

    this.next = function() {
        this.phase = ++this.phase % 2;
        this.moves = 0;
        this.history = [];
        if(this.phase === 0) {
            this.board.resolve();
            this.turn++;
        }

        this.board.draw();

        document.getElementById("info-top").innerText = this.info();
        document.getElementById("info-bottom").innerText = this.info();
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

function Board(dimension) {
    this.fields = [];
    this.dimension = dimension;

    this.initialize = function() {
        this.fields = [];

        for(let row=0; row<this.dimension; row++) {
            let line = [];
            for(let column=0; column<this.dimension; column++) {
                line.push(new Field(row, column));
            }
            this.fields.push(line);
        }

        for(let s=0; s<sides.length; s++) {
            const side = sides[s];
            if(units[side]) {
                for(let t=0; t<types.length; t++) {
                    const type=types[t];
                    if(units[side][type]) {
                        for(let u=0; u<units[side][type].length; u++) {
                            const unit = units[side][type][u];
                            this.fields[unit[0]][unit[1]].current = new Unit(type, side);
                        }
                    }
                }
            }
        }

        this.draw();
    }

    this.resolve = function() {
        for(let row=0; row<this.dimension; row++) {
            for(let column=0; column<this.dimension; column++) {
                const field = this.fields[row][column];

                // Remove previous guys
                field.redLast = {};
                field.greenLast = {};

                // Unit already on this field is also a candidate
                if(field.current.type) {
                    if(field.current.side === "red") {
                        field.redCandidate = field.current;
                    }
                    if(field.current.side === "green") {
                        field.greenCandidate = field.current;
                    }
                }

                // Here the clash beginns
                if(field.greenCandidate.type && field.redCandidate.type) {
                    if(field.greenCandidate.type === field.redCandidate.type) {
                        field.current = {};
                    } else {
                        if(field.greenCandidate.type === "Earth") {
                            if(field.redCandidate.type === "Water") {
                                field.current = field.greenCandidate;
                            }
                            if(field.redCandidate.type === "Air") {
                                field.current = field.redCandidate;
                            }
                            if(field.redCandidate.type === "Fire") {
                                field.current = {};
                            }
                        }
                        if(field.greenCandidate.type === "Air") {
                            if(field.redCandidate.type === "Earth") {
                                field.current = field.greenCandidate;
                            }
                            if(field.redCandidate.type === "Fire") {
                                field.current = field.redCandidate;
                            }
                            if(field.redCandidate.type === "Water") {
                                field.current = {};
                            }
                        }
                        if(field.greenCandidate.type === "Fire") {
                            if(field.redCandidate.type === "Air") {
                                field.current = field.greenCandidate;
                            }
                            if(field.redCandidate.type === "Water") {
                                field.current = field.redCandidate;
                            }
                            if(field.redCandidate.type === "Earth") {
                                field.current = {};
                            }
                        }
                        if(field.greenCandidate.type === "Water") {
                            if(field.redCandidate.type === "Fire") {
                                field.current = field.greenCandidate;
                            }
                            if(field.redCandidate.type === "Earth") {
                                field.current = field.redCandidate;
                            }
                            if(field.redCandidate.type === "Air") {
                                field.current = {};
                            }
                        }
                    }
                } else {
                    if(field.greenCandidate.type) { field.current = field.greenCandidate; }
                    if(field.redCandidate.type) { field.current = field.redCandidate; }
                }

                field.greenCandidate = {};
                field.redCandidate = {};
            }
        }

        // Find spawns (horizontal)
        for(let row=0; row<this.dimension;row++) {
            for(let col=0; col<this.dimension-2;col++) {
                const field = this.fields[row][col];
                const candidate = field.current;
                const target = this.fields[row][col+1];
                // Find (X 0 X) pattern
                if(!field.empty() && candidate.same(this.fields[row][col+2].current) && (target.empty() || target.goal())) {
                    // Check upper candidate
                    if(row > 0 && candidate.same(this.fields[row-1][col+1].current)) {
                        this.spawn(field, target, this.fields[row-1][col], this.fields[row-1][col+2]);
                    }
                    // Check lower candidate
                    if( row < this.dimension-1 && candidate.same(this.fields[row+1][col+1].current)) {
                        this.spawn(field, target, this.fields[row+1][col], this.fields[row+1][col+2]);
                    }
                }
            }
        }

        // Find spawns (vertical)
        for(let col=0; col<this.dimension; col++) {
            for(let row=0; row<this.dimension-2; row++) {
                const field = this.fields[row][col];
                const candidate = field.current;
                const target = this.fields[row+1][col];
                // Find (X 0 X) pattern
                if(!field.empty() && candidate.same(this.fields[row+2][col].current) && (target.empty() || target.goal())) {
                    // Check left candidate
                    if(col > 0 && candidate.same(this.fields[row+1][col-1].current)) {
                        this.spawn(field, target, this.fields[row][col-1], this.fields[row+2][col-1]);
                    }
                    // Check right candidate
                    if(row < this.dimesion-1 && candidate.same(this.fields[row+1][col+1].current)) {
                        this.spawn(field, target, this.fields[row][col+1], this.fields[row+2][col+1]);
                    }
                }
            }
        }
    }

    this.spawn = function(candidate, target, corner1, corner2) {
        // Check corners empty or friendly
        if( corner1.empty() || corner1.current.friendly(candidate.current) &&
            corner2.empty() || corner2.current.friendly(candidate.current) ) {
            // Check territory
            if( candidate.current.side !== candidate.side() && candidate.side() !== "gray" &&
                corner1.current.side !== corner1.side() && corner1.side() !== "gray" ) {
                // SPAWN!
                target.current = new Unit(candidate.current.type, candidate.current.side);
            }
        }
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
                    "to": targetField });
            }
        }
    
        this.draw();
    }

    this.moves = function(row, col) {
        if (game.moves < movelimit) {
            const unit = this.fields[row][col].current;

            // Check side to move
            if (unit.side != sides[game.phase]) {
                return;
            }

            // Check if source and blocked
            if (unit.type === "Source") {
                for(let rowOffset=-1;rowOffset<=1;rowOffset++) {
                    for(let colOffset=-1;colOffset<=1;colOffset++) {
                        const nextRow = row+rowOffset;
                        const nextCol = col+colOffset;
                        if (nextRow > 0 && nextRow < this.dimension && nextCol > 0 && nextCol < this.dimension) {
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
        
                if ( (nextRow >= 0 && nextRow < this.dimension) &&
                    (nextCol >= 0 && nextCol < this.dimension) ) {

                    const field = this.fields[nextRow][nextCol];
                    let possible = true;

                    // Can't jump multiple times on the same field
                    if (field.greenCandidate.type && unit.side === "green" || 
                        field.redCandidate.type && unit.side === "red" ||
                        field.current.type && field.current.friendly(unit.side)) {
                        possible = false;
                    }

                    // Can't jump on gray
                    if (field.current.side !== "gray") {

                        // Fire can jump over everything
                        if (unit.type !== "Fire") {
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

        while(target.firstChild){
            target.removeChild(target.firstChild);
        }

        for(let row=0; row<this.dimension; row++) {
            for(let column=0; column<this.dimension; column++) {
                this.fields[row][column].moveHere = false;
                this.fields[row][column].render(target);
            }
        }
    }
}

function Field(row, column) {
    this.row = row;
    this.column = column;
    this.current = {};
    this.greenLast = {};
    this.greenCandidate = {};
    this.redLast = {};
    this.redCandidate = {};
    this.moveHere = false;

    this.coord = function() {
        return "[" + this.row + ", " + this.column + "]";
    }

    this.side = function() {
        if(row < 4) { return "red"; }
        if(row < 7) { return "gray"; }
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

        if(this.greenLast.type && sides[game.phase]==="red") {
            this.greenLast.render(div, this.row, this.column);
        }
        
        if(this.greenCandidate.type && sides[game.phase]==="green") {
            const greenNext = document.createElement("div");
            greenNext.className = "next";

            div.appendChild(greenNext);
            this.greenCandidate.render(greenNext, this.row, this.column);
        }

        if(this.redCandidate.type && sides[game.phase]==="red") {
            const redNext = document.createElement("div");
            redNext.className = "next";

            div.appendChild(redNext);
            this.redCandidate.render(redNext, this.row, this.column);
        }

        target.appendChild(div);
    }
}

function Unit(type, side) {
    this.type = type;
    this.side = side;
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
        div.className = "unit " + this.side;

        if (this.side !== "gray") {
            if (sides[game.phase] === this.side) {
                div.setAttribute("draggable", "true");
                div.setAttribute("ondragstart", "drag(event)");
            }

            div.setAttribute("ondrop", "drop(event)");
            div.setAttribute("ondragover", "allowDrop(event)");
        }

        div.setAttribute("data-row", row);
        div.setAttribute("data-col", col);

        div.innerText = this.letter();
        target.appendChild(div);
    }
}
