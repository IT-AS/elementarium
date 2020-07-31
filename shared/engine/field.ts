import {Side} from "./enums/side";
import {UnitType} from "./enums/unittype";
import {FieldEvent} from "./events/fieldEvent";

import Rules from "./rules";
import Unit from "./unit";

export default class Field {
    public row: number;
    public column: number;

    public current: Unit;
    public greenLast: Unit;
    public greenCandidate: Unit;
    public redLast: Unit;
    public redCandidate: Unit;

    public moveHere: boolean;

    constructor(row: number, column: number) {
        this.row = row;
        this.column = column;
        this.moveHere = false;

        this.current = null;
        this.greenLast = null;
        this.greenCandidate = null;
        this.redLast = null;
        this.redCandidate = null;
    }

    static clone(source: Field): Field {
        if(!source) { return source; }

        const field: Field = new Field(source.row, source.column);

        field.moveHere = source.moveHere;

        field.current = Unit.clone(source.current);
        field.greenLast = Unit.clone(source.greenLast);
        field.greenCandidate = Unit.clone(source.greenCandidate);
        field.redLast = Unit.clone(source.redLast);
        field.redCandidate = Unit.clone(source.redCandidate);

        return field;
    }

    public coord(): string {
        return "[" + this.row + ", " + this.column + "]";
    }

    public territory(): Side {
        if (this.row < 4) {
            return Side.Red;
        }
        if (this.row < 7) {
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

    public prepare(): void {
        // Remove previous guys
        this.redLast = null;
        this.greenLast = null;

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
        if (this.greenCandidate.type && this.redCandidate.type) {
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
        } else {
            if (this.greenCandidate.type) {
                this.current = this.greenCandidate;
            }
            if (this.redCandidate.type) {
                this.current = this.redCandidate;
            }
        }

        this.greenCandidate = null;
        this.redCandidate = null;

        this.greenLast = null;
        this.redLast = null;

        return result;
    }
}
