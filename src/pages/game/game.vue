<template>
    <div class="game-container">
        <div class="game-content">
            <div class="game-header-section flex-c">
                <p class="game-title">果了个果</p>
            </div>
            <div ref="containerRef" class="game-card-section">
                <template v-for="item in nodes" :key="item.id">
                    <!-- <transition name="slide-fade">
                        <Card v-if="confirmCardVisible(item.state)" @cardTap="selectCardHandler" :node="item"></Card>
                    </transition> -->
                    <Card v-if="confirmCardVisible(item.state)" @cardTap="selectCardHandler" :node="item"></Card>
                </template>
            </div>
            <div class="game-store-section flex-c">
                <div class="game-store-content flex-l">
                    <template v-for="item in selectedNodes" :key="item.id">
                        <!-- <transition name="bounce">
                            <Card v-if="item.state === 2" :node="item" is-dock />
                        </transition> -->
                        <Card v-if="item.state === 2" :node="item" is-dock />
                    </template>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import Card from '@/components/card/Card.vue';
import type { CardNode, GameConfig } from "../../types/type";
import initGame from './game';
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

const cardTapHandler = (card: CardNode) => {

}

// 卡片四种状态  0： 无状态  1： 可点击 2：已选 3：已消除
const confirmCardVisible = (state: number): boolean => {
    return [0, 1].includes(state);
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
            height: 70%;
            position: relative;

            // .slide-fade-enter-active {
            //     transition: all 1.2s ease-out;
            // }
            .slide-fade-enter-active,
            .slide-fade-leave-active {
                transition: all .5s ease-in-out;
            }

            .slide-fade-enter-from,
            .slide-fade-leave-to {
                transform: translateY(50vh);
                opacity: 0;
            }
        }

        .game-store-section {
            height: calc(30% - 100px);

            .game-store-content {
                box-sizing: content-box;
                width: 420px;
                height: 60px;
                background-color: #965a1c;
                border: 10px #c1812f solid;
                border-radius: 5px;

                .bounce-enter-active {
                    animation: bounce-in 0.5s;
                }

                .bounce-leave-active {
                    animation: bounce-in 0.5s reverse;
                }

                @keyframes bounce-in {
                    0% {
                        transform: scale(0);
                    }

                    50% {
                        transform: scale(1.25);
                    }

                    100% {
                        transform: scale(1);
                    }
                }
            }
        }
    }
}
</style>