<script setup lang="ts">
import Game from '@/components/Game.vue'
import { gameState } from '@/stores/gameState'

</script>
<script lang="ts">
export default {
  data() {
    return {
      game: gameState(),
    }
  },
  mounted() {
    if (!this.game.isConnected) {
      // TODO get dynamically
      this.game.connect("http://localhost:7778")
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

  <Game />
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
