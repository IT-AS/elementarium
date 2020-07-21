import { GameInfo } from '../../../../../../shared/lobby/gameInfo'

export default interface LobbyState {
    games: GameInfo[]
}

export const InitialState: LobbyState = {
    games: []
};