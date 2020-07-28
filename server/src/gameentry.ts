import Game from "../../shared/engine/game";
import AI from "./modules/ai/ai";
import { Side } from "../../shared/engine/enums/side";

export interface GameEntry {
    game: Game;
    password: string;
    tokens: Map<string, Side>;
    ai: AI;
}
