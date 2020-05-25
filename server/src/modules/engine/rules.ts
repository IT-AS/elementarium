import {UnitType} from "./enums/unittype";
import {Side} from "./enums/side";

class Rules {

    static boardsize: number = 11;

    static types: UnitType[] =
        [
            UnitType.Source,
            UnitType.Earth,
            UnitType.Air,
            UnitType.Fire,
            UnitType.Water,
            UnitType.Obstacle
        ];

    static sides: Side[] =
        [
            Side.Green,
            Side.Red,
            Side.Gray
        ];

    static opponent(side: Side): Side {
        switch(side) {
            case Side.Green:
                return Side.Red;
            case Side.Red:
                return Side.Green;
            default:
                return Side.Gray;
        }
    }

    static corners: number[][][] =
        [
            [ [0,0], [0,1], [1,0], [1,1] ],
            [ [0,10], [0,9], [1,10], [1,9] ],
            [ [10,0], [10,1], [9,0], [9,1] ],
            [ [10,10], [10,9], [9,10], [9,9] ]
        ];

    static units: any = {
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

    static clashes: any = {
        "Earth": ["Water", "Air", "Fire"],
        "Air": ["Earth", "Fire", "Water"],
        "Fire": ["Air", "Water", "Earth"],
        "Water": ["Fire", "Earth", "Air"],
    }

    static moves = {
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

    static blocks = {
        "Earth": [ [ 1, 0], [ 1, 1], [ 1,-1], [ 0, 1],
                    [ 0,-1], [-1, 0], [-1, 1], [-1,-1] ],
        "Water": [ [ 1, 0], [ 0, 1], [ 0,-1], [-1, 0] ],
        "Fire": [ [ 1, 1], [ 1, 0], [ 1,-1],
                    [-1, 1], [-1, 0], [-1,-1] ],
        "Air": [],
        "Source": []
    }
}

export default Rules;
