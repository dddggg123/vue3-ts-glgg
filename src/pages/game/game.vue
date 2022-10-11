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
                    <!-- <Card v-if="item.state === 0 || item.state === 1"
                        @cardTap="selectCardHandler" :node="item"></Card> -->
                    <Card :nodeIndex="index" :ref="(el) => {setNodeItemRef(el, item.id)}" v-if="item.state === 0 || item.state === 1"
                        @cardTap="selectCardHandler" :node="item"></Card>
                </template>
            </div>
            <div class="game-store-section">
                <div ref="storeRef" class="game-store-content flex-l">
                    <template v-if="selectedNodes.length">
                        <template v-for="(item, index) in selectedNodes" :key="item.id">
                            <Card :nodeIndex="index" v-if="item.state === 2" :isDock="true" :node="item"></Card>
                        </template>
                    </template>
                    <template v-else>
                        <div :ref="setStoreItemRefs" class="store-item" :key="item"
                            v-for="item in [1, 2, 3, 4, 5, 6, 7]"></div>
                    </template>
                </div>
                <div class="btn-section">
                    <div @click="removeThreeCardHandler" class="btn-item flex-c">
                        <span class="btn-title">移出</span>
                    </div>
                    <div @click="rollbackOneCardHandler" class="btn-item flex-c">
                        <span class="btn-title">回退</span>
                    </div>
                    <div @click="shuffleCardListHandler" class="btn-item flex-c">
                        <span class="btn-title">打乱</span>
                    </div>
                </div>
            </div>
            <ModalSuccess :isLast="state.currentLevel == state.levelConfig.length - 1" :modal="successModal" @successModalTap="successModalTapHandler"></ModalSuccess>
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
import { ref, onMounted, reactive, onUnmounted, nextTick, ComponentPublicInstance, HTMLAttributes } from 'vue';
import Grass1 from '@/assets/icons/grass1.png';
import Grass2 from '@/assets/icons/grass2.png';
import { showSuccessAnimation, getCurrentDate } from '../../utils/util';
import windowResize from '../../utils/resize';
import { useRouter } from 'vue-router';

type grassObj = {
    url: string
}

type positionObj = {
    top: number,
    left: number
}

const router = useRouter();
const { screenRef, calcRate, windowDraw, unWindowDraw } = windowResize()
const containerRef = ref<HTMLElement | undefined>()
const storeRef = ref<HTMLElement | undefined>()
const clickAudioRef = ref<HTMLAudioElement | undefined>()
const dropAudioRef = ref<HTMLAudioElement | undefined>()
const winAudioRef = ref<HTMLAudioElement | undefined>()
const loseAudioRef = ref<HTMLAudioElement | undefined>()
const gameAudioRef = ref<HTMLAudioElement | undefined>()
const successModal = ref(false)
const failModal = ref(false)
const storeItemPostionList = ref([] as Array<positionObj>)

/**
 * 卡片对应html元素数组
*/
const nodesRefs = ref<any>([]);
let selectedNodesRefs = [];
let storeItemRefs: any[] = [];

const setNodeItemRef = (el: HTMLElement | ComponentPublicInstance | HTMLAttributes | null | Element, index: string) => {
    if (nodesRefs.value.length == nodes.value.length) return
    console.log('我执行了');
    if (el) {
        nodesRefs.value.push({
            id: index,
            el: el
        });
    }
}

const setStoreItemRefs = (el: any) => {
    if (el) {
        storeItemRefs.push(el);
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
            cardNum: 6,
            layerNum: 4,
            trap: false,
        }, {
            cardNum: 8,
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
    let nodeProxy = {} as any;
    // nodesRefs.value.forEach((item: any) => {
    //     if (item.id == card.id) {
    //         console.log(item.el);
    //         nodeProxy = item.el;
    //     }
    // })
    for (let i = 0; i < nodesRefs.value.length; i++) {
        if (nodesRefs.value[i].id == card.id) {
            nodeProxy = nodesRefs.value[i].el;
            break;
        }
    }
    if (nodeProxy) {
        nodeProxy.$el.style = `position: absolute; z-index: ${card.zIndex}; top: ${storeItemPostionList.value[selectedNodes.value.length].top}px; left: ${storeItemPostionList.value[selectedNodes.value.length].left}px; opacity: 0;`;
        // nodeProxy.$el.style = ''
    }
    // card = { ...card, ...{ top: storeItemPostionList.value[selectedNodes.value.length].top, left: storeItemPostionList.value[selectedNodes.value.length].left } }
}

const dropCardHandler = () => {
    dropAudioRef.value?.play()
}

const winHandler = () => {
    showSuccessAnimation();
    winAudioRef.value?.play();
    successModal.value = true;
}

const loseHandler = () => {
    loseAudioRef.value?.play();
    failModal.value = true;
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
                nodesRefs.value = [];
                if (state.currentLevel === state.levelConfig.length - 1) {
                    state.currentLevel = 0;
                } else {
                    state.currentLevel += 1;
                }
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
                nodesRefs.value = [];
                initCardList(state.levelConfig[state.currentLevel]);
                break;
            case 'back':
                router.back();
                break;
        }
    }, 300);
}

const calcStoreItemPostion = () => {
    storeItemRefs.forEach(item => {
        let rect = item.getBoundingClientRect();
        let obj = {
            top: rect.top,
            left: rect.left - rect.width * 7
        }
        storeItemPostionList.value.push(obj);
    })
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
    shuffleCardListHandler,
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
    state.currentDate = '- ' + getCurrentDate() + ' -';
    calcStoreItemPostion();
    nextTick(() => {
        initCardList();
    })
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
            height: calc(100% - 235px);
            min-height: 640px;
            // position: relative;
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
            height: 175px;
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            align-items: center;

            .game-store-content {
                box-sizing: content-box;
                width: 420px;
                height: 60px;
                background-color: #965a1c;
                border: 10px #c1812f solid;
                border-radius: 5px;

                .store-item {
                    width: 60px;
                    height: 60px;
                }
            }

            .btn-section {
                width: 440px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-top: 20px;

                .btn-item {
                    width: 100px;
                    height: 50px;
                    background-color: #22a4ff;
                    border-radius: 10px;
                    border-bottom: 5px #1580ca solid;
                    cursor: pointer;

                    .btn-title {
                        color: #fff;
                        font-size: 17px;
                    }
                }
            }

        }
    }
}
</style>