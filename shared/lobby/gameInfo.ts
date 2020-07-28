import Player from "../engine/player";

export interface GameInfo {
    gameId: string;
    name: string;
    players: Player[];
    turn: number;
};
