import Game from "../../shared/engine/game";
import { Token } from "./token";

export interface GameEntry {
    game: Game;
    password: string;
    tokens: Token[];
    ai: boolean;
}
