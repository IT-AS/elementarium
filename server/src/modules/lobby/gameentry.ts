import Game from "../engine/game";
import AI from "../ai/ai";

export interface GameEntry {
    game: Game;
    password: string;
    ai: AI;
}
