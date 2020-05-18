import Player from "../engine/player";

interface GameInfo {
    gameId: string;
    players: Player[];
    turn: number;
}

export default GameInfo;