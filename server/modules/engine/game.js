exports.create = (gameId) => {
    return new Game(gameId);    
}

function Game(gameId) {
    this.gameId = gameId;
    this.players = {};
    this.turn = 1;
    this.board = new Board(11);
    this.journal = [];
    this.winner = "";

    this.start = function() {
        this.turn = 1;
        this.board.initialize();
    }

    this.next = function(side, moves) {
        const turn = this.current();
        
        if(!side || !moves) {
            return false;
        }

        if(!turn[side]) {
            turn[side] = {}
        }

        turn[side]["moves"] = moves;

        // CPU Intermezzo
        const cpu = this.players["CPU"];
        if(cpu) {
            if(!turn[cpu]){
                turn[cpu] = {};
            }
            turn[cpu]["moves"] = this.calculate(cpu);
        }

        if(turn.green && turn.red) {
            for(const playeractions of Object.values(turn)) {
                const playermoves = playeractions["moves"];
                for(let i=0; i<playermoves.length; i++) {
                    const move = playermoves[i];
                    this.board.move(move[0],move[1],move[2],move[3]);
                }
            }

            const result = this.board.resolve();
            this.winner = result.winner;

            for(const key of ["captures", "spawns"]) {
                for(const side of sides) {
                    if(side !== "gray") {
                        if(result[key] && result[key].length > 0) {
                            turn[side][key] = result[key].filter(c => c[2].side === side);
                        } else {
                            turn[side][key] = [];
                        }
                    }
                }
            }
            this.turn++;

            return true;
        }

        return false;
    }

    this.current = function() {
        if(!this.journal[this.turn-1]) {
            this.journal[this.turn-1] = {};
        }

        return this.journal[this.turn-1];
    }

    this.calculate = function(side) {
        const availableMoves = this.board.targets.filter(f => f.side === side);
        const calculatedMoves = [];
        for(i=0; i<3; i++){
            const moveFrom = Math.floor(Math.random() * availableMoves.length);
            const moveTo = Math.floor(Math.random() * availableMoves[moveFrom].to.length);
            calculatedMoves.push([
                availableMoves[moveFrom].from[0], 
                availableMoves[moveFrom].from[1], 
                availableMoves[moveFrom].to[moveTo][0], 
                availableMoves[moveFrom].to[moveTo][1],
                this.board.fields[availableMoves[moveFrom].from[0]][availableMoves[moveFrom].from[1]].current.type,
                this.board.fields[availableMoves[moveFrom].from[0]][availableMoves[moveFrom].from[1]].current.type,
            ]);
        }

        return calculatedMoves;
    }
}

