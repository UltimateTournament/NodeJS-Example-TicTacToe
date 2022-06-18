<script setup lang="ts">
import { gameState } from '@/stores/gameState'
import { uaState } from '@/stores/UAState';
import Game from '@/components/Game.vue'
import HelloWorld from '@/components/HelloWorld.vue'

</script>
<script lang="ts">
export default {
  data() {
    return {
      game: gameState(),
      ua: uaState(),
    }
  },
  async mounted() {
    if (!this.game.isConnected) {
      await this.ua.init()
      const serverAddress = /localhost|127.0.0.1(:\d+)?/.test(window.location.hostname) ?
        "ws://localhost:7778/" :
        window.location.protocol + "//" + this.ua.serverAddress
      this.game.connect(serverAddress, this.ua.token)
    }
  }
}
</script>

<template>
  <header>
    <img alt="Vue logo" class="logo" src="@/assets/logo.svg" width="125" height="125" />
    <div class="wrapper">
      <p v-if="!game.isConnected">connecting...</p>
      <HelloWorld v-if="game.isConnected" msg="This is TicTacToe!" />
    </div>
  </header>

  <Game v-if="game.isConnected"/>
</template>

<style>
@import '@/assets/base.css';

#app {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;

  font-weight: normal;
}

header {
  line-height: 1.5;
  max-height: 100vh;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

a,
.green {
  text-decoration: none;
  color: hsla(160, 100%, 37%, 1);
  transition: 0.4s;
}
</style>
