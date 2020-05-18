import Game from "../engine/game";
import AI from "../ai/ai";

interface GameEntry {
    game: Game;
    password: string;
    ai: AI;
}

export default GameEntry;