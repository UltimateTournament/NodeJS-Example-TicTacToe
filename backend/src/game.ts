import { nanoid } from 'nanoid'

enum gameStates {
    waitingForPlayers = "waiting-for-players",
    xTurn = "X-turn",
    oTurn = "O-turn",
    xWon = "X-won",
    oWon = "O-won",
    draw = "draw",
}

export class TicTacToe {

    private players: Record<string, { symbol: string }> = {}
    private playerCount = 0
    private currentPlayer = ""
    private state: gameStates = gameStates.waitingForPlayers
    private board = [
        ["", "", ""],
        ["", "", ""],
        ["", "", ""]]

    join(msg: { playerID?: string }): {
        response: { playerID: string, state: gameStates, symbol: string } | { refused: true };
        gameState?: { state: gameStates, board: string[][] };
        refused: boolean
    } {

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
        if (this.playerCount === 0) {
            this.playerCount++
            const playerID = nanoid()
            this.currentPlayer = playerID
            this.players[playerID] = { symbol: "X" }
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
            this.players[playerID] = { symbol: "O" }
            this.state = gameStates.xTurn
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

    play(msg: { playerID: string, moveX: number, moveY: number }): {
        response?: never;
        gameState?: { state: gameStates, board: string[][] };
        gameOver: boolean
    } {
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
            } else {
                this.state = gameStates.oWon
            }
        } else if (this.boardFull()) {
            this.state = gameStates.draw
            this.currentPlayer = ""
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