<template>
    <div class="game-container">
        <div class="game-content">
            <div class="game-header-section flex-c">
                <p class="game-title">果了个果</p>
            </div>
            <div ref="containerRef" class="game-card-section">
                <div v-for="(item, index) in state.grassList" :key="index" class="grass-item">
                    <img :src="item.url" class="grass-img">
                </div>
                <template v-for="item in nodes" :key="item.id">
                    <transition name="fade">
                        <Card v-if="confirmCardVisible(item.state)" @cardTap="selectCardHandler" :node="item"></Card>
                    </transition>
                </template>
            </div>
            <div class="game-store-section flex-c">
                <div class="game-store-content flex-l">
                    <template v-for="item in selectedNodes" :key="item.id">
                        <Card v-if="item.state === 2" :isDock="true" :node="item"></Card>
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
import { ref, onMounted, reactive } from 'vue';
import Grass1 from '@/assets/icons/grass1.png';
import Grass2 from '@/assets/icons/grass2.png';
import { showSuccessAnimation } from '../../utils/util';

type grassObj = {
    url: string
}

const containerRef = ref<HTMLElement | undefined>()
const state = reactive({
    grassList: [
    ] as Array<grassObj>,
    levelConfig: [
        {
            cardNum: 3,
            layerNum: 2,
            trap: false,
        }, {
            cardNum: 5,
            layerNum: 4,
            trap: false,
        }, {
            cardNum: 8,
            layerNum: 6,
            trap: false,
        }, {
            cardNum: 10,
            layerNum: 7,
            trap: false,
        }
    ]
})

const handleClickCard = () => {

}

const handleDropCard = () => {

}

const handleWin = () => {
    console.log('胜利了');
    showSuccessAnimation();
}

const handleLose = () => {
    console.log('失败了');
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
    events: {
        clickCallback: handleClickCard,
        dropCallback: handleDropCard,
        winCallback: handleWin,
        loseCallback: handleLose,
    },
    ...state.levelConfig[0]
})

onMounted(() => {
    initGrassList();
    initCardList();
})

const initGrassList = () => {
    for (let index = 0; index < 25; index++) {
        if (index % 2 == 0) {
            state.grassList.push({
                url: Grass1
            });
        } else {
            state.grassList.push({
                url: Grass2
            });
        }
    }
}
</script>

<style lang="scss" scoped>
.game-container {
    background-color: #c3fe8b;
    height: 100%;
    overflow: hidden;

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
            display: grid;
            /* 指定每一行的宽度 每个宽度中间用空格隔开 */
            grid-template-rows: 20% 20% 20% 20% 20%;
            /* 指定每一列的宽度 每个宽度中间用空格隔开 */
            grid-template-columns: 20% 20% 20% 20% 20%;

            .grass-item {
                position: relative;

                .grass-img {
                    width: 40px;
                    height: 40px;
                    right: 50%;
                    bottom: 50%;
                    margin-right: -20px;
                    margin-bottom: -20px;
                    position: absolute;
                    animation: shake 0.8s ease-in-out infinite;
                }

                @keyframes shake {

                    /* 垂直抖动，核心代码 */
                    0% {
                        // transform: scaleY(1);
                        height: 40px;
                    }

                    25% {
                        // transform: scaleY(1.1);
                        height: 42px;
                    }

                    50% {
                        // transform: scaleY(1.2);
                        height: 45px;
                    }

                    75% {
                        // transform: scaleY(1.1);
                        height: 42px;
                    }
                }
            }

            .fade-enter-active,
            .fade-leave-active {
                transition: all 0.5s ease-in-out;
            }

            .fade-ente-from,
            .fade-leave-to {
                opacity: 0;
                transform: translateY(450px);
            }

            .fade-enter-to,
            .fade-leave-from {
                opacity: 1;
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
            }
        }
    }
}
</style>