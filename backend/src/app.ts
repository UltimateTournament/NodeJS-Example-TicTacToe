import type { ArcadeServerSDK } from '@ultimatearcade/server-sdk';
import fastify from 'fastify'
import socketioServer from 'fastify-socket.io';
import { TicTacToe } from './game';

async function build(uaSDK: ArcadeServerSDK) {
  const app = fastify({})
  await app.register(require('@fastify/cors'), {
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  })
  await app.register(socketioServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    },
  })
  let game = new TicTacToe(uaSDK)
  game.start()

  app.io.on('connection', socket => {
    let playerID = ""
    socket.on('join', async msg => {
      console.log("got join ", msg)
      const join = await game.join(msg)
      if (join.refused) {
        // kick the player as the game didn't allow them to join
        console.log("refusing player")
        socket.disconnect(true);
        return;
      }
      playerID = join.player_id
      if (join.response) {
        socket.emit('join.response', join.response)
      }
      if (join.gameState) {
        app.io.emit("game.state", join.gameState)
      }
    })

    socket.on('play', async msg => {
      console.log("got play ", msg)
      const { response, gameState, gameOver } = await game.play(playerID, msg)
      if (response) {
        socket.emit('play.response', response)
      }
      if (gameState) {
        app.io.emit("game.state", gameState)
      }
      if (gameOver) {
        console.log("game has ended")
        process.exit(0)
      }
    })
  })

  return app
}

export default build
