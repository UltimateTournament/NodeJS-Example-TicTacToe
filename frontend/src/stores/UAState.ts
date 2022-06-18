import { defineStore } from 'pinia'
import {getSDK} from '@ultimatearcade/client-sdk'
import type {PlayerInfo} from '@ultimatearcade/client-sdk'

export const uaState = defineStore({
  id: 'ultimate-arcade',
  state: () => ({
    _uaSDK: getSDK(),
    playerInfo: {} as PlayerInfo,
    serverAddress: '',
    token: '',
  }),
  actions: {
    async init() {
      if (!this.token) {
        let si = await this._uaSDK.getSessionInfo()
        this.serverAddress = si.server_address
        this.token = si.player_token
        this.playerInfo = await this._uaSDK.getPlayerProfile()
      }
    },
    async gameOver() {
      await this._uaSDK.gameOver()
    }
  }
})
