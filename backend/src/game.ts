import type { ArcadeServerSDK } from '@ultimatearcade/server-sdk'
import { nanoid } from 'nanoid'

enum gameStates {
    waitingForPlayers = "waiting-for-players",
    xTurn = "X-turn",
    oTurn = "O-turn",
    xWon = "X-won",
    oWon = "O-won",
    draw = "draw",
}

class Player { symbol: "X" | "O"; token: string }

interface PublicGameState { 
    state: gameStates
    board: string[][]
    names: Record<"X" | "O", string> 
}

export class TicTacToe {

    private players: Record<string, Player> = {}
    private playerCount = 0
    private currentPlayer = ""
    private state: gameStates = gameStates.waitingForPlayers
    private names = { O: "", X: "" }
    private board = [
        ["", "", ""],
        ["", "", ""],
        ["", "", ""]]

    constructor(private uaSDK: ArcadeServerSDK) {
    }

    private getPlayer(s: "X" | "O") {
        for (const pid in this.players) {
            if (this.players[pid].symbol === s) {
                return this.players[pid]
            }
        }
    }

    async join(msg: { playerID?: string, token: string }): Promise<{
        response: { playerID: string, state: gameStates, symbol: string } | { refused: true },
        gameState?: PublicGameState,
        refused: boolean
    }> {
        if (!msg.token) {
            return {
                refused: true,
                response: {
                    refused: true
                }
            }
        }
        if (msg.playerID) {
            if (this.players[msg.playerID]) {
                return {
                    refused: false,
                    response: {
                        playerID: msg.playerID,
                        symbol: this.players[msg.playerID].symbol,
                        state: this.state,
                    }
                }
            }
        }
        let playerName = ""
        try {
            const actResp = (await this.uaSDK.activatePlayer(msg.token)) as any as { display_name: string }
            playerName = actResp.display_name
        } catch (err) {
            console.log("couldn't activate player: ", err)
            return {
                refused: true,
                response: {
                    refused: true
                }
            }
        }
        if (this.playerCount === 0) {
            this.playerCount++
            const playerID = nanoid()
            this.currentPlayer = playerID
            this.players[playerID] = { symbol: "X", token: msg.token }
            this.names.X = playerName
            return {
                refused: false,
                response: {
                    playerID,
                    symbol: this.players[playerID].symbol,
                    state: this.state,
                },
                gameState: {
                    state: this.state,
                    board: this.board,
                    names: this.names,
                }
            }
        }
        if (this.playerCount === 1) {
            this.playerCount++
            for (const p in this.players) {
                // X starts
                this.currentPlayer = p
            }
            const playerID = nanoid()
            this.players[playerID] = { symbol: "O", token: msg.token }
            this.names.O = playerName
            this.state = gameStates.xTurn
            await this.uaSDK.lockPool()
            return {
                refused: false,
                response: {
                    playerID: playerID,
                    symbol: this.players[playerID].symbol,
                    state: this.state,
                },
                gameState: {
                    state: this.state,
                    board: this.board,
                    names: this.names,
                }
            }
        }
        return {
            refused: true,
            response: {
                refused: true,
            }
        }
    }

    async play(msg: { playerID: string, moveX: number, moveY: number }): Promise<{
        response?: never;
        gameState?: PublicGameState;
        gameOver: boolean
    }> {
        if (this.currentPlayer != msg.playerID) {
            // not your turn
            return { gameOver: false }
        }
        if (msg.moveY < 0 || msg.moveY > 2 || msg.moveX < 0 || msg.moveX > 2 || this.board[msg.moveY][msg.moveX]) {
            // invalid move
            return { gameOver: false }
        }
        this.board[msg.moveY][msg.moveX] = this.players[msg.playerID].symbol
        // it's the other player's turn
        for (const p in this.players) {
            if (p != this.currentPlayer) {
                this.currentPlayer = p
                break
            }
        }
        const winnerSymbol = this.getWinner()
        if (winnerSymbol != "") {
            this.currentPlayer = ""
            if (winnerSymbol == "X") {
                this.state = gameStates.xWon
                const loser = this.getPlayer("O")?.token!
                const winner = this.getPlayer("X")?.token!
                await this.uaSDK.playerDefeated(loser, winner)
                await this.uaSDK.settlePool(winner)
            } else {
                this.state = gameStates.oWon                
                const loser = this.getPlayer("O")?.token!
                const winner = this.getPlayer("X")?.token!
                await this.uaSDK.playerDefeated(loser, winner)
                await this.uaSDK.settlePool(winner)
            }
        } else if (this.boardFull()) {
            this.state = gameStates.draw
            this.currentPlayer = ""
            await this.uaSDK.returnPool("draw")
        } else {
            if (this.players[this.currentPlayer].symbol == "X") {
                this.state = gameStates.xTurn
            } else {
                this.state = gameStates.oTurn
            }
        }
        return {
            gameOver: this.state == gameStates.xWon || this.state == gameStates.oWon || this.state == gameStates.draw,
            gameState: {
                board: this.board,
                state: this.state,
                names: this.names,
            }
        }
    }

    boardFull() {
        for (const r of this.board) {
            for (const b of r) {
                if (!b) {
                    return false
                }
            }
        }
        return true
    }

    getWinner(): string {
        const b = this.board;
        // rows
        for (let i = 0; i < 3; i++) {
            if (b[i][0] != "" && b[i][0] == b[i][1] && b[i][0] == b[i][2]) {
                return b[i][0]
            }
        }
        // columns
        for (let i = 0; i < 3; i++) {
            if (b[0][i] != "" && b[0][i] == b[1][i] && b[0][i] == b[2][i]) {
                return b[0][i]
            }
        }
        // diag \
        if (b[0][0] != "" && b[0][0] == b[1][1] && b[0][0] == b[2][2]) {
            return b[0][0]
        }
        // diag /
        if (b[0][2] != "" && b[0][2] == b[1][1] && b[0][2] == b[2][0]) {
            return b[0][2]
        }
        return ""
    }

}