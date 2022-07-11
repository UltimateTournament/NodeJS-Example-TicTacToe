import { defineStore } from 'pinia'
import {getSDK} from '@ultimatearcade/client-sdk'
import type {PlayerInfo} from '@ultimatearcade/client-sdk'
import { toRaw } from 'vue'

interface Settings {
  backgroundColor?: string;
}

export const uaState = defineStore({
  id: 'ultimate-arcade',
  state: () => ({
    _uaSDK: getSDK(),
    playerInfo: {} as PlayerInfo,
    serverAddress: '',
    token: '',
    settings: {
      backgroundColor: 'var(--color-background)',
    } as Settings,
  }),
  actions: {
    async init() {
      if (!this.token) {
        let si = await this._uaSDK.getSessionInfo()
        this.serverAddress = si.server_address
        this.token = si.player_token
        this.settings = {
          ...this.settings,
          ...si.settings,
        },
        this.playerInfo = await this._uaSDK.getPlayerProfile()
      }
    },
    async gameOver() {
      await this._uaSDK.gameOver()
    },
    storeSettings() {
      this._uaSDK.storeSettings(toRaw(this.settings))
    }
  }
})
