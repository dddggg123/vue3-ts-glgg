<template>
    <div class="game-container">
        <div ref="screenRef" class="game-content">
            <div class="game-header-section flex-c">
                <!-- <p class="game-title">果了个果</p> -->
                <div class="date-section">
                    <span class="date">{{state.currentDate}}</span>
                </div>
                <div @click="startMusicHandler" class="music-section">
                    <template v-if="musicEnable">
                        <img class="music-img-open" src="@/assets/icons/music_s.png" alt="">
                        <span class="music-title-open">关闭音乐</span>
                    </template>
                    <template v-else>
                        <img class="music-img" src="@/assets/icons/music.png" alt="">
                        <span class="music-title">开启音乐</span>
                    </template>
                </div>
            </div>
            <div ref="containerRef" class="game-card-section">
                <div v-for="(item, index) in state.grassList" :key="index" class="grass-item">
                    <img :src="item.url" class="grass-img">
                </div>
                <template v-for="(item, index) in nodes" :key="item.id">
                    <Card :node-index="index" :ref="setNodeItemRef" v-if="confirmCardVisible(item.state)" @cardTap="selectCardHandler"
                        :node="item"></Card>
                </template>
            </div>
            <div class="game-store-section flex-c">
                <div class="game-store-content flex-l">
                    <template v-for="(item, index) in selectedNodes" :key="item.id">
                        <Card :node-index="index" v-if="item.state === 2" :isDock="true" :node="item"></Card>
                    </template>
                </div>
            </div>
            <ModalSuccess :modal="successModal" @successModalTap="successModalTapHandler"></ModalSuccess>
            <ModalFail :modal="failModal" @failModalTap="failModalTapHandler"></ModalFail>
        </div>
        <audio ref="clickAudioRef" style="display: none;" preload="auto" controls>
            <source src="@/assets/audios/click.mp3" />
        </audio>
        <audio ref="dropAudioRef" style="display: none;" preload="auto" controls>
            <source src="@/assets/audios/drop.mp3" />
        </audio>
        <audio ref="winAudioRef" style="display: none;" preload="auto" controls>
            <source src="@/assets/audios/win.mp3" />
        </audio>
        <audio ref="loseAudioRef" style="display: none;" preload="auto" controls>
            <source src="@/assets/audios/lose.mp3" />
        </audio>
        <audio @ended="audioEndedHandler" style="display: none" ref="gameAudioRef" preload="auto" controls>
            <source src="@/assets/audios/game.mp3" />
        </audio>
    </div>
</template>

<script setup lang="ts">
import Card from '@/components/card/Card.vue';
import ModalSuccess from '@/components/modal/ModalSuccess.vue';
import ModalFail from '@/components/modal/ModalFail.vue';
import type { CardNode, GameConfig } from "../../types/type";
import initGame from './game';
import { ref, onMounted, reactive, onUnmounted } from 'vue';
import Grass1 from '@/assets/icons/grass1.png';
import Grass2 from '@/assets/icons/grass2.png';
import { showSuccessAnimation, getCurrentDate } from '../../utils/util';
import windowResize from '../../utils/resize';
import { useRouter } from 'vue-router';

type grassObj = {
    url: string
}
const router = useRouter();
const { screenRef, calcRate, windowDraw, unWindowDraw } = windowResize()
const containerRef = ref<HTMLElement | undefined>()
const clickAudioRef = ref<HTMLAudioElement | undefined>()
const dropAudioRef = ref<HTMLAudioElement | undefined>()
const winAudioRef = ref<HTMLAudioElement | undefined>()
const loseAudioRef = ref<HTMLAudioElement | undefined>()
const gameAudioRef = ref<HTMLAudioElement | undefined>()
const successModal = ref(false)
const failModal = ref(false)

/**
 * 卡片对应html元素数组
*/
let nodesRefs: any[] = [];
let selectedNodesRefs = [];

const setNodeItemRef = (el: any) => {
    if (el) {
        nodesRefs.push(el);
    }
}

const setSelectedNodeItemRef = (el: any) => {
    if (el) {
        selectedNodesRefs.push(el);
    }
}

const state = reactive({
    grassList: [
    ] as Array<grassObj>,
    levelConfig: [
        {
            cardNum: 4,
            layerNum: 2,
            trap: false,
        }, {
            cardNum: 8,
            layerNum: 4,
            trap: false,
        }, {
            cardNum: 12,
            layerNum: 6,
            trap: false,
        }
    ],
    currentLevel: 0,
    currentDate: '- 10月10日 -'
})
const musicEnable = ref(false);

const clickCardHandler = (card: CardNode) => {
    confirmNodeStyle(card);
    if (clickAudioRef.value?.paused) {
        clickAudioRef.value.play()
    } else if (clickAudioRef.value) {
        clickAudioRef.value.load()
        clickAudioRef.value.play()
    }
}

