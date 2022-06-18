<script setup lang="ts">
import {gameState} from "@/stores/gameState";
import { uaState } from '@/stores/UAState';
</script>
<script lang="ts">
export default {
  data() {
    return {
      state: gameState(),
      ua: uaState(),
    }
  },
  methods: {
    place(x: number, y: number) {
      console.log("placing at ",x,y)
      this.state.play(x,y)
    }
  }
}
</script>

<template>
  <h3>You (<b>{{ua.playerInfo.display_name}}</b>) are playing as {{state.ourSymbol}} against <b>{{state.opponentName}}</b></h3>
  <h4>{{state.state}}</h4>
  <div class="row">
    <div class="box" @click="place(0,0)">{{state.board[0][0]}}</div>
    <div class="box" @click="place(1,0)">{{state.board[0][1]}}</div>
    <div class="box" @click="place(2,0)">{{state.board[0][2]}}</div>
  </div>
  <div>
    <div class="box" @click="place(0,1)">{{state.board[1][0]}}</div>
    <div class="box" @click="place(1,1)">{{state.board[1][1]}}</div>
    <div class="box" @click="place(2,1)">{{state.board[1][2]}}</div>
  </div>
  <div>
    <div class="box" @click="place(0,2)">{{state.board[2][0]}}</div>
    <div class="box" @click="place(1,2)">{{state.board[2][1]}}</div>
    <div class="box" @click="place(2,2)">{{state.board[2][2]}}</div>
  </div>
</template>

<style scoped>
.row {
  width: 35rem;
  padding: 0.1rem;
  margin: 0.1rem;
}
.box {
  display: inline-block;
  padding: 0.1rem;
  margin: 0.1rem;
  width: 10rem;
  height: 10rem;
  border-radius: 1rem;
  background-color: #40454a;
  font-weight: 900;
  font-size: 8rem;
  color:#2789ec;
  text-align: center;
  vertical-align: bottom;
  line-height: 9rem;
  cursor: pointer;
}
</style>