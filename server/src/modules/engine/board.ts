class Board {
    public fields: Field[][];
    public targets: Direction[];
    public dimension: number;

    constructor(dimension: number) {
        this.dimension = dimension;
    }

    public initialize(): void {
        this.fields = [];

        for(let row=0; row<this.dimension; row++) {
            const line: Field[] = [];
            for(let column=0; column<this.dimension; column++) {
                line.push(new Field(row, column));
            }
            this.fields.push(line);
        }

        for(const side of Rules.sides) {
            if(Rules.units[side.toString()]) {
                for(const type of Rules.types) {
                    if(Rules.units[side.toString()][type.toString()]) {
                        for(const unit of Rules.units[side][type]) {
                            this.fields[unit[0]][unit[1]].current = new Unit(type, side);
                        }
                    }
                }
            }
        }

        this.targets = this.findAllMoves();
    }

    public resolve(): TurnEvent {
        const spawns: FieldEvent[] = [];
        const captures: FieldEvent[] = [];

        for(let row=0; row<this.dimension; row++) {
            for(let column=0; column<this.dimension; column++) {
                const field: Field = this.fields[row][column];

                field.prepare();
                captures.concat(field.clash());
            }
        }

        // Find spawns (horizontal)
        for(let row=0; row<this.dimension;row++) {
            for(let col=0; col<this.dimension-2;col++) {
                const field: Field = this.fields[row][col];
                const candidateLeft: Unit = field.current;
                const candidateRight: Unit = this.fields[row][col+2].current;
                const target: Field = this.fields[row][col+1];

                // Find (X 0 X) pattern
                if(!field.empty() && candidateLeft.friendly(candidateRight) && (target.empty() || target.goal(candidateLeft.side))) {

                    // Check upper candidate
                    if(row > 0) {
                        const candidateUpper: Unit = this.fields[row-1][col+1].current;
                        if(candidateLeft.same(candidateRight) && candidateLeft.same(candidateUpper)) {
                            spawns.push(
                                this.spawn(field, target, this.fields[row-1][col], this.fields[row-1][col+2], candidateLeft.type)
                            );
                        }
                        if(candidateLeft.spawnable(candidateUpper) && candidateUpper.spawnable(candidateRight) && candidateRight.spawnable(candidateLeft)) {
                            const newType: UnitType = Rules.types.filter(t => !([UnitType.Source, UnitType.Obstacle, candidateLeft.type, candidateRight.type, candidateUpper.type].includes(t)))[0];
                            spawns.push(
                                this.spawn(field, target, this.fields[row-1][col], this.fields[row-1][col+2], newType)
                            );
                        }
                    }

                    // Check lower candidate
                    if(row < this.dimension-1) {
                        const candidateLower: Unit = this.fields[row+1][col+1].current;
                        if(candidateLeft.same(candidateRight) && candidateLeft.same(candidateLower))
                        {
                            spawns.push(
                                this.spawn(field, target, this.fields[row+1][col], this.fields[row+1][col+2], candidateLeft.type)
                            );
                        }
                        if(candidateLeft.spawnable(candidateLower) && candidateLower.spawnable(candidateRight) && candidateRight.spawnable(candidateLeft)) {
                            const newType: UnitType = Rules.types.filter(t => !([UnitType.Source, UnitType.Obstacle, candidateLeft.type, candidateRight.type, candidateLower.type].includes(t)))[0];
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
                const field: Field = this.fields[row][col];
                const candidateUpper: Unit = field.current;
                const candidateLower: Unit = this.fields[row+2][col].current;
                const target: Field = this.fields[row+1][col];

                // Find (X 0 X) pattern
                if(!field.empty() && candidateUpper.friendly(candidateLower) && (target.empty() || target.goal(candidateUpper.side))) {

                    // Check left candidate
                    if(col > 0) {
                        const candidateLeft: Unit = this.fields[row+1][col-1].current;
                        if(candidateUpper.same(candidateLower) && candidateUpper.same(candidateLeft))
                        {
                            spawns.push(
                                this.spawn(field, target, this.fields[row][col-1], this.fields[row+2][col-1], candidateUpper.type)
                            );
                        }
                        if(candidateUpper.spawnable(candidateLeft) && candidateLeft.spawnable(candidateLower) && candidateLower.spawnable(candidateUpper)) {
                            const newType: UnitType = Rules.types.filter(t => !([UnitType.Source, UnitType.Obstacle, candidateUpper.type, candidateLeft.type, candidateLower.type].includes(t)))[0];
                            spawns.push(
                                this.spawn(field, target, this.fields[row][col-1], this.fields[row+2][col-1], newType)
                            );
                        }
                    }

                    // Check right candidate
                    if(col < this.dimension-1) {
                        const candidateRight: Unit = this.fields[row+1][col+1].current;
                        if(candidateUpper.same(candidateLower) && candidateUpper.same(candidateRight))
                        {
                            spawns.push(
                                this.spawn(field, target, this.fields[row][col+1], this.fields[row+2][col+1], candidateUpper.type)
                            );
                        }
                        if(candidateUpper.spawnable(candidateRight) && candidateRight.spawnable(candidateLower) && candidateLower.spawnable(candidateUpper)) {
                            const newType: UnitType = Rules.types.filter(t => !([UnitType.Source, UnitType.Obstacle, candidateUpper.type, candidateRight.type, candidateLower.type].includes(t)))[0];
                            spawns.push(
                                this.spawn(field, target, this.fields[row][col+1], this.fields[row+2][col+1], newType)
                            );
                        }
                    }
                }
            }
        }

        // Find spawns (corners)
        for(const corner of Rules.corners) {
            const target: Field = this.fields[corner[0][0]][corner[0][1]];
            const candidate1: Field = this.fields[corner[1][0]][corner[1][1]];
            const candidate2: Field = this.fields[corner[2][0]][corner[2][1]];
            const enemy: Field = this.fields[corner[3][0]][corner[3][1]];
            if(!candidate1.empty() &&
                candidate1.current.same(candidate2.current) &&
                (target.empty() || target.goal(candidate1.current.side)) &&
                (enemy.empty() || candidate1.current.friendly(enemy.current)) &&
                candidate1.current.side !== candidate1.territory()) {

                target.current = new Unit(candidate1.current.type, candidate1.current.side);
                spawns.push({row: target.row, column: target.column, unit: target.current} as FieldEvent);
            }
        }

        this.targets = this.findAllMoves();

        return {
            winner: this.conclude(),
            spawns: spawns.filter(s => s !== null),
            captures: captures.filter(c => c !== null)
        } as TurnEvent;
    }


    public move(sourceRow: number, sourceCol: number, targetRow: number, targetCol: number): void {
        const sourceField: Field = this.fields[sourceRow][sourceCol];
        const targetField: Field = this.fields[targetRow][targetCol];

        if(sourceField.current.type) {
            const side: Side = sourceField.current.side;
            let valid: boolean = true;

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
                if (targetField.current.side === Side.Gray) { valid = false; }
                if (sourceField.current.friendly(targetField.current)) { valid = false; }
                if (sourceField.current.friendly(targetField.candidate(side))) { valid = false; }
            }

            // Do the move if it is considered valid
            if(valid){
                if (sourceField.current.side === Side.Green) {
                    targetField.greenCandidate = sourceField.current;
                    sourceField.greenLast = sourceField.current;
                }
                if (sourceField.current.side === Side.Red) {
                    targetField.redCandidate = sourceField.current;
                    sourceField.redLast = sourceField.current;
                }

                sourceField.current = null;
            } else {
                // console.log("Move from " + sourceField.coord() + " to " + targetField.coord() + " considered invalid!");
            }
        }
    }

    public inside(row: number, col: number): boolean {
        return row >= 0 && row < this.dimension && col >= 0 && col < this.dimension;
    }

    private conclude(): Side {
        let winner: Side = null;
        let redSourceFound: boolean = false;
        let greenSourceFound: boolean = false;

        // Find sources
        for(let row=0; row<this.dimension; row++) {
            for(let column=0; column<this.dimension; column++) {
                const field = this.fields[row][column];
                if(field.current.type === UnitType.Source) {
                    if(field.current.side === Side.Red) {
                        redSourceFound = true;
                    }
                    if(field.current.side === Side.Green) {
                        greenSourceFound = true;
                    }
                }
            }
        }

        // Detect end of game
        if (redSourceFound && greenSourceFound) {
            winner = null;
        } else if (redSourceFound && !greenSourceFound) {
            winner = Side.Red;
        } else if (!redSourceFound && greenSourceFound) {
            winner = Side.Green;
        } else {
            winner = Side.Gray;
        }

        return winner;
    }

    private spawn(candidate: Field, target: Field, corner1: Field, corner2: Field, type: UnitType): FieldEvent {
        // Check corners empty or friendly
        if( corner1.empty() || corner1.current.friendly(candidate.current) &&
            corner2.empty() || corner2.current.friendly(candidate.current) ) {
            // Check territory
            if( candidate.current.side !== candidate.territory() && candidate.territory() !== Side.Gray &&
                corner1.current.side !== corner1.territory() && corner1.territory() !== Side.Gray &&
                corner2.current.side !== corner2.territory() && corner2.territory() !== Side.Gray ) {
                // SPAWN!
                target.current = new Unit(type, candidate.current.side);
                return {row: target.row, column: target.column, unit: target.current} as FieldEvent;
            }
        }

        return null;
    }

    private findMoves(sourceField: Field): Direction {

        const result: number[][] = [];
        const row: number = sourceField.row;
        const col: number = sourceField.column;
        const unit: Unit = sourceField.current;

        if(!sourceField.empty()) {

            // Check if source and blocked
            if (unit.type === UnitType.Source) {
                for(let rowOffset=-1;rowOffset<=1;rowOffset++) {
                    for(let colOffset=-1;colOffset<=1;colOffset++) {
                        const nextRow = row+rowOffset;
                        const nextCol = col+colOffset;
                        if (this.inside(nextRow, nextCol)) {
                            const candidate = this.fields[nextRow][nextCol].current;
                            if(candidate.type && !unit.friendly(candidate)) {
                                for(const block of Rules.blocks[candidate.type]) {
                                    const rowBlock = block[0] + rowOffset;
                                    const colBlock = block[1] + colOffset;
                                    if (rowBlock === 0 && colBlock === 0) {
                                        return null;
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // Check normal moves
            for(const move of Rules.moves[unit.type]) {
                const direction = (unit.side === Side.Green) ? -1 : 1;
                const offsetRow = move[0] * direction;
                const offsetCol = move[1];
                const nextRow = row + offsetRow;
                const nextCol = col + offsetCol;

                if (this.inside(nextRow, nextCol)) {

                    const field: Field = this.fields[nextRow][nextCol];
                    let possible: boolean = true;

                    // Can't jump multiple times on the same field
                    if (field.greenCandidate.type && unit.side === Side.Green ||
                        field.redCandidate.type && unit.side === Side.Red ||
                        field.current.type && field.current.friendly(unit)) {
                        possible = false;
                    }

                    // Source can only run on his territory
                    if (unit.type === UnitType.Source && unit.side !== field.territory()) {
                        possible = false;
                    }

                    // Can't jump on gray
                    if (field.current.side !== Side.Gray && possible) {

                        // Air can jump over everything
                        if (unit.type !== UnitType.Air) {

                            // Check diagonals
                            if (Math.abs(offsetRow) > 0 && Math.abs(offsetCol) > 0 && Math.abs(offsetRow) === Math.abs(offsetCol)) {
                                for(let d=1; d<=Math.abs(offsetRow); d++) {
                                    const targetField: Field = this.fields[row+d*Math.sign(offsetRow)][col+d*Math.sign(offsetCol)]
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
                                    const targetField: Field = this.fields[row+d*Math.sign(offsetRow)][col]
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
                                    const targetField: Field = this.fields[row][col+d*Math.sign(offsetCol)]
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

        return {from: [row, col], to: result, side: sourceField.current.side} as Direction;
    }

    public findAllMoves(): Direction[] {
        return [].concat.apply([], [].concat.apply([], this.fields.map(l => l.map(f => this.findMoves(f)))));
    }

}
