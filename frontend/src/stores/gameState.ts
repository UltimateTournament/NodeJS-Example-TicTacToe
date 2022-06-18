import { defineStore } from 'pinia'
import type { Socket } from 'socket.io-client'
import { io } from 'socket.io-client'

export enum gameStates {
  waitingForPlayers = "waiting-for-players",
  xTurn = "X-turn",
  oTurn = "O-turn",
  xWon = "X-won",
  oWon = "O-won",
  draw = "draw",
}

const opponentSymbol = {"X":"O", "O":"X"}

export const gameState = defineStore({
  id: 'game',
  state: () => ({
    socket: null as Socket | null,
    isConnected: false,
    ourSymbol: null as "X"|"O"|null ,
    ourID: '',
    opponentName: '',
    state: '' as gameStates,
    board: [["?", "?", "?"], ["?", "?", "?"], ["?", "?", "?"]]
  }),
  /*getters: {
    doubleCount: (state) => state.counter * 2
  },*/
  actions: {
    connect(addr: string, token: string) {
      this.socket = io(addr, {autoConnect: true})
      this.socket.on('connect', () => {
        console.log("connect")
        this.isConnected = true
        // will be empty at the beginning but will contain our server-assigned identity for reconnects
        const joinMsg = { playerID: this.ourID, token: token }
        this.socket!.emit('join', joinMsg)
      })
      this.socket.on('join.response', (msg: { playerID: string, state: gameStates, symbol: "X"|"O", refused?: false } | { refused: true }) => {
        console.log("join.response")
        if (msg.refused) {
          console.log("TODO join refused")
          return
        }
        this.ourID = msg.playerID
        this.ourSymbol = msg.symbol
        this.state = msg.state
      })
      this.socket.on('game.state', (msg: { state: gameStates, board: string[][], names: Record<string,string> }) => {
        console.log("game.state")
        this.state = msg.state
        this.board = msg.board
        this.opponentName = msg.names[opponentSymbol[this.ourSymbol!]]
      })
      this.socket.on('play.response', e => {
        console.log("play.response")
      })
    },
    play(moveX: number, moveY: number) {
      const playMsg = { playerID: this.ourID, moveX: moveX, moveY: moveY }
      this.socket!.emit('play', playMsg)
    }
  }
})