const confirmNodeStyle = (card: CardNode) => {
    // if (containerRef.value) {
    //    console.log(containerRef.value.children[10]);
    // }
    if (typeof (card.nodeIndex) == 'number') {
        const nodeProxy = nodesRefs[card.nodeIndex];
        console.log('下标:' + card.nodeIndex);
        console.log(nodeProxy);
        nodeProxy.$el.style.left = 0;
    }
}

const dropCardHandler = () => {
    dropAudioRef.value?.play()
}

const winHandler = () => {
    console.log('胜利了');
    showSuccessAnimation();
    winAudioRef.value?.play();
    successModal.value = true;
}

const loseHandler = () => {
    console.log('失败了');
    loseAudioRef.value?.play();
    failModal.value = true;
}

const cardTapHandler = (card: CardNode) => {

}

// 卡片四种状态  0： 无状态  1： 可点击 2：已选 3：已消除
const confirmCardVisible = (state: number): boolean => {
    return [0, 1].includes(state);
}

const audioEndedHandler = () => {
    gameAudioRef.value?.play();
}

const startMusicHandler = () => {
    musicEnable.value = !musicEnable.value;
    if (musicEnable.value) {
        gameAudioRef.value?.play();
    } else {
        gameAudioRef.value?.pause();
    }
}

const successModalTapHandler = (type: string) => {
    clickAudioRef.value?.play();
    setTimeout(() => {
        successModal.value = false;
        switch (type) {
            case 'next':
                state.currentLevel += 1;
                initCardList(state.levelConfig[state.currentLevel]);
                break;
            case 'back':
                router.back();
                break;
        }
    }, 300);
}

const failModalTapHandler = (type: string) => {
    clickAudioRef.value?.play();
    setTimeout(() => {
        failModal.value = false;
        switch (type) {
            case 'restart':
                initCardList(state.levelConfig[state.currentLevel]);
                break;
            case 'back':
                router.back();
                break;
        }
    }, 300);
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
        clickCallback: clickCardHandler,
        dropCallback: dropCardHandler,
        winCallback: winHandler,
        loseCallback: loseHandler,
    },
    ...state.levelConfig[state.currentLevel]
})

onMounted(() => {
    // 监听浏览器窗口尺寸变化
    windowDraw()
    calcRate()
    initGrassList();
    initCardList();
    state.currentDate = '- ' + getCurrentDate() + ' -';
})

onUnmounted(() => {
    unWindowDraw();
})

const initGrassList = () => {
    for (let index = 0; index < 49; index++) {
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
    overflow-y: auto;
    /* 隐藏滚动条 */
    scrollbar-width: none;
    /* firefox */
    -ms-overflow-style: none;
    /* IE 10+ */

    &::-webkit-scrollbar {
        display: none;
        /* Chrome Safari */
    }

    .game-content {
        width: 500px;
        height: 100%;
        margin: 0 auto;

        .game-header-section {
            height: 60px;
            position: relative;

            .date-section {
                background-color: #010303;
                padding: 5px 10px;
                border-radius: 5px;

                .date {
                    color: #fff;
                    font-size: 20px;
                }
            }

            .music-section {
                position: absolute;
                top: 10px;
                right: 10px;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                cursor: pointer;

                .music-img {
                    width: 25px;
                    height: 25px;
                }

                .music-title {
                    font-size: 12px;
                    color: #8a8a8a;
                    margin-top: 5px;
                }

                .music-img-open {
                    width: 25px;
                    height: 25px;
                    animation: rotate 3s linear infinite;
                }

                @keyframes rotate {
                    0% {
                        transform: rotateZ(0deg);
                    }

                    50% {
                        transform: rotateZ(180deg);
                    }


                    100% {
                        transform: rotateZ(360deg);
                    }
                }

                .music-title-open {
                    font-size: 12px;
                    color: #965a1c;
                    margin-top: 5px;
                }
            }

            .game-title {
                font-size: 44px;
                font-weight: 600;
            }
        }

        .game-card-section {
            height: 75%;
            min-height: 640px;
            position: relative;
            display: grid;
            /* 指定每一行的宽度 每个宽度中间用空格隔开 */
            grid-template-rows: 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
            /* 指定每一列的宽度 每个宽度中间用空格隔开 */
            grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr 1fr;

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

            // .fade-enter-active,
            // .fade-leave-active {
            //     transition: all 0.5s ease-in-out;
            // }

            // .fade-ente-from,
            // .fade-leave-to {
            //     opacity: 0;
            //     transform: translateY(450px);
            // }

            // .fade-enter-to,
            // .fade-leave-from {
            //     opacity: 1;
            // }
        }

        .game-store-section {
            height: calc(25% - 60px);

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