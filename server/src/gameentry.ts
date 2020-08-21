import Game from "../../shared/engine/game";
import AI from "./modules/ai/ai";
import { Token } from "./token";

export interface GameEntry {
    game: Game;
    password: string;
    tokens: Token[];
    ai: AI;
}
