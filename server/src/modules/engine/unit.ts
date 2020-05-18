import UnitType from "./enums/unittype";
import Side from "./enums/side";

class Unit {
    public type : UnitType;
    public side : Side;

    constructor(type: UnitType, side: Side){
        this.type = type;
        this.side = side;
    }

    public name() : string {
        return this.side[0].toUpperCase() + this.side.toString().slice(1) + " " + this.type;
    }

    public same(other: Unit) {
        return this.type === other.type && this.friendly(other);
    }

    public friendly(other: Unit) {
        return this.side === other.side;
    }

    public spawnable(other: Unit) {
        return this.friendly(other) && !this.same(other) && this.type !== UnitType.Source;
    }
}

export default Unit;