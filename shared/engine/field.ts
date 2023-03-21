import {Side} from "./enums/side";
import {UnitType} from "./enums/unittype";
import {FieldEvent} from "./events/fieldEvent";

import Rules from "./rules";
import Unit from "./unit";

export default class Field {
    public row: number;
    public column: number;
    public clashed: boolean;

    public current: Unit;
    public greenCandidate: Unit;
    public redCandidate: Unit;

    constructor(row: number, column: number) {
        this.row = row;
        this.column = column;
        this.clashed = false;

        this.current = null;
        this.greenCandidate = null;
        this.redCandidate = null;
    }

    static clone(source: Field): Field {
        if(!source) { return source; }

        const field: Field = new Field(source.row, source.column);

        field.clashed = source.clashed;
        field.current = Unit.clone(source.current);
        field.greenCandidate = Unit.clone(source.greenCandidate);
        field.redCandidate = Unit.clone(source.redCandidate);

        return field;
    }

    public coord(): string {
        return `r${this.row}-c${this.column}`;
    }

    public territory(): Side {
        if (this.row < Rules.territory[Side.Red]) {
            return Side.Red;
        }
        if (this.row < Rules.territory[Side.Green]) {
            return Side.Gray;
        }
        return Side.Green;
    }

    public empty(): boolean {
        return (this.current === null);
    }

    public goal(side: Side): boolean {
        return !this.empty() && this.current.type === UnitType.Source && this.current.side !== side;
    }

    public candidate(side: Side): Unit {
        switch (side) {
            case Side.Red:
                return this.redCandidate;
            case Side.Green:
                return this.greenCandidate;
            default:
                return null;
        }
    }

    public targetable(side: Side) {
        return side && 
            !this.candidate(side)?.type &&
            !this.goal(side) &&
            (this.empty() || this.current?.side !== side);
    }

    public prepare(): void {

        // Unit already on this field is also a candidate
        if (this.current) {
            if (this.current.side === Side.Red) {
                this.redCandidate = this.current;
            }
            if (this.current.side === Side.Green) {
                this.greenCandidate = this.current;
            }
        }
    }

    public clash(): FieldEvent[] {
        const result: FieldEvent[] = [];

        // Here the clash begins
        if (this.greenCandidate !== null && this.redCandidate !== null) {
            if (this.greenCandidate.type === this.redCandidate.type) {
                this.current = null;

                result.push({row: this.row, column: this.column, unit: this.greenCandidate} as FieldEvent);
                result.push({row: this.row, column: this.column, unit: this.redCandidate} as FieldEvent);
            } else if (this.greenCandidate.type === UnitType.Source) {
                this.current = this.greenCandidate;
                result.push({row: this.row, column: this.column, unit: this.redCandidate} as FieldEvent);
            } else if (this.redCandidate.type === UnitType.Source) {
                this.current = this.redCandidate;
                result.push({row: this.row, column: this.column, unit: this.greenCandidate} as FieldEvent);
            } else {
                const pattern = Rules.clashes[this.greenCandidate.type.toString()];
                if (pattern) {
                    if (this.redCandidate.type === pattern[0]) {
                        this.current = this.greenCandidate;

                        result.push({row: this.row, column: this.column, unit: this.redCandidate} as FieldEvent);
                    }
                    if (this.redCandidate.type === pattern[1]) {
                        this.current = this.redCandidate;

                        result.push({row: this.row, column: this.column, unit: this.greenCandidate} as FieldEvent);
                    }
                    if (this.redCandidate.type === pattern[2]) {
                        this.current = null;

                        result.push({row: this.row, column: this.column, unit: this.greenCandidate} as FieldEvent);
                        result.push({row: this.row, column: this.column, unit: this.redCandidate} as FieldEvent);
                    }
                }
            }

            this.clashed = true;
        } else {
            if (this.greenCandidate !== null) {
                this.current = this.greenCandidate;
            }
            if (this.redCandidate !== null) {
                this.current = this.redCandidate;
            }
        }

        this.greenCandidate = null;
        this.redCandidate = null;

        return result;
    }
}
