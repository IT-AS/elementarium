exports.create = (gameId) => {
    return new Game(gameId);    
}

function Game(gameId) {
    this.gameId = gameId;
    this.players = {};
    this.turn = 1;
    this.board = new Board(11);
    this.journal = [];

    this.start = function() {
        this.turn = 1;
        this.board.initialize();
    }
}

function Board(dimension) {
    this.fields = [];
    this.targets = [];
    this.dimension = dimension;
    this.winner = "";

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
        let redSourceFound = false;
        let greenSourceFound = false;

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

                        if(field.greenCandidate.type === "Source") {
                            field.current = field.greenCandidate;
                        }

                        if(field.redCandidate.type === "Source") {
                            field.current = field.redCandidate;
                        }
                    }
                } else {
                    if(field.greenCandidate.type) { field.current = field.greenCandidate; }
                    if(field.redCandidate.type) { field.current = field.redCandidate; }
                }

                field.greenCandidate.last = {};
                field.redCandidate.last = {};

                field.greenCandidate = {};
                field.redCandidate = {};
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
                            this.spawn(field, target, this.fields[row-1][col], this.fields[row-1][col+2], candidateLeft.type);
                        }
                        if(candidateLeft.spawnable(candidateUpper) && candidateUpper.spawnable(candidateRight) && candidateRight.spawnable(candidateLeft)) {
                            const newType = types.filter(t => !(["Source", "Obstacle", candidateLeft.type, candidateRight.type, candidateUpper.type].includes(t)))[0];
                            this.spawn(field, target, this.fields[row-1][col], this.fields[row-1][col+2], newType);
                        }
                    }

                    // Check lower candidate
                    if(row < this.dimension-1) {
                        const candidateLower = this.fields[row+1][col+1].current;
                        if(candidateLeft.same(candidateRight) && candidateLeft.same(candidateLower))
                        {
                            this.spawn(field, target, this.fields[row+1][col], this.fields[row+1][col+2], candidateLeft.type);
                        }
                        if(candidateLeft.spawnable(candidateLower) && candidateLower.spawnable(candidateRight) && candidateRight.spawnable(candidateLeft)) {
                            const newType = types.filter(t => !(["Source", "Obstacle", candidateLeft.type, candidateRight.type, candidateLower.type].includes(t)))[0];
                            this.spawn(field, target, this.fields[row+1][col], this.fields[row+1][col+2], newType);
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
                            this.spawn(field, target, this.fields[row][col-1], this.fields[row+2][col-1], candidateUpper.type);
                        }
                        if(candidateUpper.spawnable(candidateLeft) && candidateLeft.spawnable(candidateLower) && candidateLower.spawnable(candidateUpper)) {
                            const newType = types.filter(t => !(["Source", "Obstacle", candidateUpper.type, candidateLeft.type, candidateLower.type].includes(t)))[0];
                            this.spawn(field, target, this.fields[row][col-1], this.fields[row+2][col-1], newType);
                        }
                    }

                    // Check right candidate
                    if(col < this.dimension-1) {
                        const candidateRight = this.fields[row+1][col+1].current;
                        if(candidateUpper.same(candidateLower) && candidateUpper.same(candidateRight))
                        {
                            this.spawn(field, target, this.fields[row][col+1], this.fields[row+2][col+1], candidateUpper.type);
                        }
                        if(candidateUpper.spawnable(candidateRight) && candidateRight.spawnable(candidateLower) && candidateLower.spawnable(candidateUpper)) {
                            const newType = types.filter(t => !(["Source", "Obstacle", candidateUpper.type, candidateRight.type, candidateLower.type].includes(t)))[0];
                            this.spawn(field, target, this.fields[row][col+1], this.fields[row+2][col+1], newType);
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
            }
        }

        // Find sources
        for(let row=0; row<this.dimension; row++) {
            for(let column=0; column<this.dimension; column++) {
                const field = this.fields[row][column];

                // Unit already on this field is also a candidate
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
            this.winner = "";
        } else if (redSourceFound && !greenSourceFound) {
            this.winner = "red";
        } else if (!redSourceFound && greenSourceFound) {
            this.winner = "green";
        } else {
            this.winner = "gray";
        }

        // Get available moves
        if(this.winner === "") {
            this.targets = this.findAllMoves();
        }
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
            }
        }
    }

    this.move = function(sourceRow, sourceCol, targetRow, targetCol) {
        const sourceField = this.fields[sourceRow][sourceCol];
        const targetField = this.fields[targetRow][targetCol];
    
        if(sourceField.current.type) {
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
                        result.push({'from': [row, col], 'to': [field.row, field.column]});
                    }
                }
            }
        }

        return result;
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
}

function Unit(type, side) {
    this.type = type;
    this.side = side;
    this.last = {};
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
