import Game from "../../shared/engine/game";
import AI from "./modules/ai/ai";

export interface GameEntry {
    game: Game;
    password: string;
    ai: AI;
}
