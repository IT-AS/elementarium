import Player from "../engine/player";

export interface GameInfo {
    gameId: string;
    players: Player[];
    turn: number;
};
