'use strict'

import { openStdin } from 'process'
import build from './app'

const start = async () => {
  console.log("Starting TicTacToe server")
  const server = await build()
  try {
    await server.listen({port: +(process.env.PORT || 7778)}, (err,addr)=>{
      if (err) {
        console.log("ERROR: couldn't start server: ", err)
        process.exit(1)
      }
      console.log("listening on ",addr)
    })
  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
}
start()
