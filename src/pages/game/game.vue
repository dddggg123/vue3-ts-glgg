<template>
    <div class="game-container">
        <div class="game-content">
            <div class="game-header-section flex-c">
                <p class="game-title">果了个果</p>
            </div>
            <div ref="containerRef" class="game-card-section">
                <Card v-for="(item, index) in nodes" :node="item"></Card>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import Card from '@/components/card/Card.vue';
import type { CardNode, GameConfig } from "../../types/type";
import { initGame } from './game';
import { ref, onMounted } from 'vue';

const containerRef = ref<HTMLElement | undefined>()

const handleClickCard = () => {

}

const handleDropCard = () => {

}

const handleWin = () => {

}

const handleLose = () => {

}

const {
    nodes,
    selectedNodes,
    removeFlag,
    removeList,
    backFlag,
    selectCardHandler,
    rollbackOneCardHandler,
    removeThreeCardHandler,
    selectCardAndRemoveHandler,
    initCardList,
} = initGame({
    container: containerRef,
    cardNum: 5,
    layerNum: 3,
    trap: false,
    events: {
        clickCallback: handleClickCard,
        dropCallback: handleDropCard,
        winCallback: handleWin,
        loseCallback: handleLose,
    },
})

onMounted(() => {
    initCardList()
})
</script>

<style lang="scss" scoped>
.game-container {
    background-color: #c3fe8b;
    height: 100%;

    .game-content {
        width: 500px;
        height: 100%;
        margin: 0 auto;

        .game-header-section {
            height: 100px;
            display: flex;

            .game-title {
                font-size: 44px;
                font-weight: 600;
            }
        }

        .game-card-section {
            height: 80%;
            position: relative;
        }
    }
}
</style>