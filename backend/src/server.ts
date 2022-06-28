'use strict'

import build from './app'
import { getSDK } from '@ultimatearcade/server-sdk'

const start = async () => {
  console.log("Starting TicTacToe server")
  const uaSDK = getSDK()
  console.log("waiting for game getting allocated")
  try {
    const ss = await uaSDK.getServerStatus()
    console.log("game allocated: ", ss)
    const server = await build(uaSDK)
    await server.listen({ port: +(process.env.PORT || 7778) }, (err, addr) => {
      if (err) {
        console.log("ERROR: couldn't start server: ", err)
        process.exit(1)
      }
      console.log("listening on ", addr)
    })
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}
process.on("SIGINT", function () {
    process.exit();
});
start()