function Board(dimension) {
    this.fields = [];
    this.targets = [];
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

        this.targets = this.findAllMoves();
    }

    this.inside = function(row, col) {
        return row >= 0 && row < this.dimension && col >= 0 && col < this.dimension;
    }

    this.resolve = function() {
        const spawns = [];
        const captures = [];

        for(let row=0; row<this.dimension; row++) {
            for(let column=0; column<this.dimension; column++) {
                const field = this.fields[row][column];

                field.prepare();
                captured = field.clash();

                if(captured && captured.length > 0) {
                    for(const capture of captured) {
                        captures.push(capture);
                    }
                }
            }
        }

        // Find spawns (horizontal)
        for(let row=0; row<this.dimension;row++) {
            for(let col=0; col<this.dimension-2;col++) {
                const field = this.fields[row][col];
                const candidateLeft = field.current;
                const candidateRight = this.fields[row][col+2].current;
                const target = this.fields[row][col+1];

                // Find (X 0 X) pattern
                if(!field.empty() && candidateLeft.friendly(candidateRight) && (target.empty() || target.goal())) {

                    // Check upper candidate
                    if(row > 0) {
                        const candidateUpper = this.fields[row-1][col+1].current;
                        if(candidateLeft.same(candidateRight) && candidateLeft.same(candidateUpper)) {
                            spawns.push(
                                this.spawn(field, target, this.fields[row-1][col], this.fields[row-1][col+2], candidateLeft.type)
                            );
                        }
                        if(candidateLeft.spawnable(candidateUpper) && candidateUpper.spawnable(candidateRight) && candidateRight.spawnable(candidateLeft)) {
                            const newType = types.filter(t => !(["Source", "Obstacle", candidateLeft.type, candidateRight.type, candidateUpper.type].includes(t)))[0];
                            spawns.push(
                                this.spawn(field, target, this.fields[row-1][col], this.fields[row-1][col+2], newType)
                            );
                        }
                    }

                    // Check lower candidate
                    if(row < this.dimension-1) {
                        const candidateLower = this.fields[row+1][col+1].current;
                        if(candidateLeft.same(candidateRight) && candidateLeft.same(candidateLower))
                        {
                            spawns.push(
                                this.spawn(field, target, this.fields[row+1][col], this.fields[row+1][col+2], candidateLeft.type)
                            );
                        }
                        if(candidateLeft.spawnable(candidateLower) && candidateLower.spawnable(candidateRight) && candidateRight.spawnable(candidateLeft)) {
                            const newType = types.filter(t => !(["Source", "Obstacle", candidateLeft.type, candidateRight.type, candidateLower.type].includes(t)))[0];
                            spawns.push(
                                this.spawn(field, target, this.fields[row+1][col], this.fields[row+1][col+2], newType)
                            );
                        }
                    }
                }
            }
        }

        // Find spawns (vertical)
        for(let col=0; col<this.dimension; col++) {
            for(let row=0; row<this.dimension-2; row++) {
                const field = this.fields[row][col];
                const candidateUpper = field.current;
                const candidateLower = this.fields[row+2][col].current;
                const target = this.fields[row+1][col];

                // Find (X 0 X) pattern
                if(!field.empty() && candidateUpper.friendly(candidateLower) && (target.empty() || target.goal())) {

                    // Check left candidate
                    if(col > 0) {
                        const candidateLeft = this.fields[row+1][col-1].current;
                        if(candidateUpper.same(candidateLower) && candidateUpper.same(candidateLeft))
                        {
                            spawns.push(
                                this.spawn(field, target, this.fields[row][col-1], this.fields[row+2][col-1], candidateUpper.type)
                            );
                        }
                        if(candidateUpper.spawnable(candidateLeft) && candidateLeft.spawnable(candidateLower) && candidateLower.spawnable(candidateUpper)) {
                            const newType = types.filter(t => !(["Source", "Obstacle", candidateUpper.type, candidateLeft.type, candidateLower.type].includes(t)))[0];
                            spawns.push(
                                this.spawn(field, target, this.fields[row][col-1], this.fields[row+2][col-1], newType)
                            );
                        }
                    }

                    // Check right candidate
                    if(col < this.dimension-1) {
                        const candidateRight = this.fields[row+1][col+1].current;
                        if(candidateUpper.same(candidateLower) && candidateUpper.same(candidateRight))
                        {
                            spawns.push(
                                this.spawn(field, target, this.fields[row][col+1], this.fields[row+2][col+1], candidateUpper.type)
                            );
                        }
                        if(candidateUpper.spawnable(candidateRight) && candidateRight.spawnable(candidateLower) && candidateLower.spawnable(candidateUpper)) {
                            const newType = types.filter(t => !(["Source", "Obstacle", candidateUpper.type, candidateRight.type, candidateLower.type].includes(t)))[0];
                            spawns.push(
                                this.spawn(field, target, this.fields[row][col+1], this.fields[row+2][col+1], newType)
                            );
                        }
                    }
                }
            }
        }

        // Find spawns (corners)
        for(let c=0; c<corners.length; c++) {
            const corner = corners[c];
            const target = this.fields[corner[0][0]][corner[0][1]];
            const candidate1 = this.fields[corner[1][0]][corner[1][1]];
            const candidate2 = this.fields[corner[2][0]][corner[2][1]];
            const enemy = this.fields[corner[3][0]][corner[3][1]];
            if(!candidate1.empty() &&
                candidate1.current.same(candidate2.current) && 
                (target.empty() || target.goal()) &&
                (enemy.empty() || candidate1.current.friendly(enemy.current)) && 
                candidate1.current.side !== candidate1.side()) {
            
                target.current = new Unit(candidate1.current.type, candidate1.current.side);
                spawns.push([target.row, target.column, target.current]);
            }
        }

        this.targets = this.findAllMoves();
        return { 
            'winner': this.conclude(),
            'spawns': spawns.filter(s => s !== null),
            'captures': captures.filter(c => c !== [])
        };
    }

    this.conclude = function() {

        let winner = "";
        let redSourceFound = false;
        let greenSourceFound = false;

        // Find sources
        for(let row=0; row<this.dimension; row++) {
            for(let column=0; column<this.dimension; column++) {
                const field = this.fields[row][column];
                if(field.current.type === "Source") {
                    if(field.current.side === "red") {
                        redSourceFound = true;
                    }
                    if(field.current.side === "green") {
                        greenSourceFound = true;
                    }
                }
            }
        }

        // Detect end of game
        if (redSourceFound && greenSourceFound) {
            winner = "";
        } else if (redSourceFound && !greenSourceFound) {
            winner = "red";
        } else if (!redSourceFound && greenSourceFound) {
            winner = "green";
        } else {
            winner = "gray";
        }

        return winner;
    }

    this.spawn = function(candidate, target, corner1, corner2, type) {
        // Check corners empty or friendly
        if( corner1.empty() || corner1.current.friendly(candidate.current) &&
            corner2.empty() || corner2.current.friendly(candidate.current) ) {
            // Check territory
            if( candidate.current.side !== candidate.side() && candidate.side() !== "gray" &&
                corner1.current.side !== corner1.side() && corner1.side() !== "gray" && 
                corner2.current.side !== corner2.side() && corner2.side() !== "gray" ) {
                // SPAWN!
                target.current = new Unit(type, candidate.current.side);
                return [target.row, target.column, target.current];
            }
        }

        return null;
    }

    this.move = function(sourceRow, sourceCol, targetRow, targetCol) {
        const sourceField = this.fields[sourceRow][sourceCol];
        const targetField = this.fields[targetRow][targetCol];
    
        if(sourceField.current.type) {
            const side = sourceField.current.side;
            let valid = true;

            // Check if move was in list of possible moves
            const targets = this.targets.filter(f => 
                f.side === side &&
                f.from[0] === sourceField.row && f.from[1] === sourceField.column
            )[0];

            if(targets) {
                const target = targets.to.filter(t =>
                    t[0] === targetField.row && t[1] === targetField.column);

                if(!target) { valid = false; }
            } else {
                valid = false;
            }

            // Check if dynamic preconditions are met (such as putting a piece on a place where a piece was previously)
            if (targetField.current.type) {
                if (targetField.current.side === "gray") { valid = false; }
                if (sourceField.current.friendly(targetField.current)) { valid = false; }
                if (sourceField.current.friendly(targetField.candidate(side))) { valid = false; }
            }
    
            // Do the move if it is considered valid
            if(valid){
                if (sourceField.current.side === "green") { 
                    targetField.greenCandidate = sourceField.current;
                    sourceField.greenLast = sourceField.current;
                }
                if (sourceField.current.side === "red") { 
                    targetField.redCandidate = sourceField.current; 
                    sourceField.redLast = sourceField.current;
                }
                sourceField.current = {};
            } else {
                console.log("Move from " + sourceField.coord() + " to " + targetField.coord() + " considered invalid!");
            }
        }
    }

    this.findAllMoves = function() {
        return [].concat.apply([], [].concat.apply([], this.fields.map(l => l.map(f => this.findMoves(f)))));
    }

    this.findMoves = function(sourceField) {

        const result = [];
        const row = sourceField.row;
        const col = sourceField.column;
        const unit = sourceField.current;

        if(!sourceField.empty()) {

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
                                        return result;
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
                                        if(d < Math.abs(offsetRow)) {
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
                                        if(d < Math.abs(offsetRow)) {
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
                                        if(d < Math.abs(offsetCol)) {
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
                        result.push([field.row, field.column]);
                    }
                }
            }
        }

        return {'from': [row, col], 'to': result, 'side': sourceField.current.side};
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

    this.candidate = function(side) {
        if(side === "red") {
            return this.redCandidate;
        }

        if(side === "green") {
            return this.greenCandidate;
        }

        return null;
    }

    this.prepare = function() {

        // Remove previous guys
        this.redLast = {};
        this.greenLast = {};

        // Unit already on this field is also a candidate
        if(this.current.type) {
            if(this.current.side === "red") {
                this.redCandidate = this.current;
            }
            if(this.current.side === "green") {
                this.greenCandidate = this.current;
            }
        }
    }

    this.clash = function() {

        const result = [];

        // Here the clash begins
        if(this.greenCandidate.type && this.redCandidate.type) {
            if(this.greenCandidate.type === this.redCandidate.type) {
                this.current = {};

                result.push([this.row, this.column, this.greenCandidate]);
                result.push([this.row, this.column, this.redCandidate]);
            } else if(this.greenCandidate.type === "Source") {
                this.current = this.greenCandidate;
                result.push([this.row, this.column, this.redCandidate]);
            } else if(this.redCandidate.type === "Source") {
                this.current = this.redCandidate;
                result.push([this.row, this.column, this.greenCandidate]);
            } else {
                const pattern = clashes[this.greenCandidate.type];
                if(pattern) {
                    if(this.redCandidate.type === pattern[0]) {
                        this.current = this.greenCandidate;

                        result.push([this.row, this.column, this.redCandidate]);
                    }
                    if(this.redCandidate.type === pattern[1]) {
                        this.current = this.redCandidate;

                        result.push([this.row, this.column, this.greenCandidate]);
                    }
                    if(this.redCandidate.type === pattern[2]) {
                        this.current = {};

                        result.push([this.row, this.column, this.greenCandidate]);
                        result.push([this.row, this.column, this.redCandidate]);
                    }
                } 
            }
        } else {
            if(this.greenCandidate.type) { this.current = this.greenCandidate; }
            if(this.redCandidate.type) { this.current = this.redCandidate; }
        }

        this.greenCandidate = {};
        this.redCandidate = {};    

        this.greenLast = {};
        this.redLast = {};

        return result;
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
    this.spawnable = function(other) {
        return this.friendly(other) && !this.same(other) && this.type !== "Source";
    }
}

const types = [ "Source", "Earth", "Air", "Fire", "Water", "Obstacle" ];
const sides = [ "green", "red", "gray" ];

const units = {
    "red": {
        "Earth": [ [0,3], [0,7], [1,4], [1,5], [1,6] ],
        "Air": [ [0,2], [0,8], [1,3], [1,7], [2,5] ],
        "Fire": [ [0,1], [0,9], [1,2], [1,8], [0,6] ],
        "Water": [ [0,0], [1,1], [0,10], [1,9], [0,4] ],
        "Source": [ [0,5] ],
    },
    "green": {
        "Earth": [ [10,3], [10,7], [9,4], [9,5], [9,6] ],
        "Air": [ [10,2], [10,8], [9,3], [9,7], [8,5] ],
        "Fire": [ [10,1], [10,9], [9,2], [9,8], [10,6] ],
        "Water": [ [10,0], [9,1], [10,10], [9,9], [10,4] ],
        "Source": [ [10,5] ],
    },
    "gray": {
        "Obstacle": [ [4,0], [4,1], [5,1], [6,0], [6,1], [4,10], [4,9], [5,9], [6,10], [6,9] ]
    }
}

const clashes = {
    "Earth": ["Water", "Air", "Fire"],
    "Air": ["Earth", "Fire", "Water"],
    "Fire": ["Air", "Water", "Earth"],
    "Water": ["Fire", "Earth", "Air"],
}

const moves = {
    "Earth": [ [ 2, 0], [ 1, 0], [ 1, 1], [ 1,-1], 
               [ 0, 2], [ 0, 1], [ 0,-1], [ 0,-2],
               [-2, 0], [-1, 0], [-1, 1], [-1,-1] ],
    "Water": [ [ 3, 0], [ 2, 0], [ 1, 0], 
               [ 0, 1], [ 0, 2], [ 0, 3],
               [ 0,-1], [ 0,-2], [ 0,-3],
               [-3, 0], [-2, 0], [-1, 0] ],
    "Fire": [ [ 3, 3], [ 2, 2], [ 1, 1], 
             [ 3,-3], [ 2,-2], [ 1,-1],
             [-1, 1], [-1, 0], [-1,-1],
             [ 3, 0], [ 2, 0], [ 1, 0] ],
    "Air": [ [ 2, 2], [ 2, 1], [ 1, 2], 
              [-2, 2], [-2, 1], [-1, 2], 
              [-2,-2], [-2,-1], [-1,-2], 
              [ 2,-2], [ 2,-1], [ 1,-2] ],
    "Source": [ [ 1, 1], [ 1, 0], [ 1,-1],
             [ 0, 1], [ 0,-1],
             [-1, 1], [-1, 0], [-1,-1] ],
    "Obstacle": []
}

const blocks = { 
    "Earth": [ [ 1, 0], [ 1, 1], [ 1,-1], [ 0, 1], 
               [ 0,-1], [-1, 0], [-1, 1], [-1,-1] ],
    "Water": [ [ 1, 0], [ 0, 1], [ 0,-1], [-1, 0] ],
    "Fire": [ [ 1, 1], [ 1, 0], [ 1,-1],
             [-1, 1], [-1, 0], [-1,-1] ],
    "Air": [],
    "Source": []
}

const corners = [ [ [0,0], [0,1], [1,0], [1,1] ],
                  [ [0,10], [0,9], [1,10], [1,9] ], 
                  [ [10,0], [10,1], [9,0], [9,1] ], 
                  [ [10,10], [10,9], [9,10], [9,9] ] ];
