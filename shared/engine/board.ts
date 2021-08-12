import {Direction} from "./moves/direction";
import {TurnEvent} from "./events/turnEvent";
import {FieldEvent} from "./events/fieldEvent";
import {UnitType} from "./enums/unittype";
import {Side} from "./enums/side";

import Rules from "./rules";
import Field from "./field";
import Unit from "./unit";
import Move from './moves/move';

export default class Board {
    public fields: Field[][];
    public targets: Direction[];
    public dimension: number;

    public sources: {};

    constructor(dimension: number) {
        this.dimension = dimension;
    }

    static clone(source: Board): Board {

        if(!source) { return source; }

        const board: Board = new Board(source.dimension);

        board.targets = source.targets;
        board.fields = source.fields.map(line => line.map(field => Field.clone(field)));

        return board;
    }

    public dirty_restore(source: Board) {
        for (let row = 0, n = this.dimension; row < n; row++) {
            for (let column = 0; column < n; column++) {
                this.fields[row][column].current = source.fields[row][column].current;
                this.fields[row][column].greenCandidate = null;
                this.fields[row][column].redCandidate = null;
            }
        }
    }

    public initialize(): void {
        this.fields = [];

        for (let row = 0; row < this.dimension; row++) {
            const line: Field[] = [];
            for (let column = 0; column < this.dimension; column++) {
                line.push(new Field(row, column));
            }
            this.fields.push(line);
        }

        for (const side of Rules.sides) {
            if (Rules.units[side.toString()]) {
                for (const type of Rules.types) {
                    if (Rules.units[side.toString()][type.toString()]) {
                        for (const unit of Rules.units[side][type]) {
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

        for (let row = 0; row < this.dimension; row++) {
            for (let column = 0; column < this.dimension; column++) {
                const field: Field = this.fields[row][column];

                field.prepare();
                const clashes = field.clash();
                for(let i=0, n=clashes.length; i<n; i++) {
                    captures.push(clashes[i]);
                }
            }
        }

        // Find spawns (horizontal)
        for (let row = 0; row < this.dimension; row++) {
            for (let col = 0; col < this.dimension - 2; col++) {
                const field: Field = this.fields[row][col];
                const candidateLeft: Unit = field.current;
                const candidateRight: Unit = this.fields[row][col + 2].current;
                const target: Field = this.fields[row][col + 1];

                // Skip empty fields directly
                if (!candidateLeft || !candidateRight) { continue; }

                // Find (X 0 X) pattern
                if (!field.empty() && candidateLeft.friendly(candidateRight) && (target.empty() || target.goal(candidateLeft.side))) {

                    // Check upper candidate
                    if (row > 0) {
                        const candidateUpper: Unit = this.fields[row - 1][col + 1].current;
                        if (candidateLeft.same(candidateRight) && candidateLeft.same(candidateUpper)) {
                            spawns.push(
                                this.spawn(field, target, this.fields[row - 1][col], this.fields[row - 1][col + 2], candidateLeft.type)
                            );
                        }
                        if (candidateLeft.spawnable(candidateUpper) && candidateUpper.spawnable(candidateRight) && candidateRight.spawnable(candidateLeft)) {
                            const newType: UnitType = Rules.types.filter(t => !([UnitType.Source, UnitType.Obstacle, candidateLeft.type, candidateRight.type, candidateUpper.type].includes(t)))[0];
                            spawns.push(
                                this.spawn(field, target, this.fields[row - 1][col], this.fields[row - 1][col + 2], newType)
                            );
                        }
                    }

                    // Check lower candidate
                    if (row < this.dimension - 1) {
                        const candidateLower: Unit = this.fields[row + 1][col + 1].current;

                        if (candidateLeft.same(candidateRight) && candidateLeft.same(candidateLower)) {
                            spawns.push(
                                this.spawn(field, target, this.fields[row + 1][col], this.fields[row + 1][col + 2], candidateLeft.type)
                            );
                        }
                        if (candidateLeft.spawnable(candidateLower) && candidateLower.spawnable(candidateRight) && candidateRight.spawnable(candidateLeft)) {
                            const newType: UnitType = Rules.types.filter(t => !([UnitType.Source, UnitType.Obstacle, candidateLeft.type, candidateRight.type, candidateLower.type].includes(t)))[0];
                            spawns.push(
                                this.spawn(field, target, this.fields[row + 1][col], this.fields[row + 1][col + 2], newType)
                            );
                        }
                    }
                }
            }
        }

        // Find spawns (vertical)
        for (let col = 0; col < this.dimension; col++) {
            for (let row = 0; row < this.dimension - 2; row++) {
                const field: Field = this.fields[row][col];
                const candidateUpper: Unit = field.current;
                const candidateLower: Unit = this.fields[row + 2][col].current;
                const target: Field = this.fields[row + 1][col];

                // Skip empty fields directly
                if (!candidateUpper || !candidateLower) { continue; }

                // Find (X 0 X) pattern
                if (!field.empty() && candidateUpper.friendly(candidateLower) && (target.empty() || target.goal(candidateUpper.side))) {

                    // Check left candidate
                    if (col > 0) {
                        const candidateLeft: Unit = this.fields[row + 1][col - 1].current;
                        if (candidateUpper.same(candidateLower) && candidateUpper.same(candidateLeft)) {
                            spawns.push(
                                this.spawn(field, target, this.fields[row][col - 1], this.fields[row + 2][col - 1], candidateUpper.type)
                            );
                        }
                        if (candidateUpper.spawnable(candidateLeft) && candidateLeft.spawnable(candidateLower) && candidateLower.spawnable(candidateUpper)) {
                            const newType: UnitType = Rules.types.filter(t => !([UnitType.Source, UnitType.Obstacle, candidateUpper.type, candidateLeft.type, candidateLower.type].includes(t)))[0];
                            spawns.push(
                                this.spawn(field, target, this.fields[row][col - 1], this.fields[row + 2][col - 1], newType)
                            );
                        }
                    }

                    // Check right candidate
                    if (col < this.dimension - 1) {
                        const candidateRight: Unit = this.fields[row + 1][col + 1].current;
                        if (candidateUpper.same(candidateLower) && candidateUpper.same(candidateRight)) {
                            spawns.push(
                                this.spawn(field, target, this.fields[row][col + 1], this.fields[row + 2][col + 1], candidateUpper.type)
                            );
                        }
                        if (candidateUpper.spawnable(candidateRight) && candidateRight.spawnable(candidateLower) && candidateLower.spawnable(candidateUpper)) {
                            const newType: UnitType = Rules.types.filter(t => !([UnitType.Source, UnitType.Obstacle, candidateUpper.type, candidateRight.type, candidateLower.type].includes(t)))[0];
                            spawns.push(
                                this.spawn(field, target, this.fields[row][col + 1], this.fields[row + 2][col + 1], newType)
                            );
                        }
                    }
                }
            }
        }

        // Find spawns (corners)
        for (const corner of Rules.corners) {
            const target: Field = this.fields[corner[0][0]][corner[0][1]];
            const candidate1: Field = this.fields[corner[1][0]][corner[1][1]];
            const candidate2: Field = this.fields[corner[2][0]][corner[2][1]];
            const enemy: Field = this.fields[corner[3][0]][corner[3][1]];
            if (!candidate1.empty() &&
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

    public dirty_resolve(spawnline_begin: number, spawnline_end: number): TurnEvent {
        const spawns: FieldEvent[] = [];
        const captures: FieldEvent[] = [];

        for (let row = spawnline_begin; row < spawnline_end; row++) {
            for (let column = 0; column < this.dimension; column++) {
                const field: Field = this.fields[row][column];

                field.prepare();
                const clashes = field.clash();
                for(let i=0, n=clashes.length; i<n; i++) {
                    captures.push(clashes[i]);
                }
            }
        }

        // Find spawns (horizontal)
        for (let row = spawnline_begin; row < spawnline_end; row++) {
            for (let col = 0; col < this.dimension - 2; col++) {
                const field: Field = this.fields[row][col];
                const candidateLeft: Unit = field.current;
                const candidateRight: Unit = this.fields[row][col + 2].current;
                const target: Field = this.fields[row][col + 1];

                // Skip empty fields directly
                if (!candidateLeft || !candidateRight) { continue; }

                // Find (X 0 X) pattern
                if (!field.empty() && candidateLeft.friendly(candidateRight) && (target.empty() || target.goal(candidateLeft.side))) {

                    // Check upper candidate
                    if (row > spawnline_begin) {
                        const candidateUpper: Unit = this.fields[row - 1][col + 1].current;
                        if (candidateLeft.same(candidateRight) && candidateLeft.same(candidateUpper)) {
                            spawns.push(
                                this.spawn(field, target, this.fields[row - 1][col], this.fields[row - 1][col + 2], candidateLeft.type)
                            );
                        }
                        if (candidateLeft.spawnable(candidateUpper) && candidateUpper.spawnable(candidateRight) && candidateRight.spawnable(candidateLeft)) {
                            const newType: UnitType = Rules.types.filter(t => !([UnitType.Source, UnitType.Obstacle, candidateLeft.type, candidateRight.type, candidateUpper.type].includes(t)))[0];
                            spawns.push(
                                this.spawn(field, target, this.fields[row - 1][col], this.fields[row - 1][col + 2], newType)
                            );
                        }
                    }

                    // Check lower candidate
                    if (row < spawnline_end - 1) {
                        const candidateLower: Unit = this.fields[row + 1][col + 1].current;

                        if (candidateLeft.same(candidateRight) && candidateLeft.same(candidateLower)) {
                            spawns.push(
                                this.spawn(field, target, this.fields[row + 1][col], this.fields[row + 1][col + 2], candidateLeft.type)
                            );
                        }
                        if (candidateLeft.spawnable(candidateLower) && candidateLower.spawnable(candidateRight) && candidateRight.spawnable(candidateLeft)) {
                            const newType: UnitType = Rules.types.filter(t => !([UnitType.Source, UnitType.Obstacle, candidateLeft.type, candidateRight.type, candidateLower.type].includes(t)))[0];
                            spawns.push(
                                this.spawn(field, target, this.fields[row + 1][col], this.fields[row + 1][col + 2], newType)
                            );
                        }
                    }
                }
            }
        }

        // Find spawns (vertical)
        for (let col = 0; col < this.dimension; col++) {
            for (let row = spawnline_begin; row < spawnline_end - 2; row++) {
                const field: Field = this.fields[row][col];
                const candidateUpper: Unit = field.current;
                const candidateLower: Unit = this.fields[row + 2][col].current;
                const target: Field = this.fields[row + 1][col];

                // Skip empty fields directly
                if (!candidateUpper || !candidateLower) { continue; }

                // Find (X 0 X) pattern
                if (!field.empty() && candidateUpper.friendly(candidateLower) && (target.empty() || target.goal(candidateUpper.side))) {

                    // Check left candidate
                    if (col > 0) {
                        const candidateLeft: Unit = this.fields[row + 1][col - 1].current;
                        if (candidateUpper.same(candidateLower) && candidateUpper.same(candidateLeft)) {
                            spawns.push(
                                this.spawn(field, target, this.fields[row][col - 1], this.fields[row + 2][col - 1], candidateUpper.type)
                            );
                        }
                        if (candidateUpper.spawnable(candidateLeft) && candidateLeft.spawnable(candidateLower) && candidateLower.spawnable(candidateUpper)) {
                            const newType: UnitType = Rules.types.filter(t => !([UnitType.Source, UnitType.Obstacle, candidateUpper.type, candidateLeft.type, candidateLower.type].includes(t)))[0];
                            spawns.push(
                                this.spawn(field, target, this.fields[row][col - 1], this.fields[row + 2][col - 1], newType)
                            );
                        }
                    }

                    // Check right candidate
                    if (col < this.dimension - 1) {
                        const candidateRight: Unit = this.fields[row + 1][col + 1].current;
                        if (candidateUpper.same(candidateLower) && candidateUpper.same(candidateRight)) {
                            spawns.push(
                                this.spawn(field, target, this.fields[row][col + 1], this.fields[row + 2][col + 1], candidateUpper.type)
                            );
                        }
                        if (candidateUpper.spawnable(candidateRight) && candidateRight.spawnable(candidateLower) && candidateLower.spawnable(candidateUpper)) {
                            const newType: UnitType = Rules.types.filter(t => !([UnitType.Source, UnitType.Obstacle, candidateUpper.type, candidateRight.type, candidateLower.type].includes(t)))[0];
                            spawns.push(
                                this.spawn(field, target, this.fields[row][col + 1], this.fields[row + 2][col + 1], newType)
                            );
                        }
                    }
                }
            }
        }

        // Find spawns (corners)
        for (const corner of Rules.corners) {
            const target: Field = this.fields[corner[0][0]][corner[0][1]];
            const candidate1: Field = this.fields[corner[1][0]][corner[1][1]];
            const candidate2: Field = this.fields[corner[2][0]][corner[2][1]];
            const enemy: Field = this.fields[corner[3][0]][corner[3][1]];
            if (!candidate1.empty() &&
                candidate1.current.same(candidate2.current) &&
                (target.empty() || target.goal(candidate1.current.side)) &&
                (enemy.empty() || candidate1.current.friendly(enemy.current)) &&
                candidate1.current.side !== candidate1.territory()) {

                target.current = new Unit(candidate1.current.type, candidate1.current.side);
                spawns.push({row: target.row, column: target.column, unit: target.current} as FieldEvent);
            }
        }

        return {
            winner: this.conclude(),
            spawns: spawns.filter(s => s !== null),
            captures: captures
        } as TurnEvent;
    }


    public move(sourceRow: number, sourceCol: number, targetRow: number, targetCol: number): void {
        const sourceField: Field = this.fields[sourceRow][sourceCol];
        const targetField: Field = this.fields[targetRow][targetCol];

        if (!sourceField.empty()) {
            const side: Side = sourceField.current.side;
            let valid: boolean = true;

            // Check if move was in list of possible moves
            const targets = this.targets.filter(f =>
                f &&
                f.side === side &&
                f.from[0] === sourceField.row && f.from[1] === sourceField.column
            )[0];

            if (targets) {
                const target = targets.to.filter(t =>
                    t[0] === targetField.row && t[1] === targetField.column);

                if (!target) {
                    valid = false;
                }
            } else {
                valid = false;
            }

            // Check if dynamic preconditions are met (such as putting a piece on a place where a piece was previously)
            if (!targetField.empty()) {
                if (targetField.current.side === Side.Gray) {
                    valid = false;
                }
                if (sourceField.current.friendly(targetField.current)) {
                    valid = false;
                }
                if (sourceField.current.friendly(targetField.candidate(side))) {
                    valid = false;
                }
            }

            // Do the move if it is considered valid
            if (valid) {
                if (sourceField.current.side === Side.Green) {
                    targetField.greenCandidate = sourceField.current;
                }
                if (sourceField.current.side === Side.Red) {
                    targetField.redCandidate = sourceField.current;
                }

                sourceField.current = null;
            } else {
                // console.log("Move from " + sourceField.coord() + " to " + targetField.coord() + " considered invalid!");
            }
        }
    }

    public dirty_move(sourceRow: number, sourceCol: number, targetRow: number, targetCol: number): boolean {
        const sourceField: Field = this.fields[sourceRow][sourceCol];
        const targetField: Field = this.fields[targetRow][targetCol];

        if (sourceField.current.side === Side.Green) {
            if (targetField.greenCandidate !== null ) { return false; }
            targetField.greenCandidate = sourceField.current;
        }
        if (sourceField.current.side === Side.Red) {
            if (targetField.redCandidate !== null ) { return false; }
            targetField.redCandidate = sourceField.current;
        }

        sourceField.current = null;
        return true;
    }

    public inside(row: number, col: number): boolean {
        return row >= 0 && row < this.dimension && col >= 0 && col < this.dimension;
    }

    public moves(field: Field, side: Side): number[][] {

        if(!field) { return []; }

        const unit = field?.current;

        // Check side to move
        if (unit.side !== side) { return []; }

        // Check if any moves
        if (!this.targets) { return []; }

        const candidates = this.targets.filter(f => f && f.side === unit.side && f.from[0] === field.row && f.from[1] === field.column)[0];

        if(!candidates) { return []; }
        
        return candidates.to.filter(t => this.fields[t[0]][t[1]].targetable(unit.side));
    }

    private conclude(): Side {
        let winner: Side = null;
        let redSourceFound: boolean = false;
        let greenSourceFound: boolean = false;

        this.sources = {};

        // Search for red source on red territory
        for (let row = 0, n = Rules.territory[Side.Red]; row < n; row++) {
            for (let column = 0; column < this.dimension; column++) {
                const field = this.fields[row][column];
                if (field.current?.type === UnitType.Source && field.current?.side === Side.Red) {
                    redSourceFound = true;
                    this.sources[Side.Red] = field;
                    break;
                }
            }

            if(redSourceFound) { break; }
        }

        // Search for green source on green territory (backwards, cause its more likely for the source to be on the ground)
        for (let row = this.dimension - 1, n = Rules.territory[Side.Green]; row >= n; row--) {
            for (let column = 0; column < this.dimension; column++) {
                const field = this.fields[row][column];
                if (field.current?.type === UnitType.Source && field.current?.side === Side.Green) {
                    greenSourceFound = true;
                    this.sources[Side.Green] = field;
                    break;
                }
            }

            if(greenSourceFound) { break; }
        }

        // Detect end of game
        if (redSourceFound && greenSourceFound) {
            // Detect draw conditions
            // At least one side needs to have either two units of the same type
            // or at least three units of different type (source not included)
            const redUnits: Field[] = [];
            const greenUnits: Field[] = [];
            for(let row = 0, n = this.dimension; row < n; row++) {
                for(let col = 0; col < n; col++) {
                    const field = this.fields[row][col];

                    if (field.current !== null && field.current.type !== UnitType.Source) {
                        if(field.current.side === Side.Red) { redUnits.push(field); }
                        if(field.current.side === Side.Green) { greenUnits.push(field); }
                    }

                    if(redUnits.length > 2 || greenUnits.length > 2) { break; }
                }

                if(redUnits.length > 2 || greenUnits.length > 2) { break; }
            }

            if(redUnits.length < 3 && greenUnits.length < 3) {
                if(redUnits.length < 2 && greenUnits.length < 2) {
                    winner = Side.Gray;
                } else {
                    if(redUnits.length === 2 && redUnits[0].current.type === redUnits[1].current.type) {
                        winner = null;
                    }
                    if(greenUnits.length === 2 && redUnits[0].current.type === greenUnits[1].current.type) {
                        winner = null;
                    }
                }
            } else {
                winner = null;
            }
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
        if (corner1.empty() || corner1.current?.friendly(candidate.current) &&
            corner2.empty() || corner2.current?.friendly(candidate.current)) {
            // Check territory
            if (candidate.current?.side !== candidate.territory() && candidate.territory() !== Side.Gray &&
                corner1.current?.side !== corner1.territory() && corner1.territory() !== Side.Gray &&
                corner2.current?.side !== corner2.territory() && corner2.territory() !== Side.Gray) {
                // SPAWN!
                target.current = new Unit(type, candidate.current?.side);
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

        if (!sourceField.empty()) {

            // Check if source and blocked
            if (unit.type === UnitType.Source) {
                for (let rowOffset = -1; rowOffset <= 1; rowOffset++) {
                    for (let colOffset = -1; colOffset <= 1; colOffset++) {
                        const nextRow = row + rowOffset;
                        const nextCol = col + colOffset;
                        if (this.inside(nextRow, nextCol)) {
                            const candidate = this.fields[nextRow][nextCol].current;
                            if (candidate?.type && !unit.friendly(candidate)) {
                                for (const block of Rules.blocks[candidate.type]) {
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
            for (const move of Rules.moves[unit.type]) {
                const direction = (unit.side === Side.Green) ? -1 : 1;
                const offsetRow = move[0] * direction;
                const offsetCol = move[1];
                const nextRow = row + offsetRow;
                const nextCol = col + offsetCol;

                if (this.inside(nextRow, nextCol)) {

                    const field: Field = this.fields[nextRow][nextCol];
                    let possible: boolean = true;

                    // Can't jump multiple times on the same field
                    if (field.greenCandidate !== null && unit.side === Side.Green ||
                        field.redCandidate !== null && unit.side === Side.Red ||
                        field.current !== null && field.current.friendly(unit)) {
                        possible = false;
                    }

                    // Source can only run on his territory
                    if (unit.type === UnitType.Source && unit.side !== field.territory()) {
                        possible = false;
                    }

                    // Can't jump on gray
                    if (field.current?.side !== Side.Gray && possible) {

                        // Air can jump over everything
                        if (unit.type !== UnitType.Air) {

                            // Check diagonals
                            if (Math.abs(offsetRow) > 0 && Math.abs(offsetCol) > 0 && Math.abs(offsetRow) === Math.abs(offsetCol)) {
                                for (let d = 1; d <= Math.abs(offsetRow); d++) {
                                    const targetField: Field = this.fields[row + d * Math.sign(offsetRow)][col + d * Math.sign(offsetCol)]
                                    if (targetField.current?.type) {
                                        if (d < Math.abs(offsetRow)) {
                                            possible = false;
                                        }
                                    }
                                }
                            }

                            // Check vertical movement
                            if (Math.abs(offsetRow) > 0 && offsetCol === 0) {
                                for (let d = 1; d <= Math.abs(offsetRow); d++) {
                                    const targetField: Field = this.fields[row + d * Math.sign(offsetRow)][col]
                                    if (targetField.current?.type) {
                                        if (d < Math.abs(offsetRow)) {
                                            possible = false;
                                        }
                                    }
                                }
                            }

                            // Check horizontal movement
                            if (offsetRow === 0 && Math.abs(offsetCol) > 0) {
                                for (let d = 1; d <= Math.abs(offsetCol); d++) {
                                    const targetField: Field = this.fields[row][col + d * Math.sign(offsetCol)]
                                    if (targetField.current?.type) {
                                        if (d < Math.abs(offsetCol)) {
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

        if (result.length > 0) {
            return {from: [row, col], to: result, side: sourceField.current.side} as Direction;
        } else {
            return null; //{from: [row, col], to: result, side: Side.Gray} as Direction;
        }
    }

    private near(row1: number, col1: number, row2: number, col2: number): boolean {
        return row1 >= (row2 - 1) &&
               row1 <= (row2 + 1) &&
               col1 >= (col2 - 1) &&
               col1 <= (col2 + 1)
    }

    public dirty_eval(side: Side, opponent: Side): number {
        let score = 0;

        for(let row = 0, n = this.dimension; row < n; row++) {
            for (let col = 0; col < n; col++) {
                const field = this.fields[row][col];
                if (field.current?.side === side) {
                    score += (field.territory() === Side.Gray ? 100 : 0); // unit on neutral territory
                    score += (field.territory() === opponent ? 200 : 0); // unit on enemy territory
                }
            }
        }

        return score;
    }

    public dirty_all_moves(side: Side, moves: Move[]): number {
        let result = 0;

        for(let row = 0, n = this.dimension; row < n; row++) {
            for (let col = 0; col < n; col++) {
                // TODO: CONTINUE WORK HERE
                let calculate = false;

                for (const move of moves) {
                    if (this.near(row, col, move.from[0], move.from[1]) ||
                        this.near(row, col, move.to[0], move.to[1])) {
                        calculate = true;
                        break;
                    }
                }

                if (calculate) {
                    const field = this.fields[row][col];
                    if (field.current?.side === side) {
                        const direction = this.findMoves(this.fields[row][col]);
                        if (direction !== null) {
                            result += direction.to.length;
                        }
                    }
                }
            }
        }

        return result;
    }

    public dirty_moves(field: Field): number {
        const direction = this.findMoves(field);
        if (direction !== null) {
            return direction.to.length;
        }

        return 0;
    }

    public findAllMoves(): Direction[] {
        const result: Direction[] = [];

        // No map()/filter()/concat() used here because of performance
        for(let row = 0, n = this.fields.length; row < n; row++) {
            for (let col = 0; col < n; col++) {
                const direction = this.findMoves(this.fields[row][col]);
                if (direction !== null) {
                    result.push(direction);
                }
            }
        }

        return result;

        // for reference only:
        //return [].concat.apply([], [].concat.apply([], this.fields.map(l => l.map(f => this.findMoves(f)).filter(m => m !== null))));        
    }

}
