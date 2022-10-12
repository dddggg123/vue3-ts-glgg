<template>
    <div class="game-container flex-c">
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
                    <Card :nodeIndex="index" v-if="item.state === 0 || item.state === 1" @cardTap="selectCardHandler"
                        :node="item"></Card>
                </template>
            </div>
            <div class="game-store-section">
                <div class="game-store-content">
                    <div ref="storeRef" class="game-store flex-l">
                        <template v-if="selectedNodes.length">
                            <template v-for="(item, index) in selectedNodes" :key="item.id">
                                <Card :nodeIndex="index" v-if="item.state === 2" is-dock :node="item"></Card>
                            </template>
                        </template>
                        <template v-else>
                            <div :ref="setStoreItemRefs" class="store-item" :key="item"
                                v-for="item in [1, 2, 3, 4, 5, 6, 7]"></div>
                        </template>
                    </div>
                </div>
                <div class="btn-section">
                    <button :disabled="removeFlag" @click="removeThreeCardHandler" class="btn-item flex-c"
                        :class="{'forbid': removeFlag}">
                        <span class="btn-title">移出</span>
                    </button>
                    <button :disabled="backFlag" @click="rollbackOneCardHandler" class="btn-item flex-c"
                        :class="{'forbid': backFlag}">
                        <span class="btn-title">回退</span>
                    </button>
                    <button :disabled="shuffleFlag" @click="shuffleCardListHandler" class="btn-item flex-c"
                        :class="{'forbid': shuffleFlag}">
                        <span class="btn-title">打乱</span>
                    </button>
                </div>
            </div>
            <ModalSuccess :isLast="state.currentLevel == state.levelConfig.length - 1" :modal="successModal"
                @successModalTap="successModalTapHandler"></ModalSuccess>
            <ModalFail :modal="failModal" @failModalTap="failModalTapHandler"></ModalFail>
            <div class="remove-card-section flex-l">
                <Card :nodeIndex="index" v-for="(item, index) in removeList" :key="item.id" :node="item" is-dock
                    @cardTap="selectRemoveCardHandler"></Card>
            </div>
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
import type { CardNode } from "../../types/type";
import initGame from './game';
import { ref, onMounted, reactive, onUnmounted, nextTick } from 'vue';
import Grass1 from '@/assets/icons/grass1.png';
import Grass2 from '@/assets/icons/grass2.png';
import { showSuccessAnimation, getCurrentDate } from '../../utils/util';
import windowResize from '../../utils/resize';
import { useRouter } from 'vue-router';
import { react } from '@babel/types';

type grassObj = {
    url: string
}

type positionObj = {
    top: number,
    left: number
}

const router = useRouter()
const screenRef = ref()
const storeRef = ref()
const containerRef = ref<HTMLElement | undefined>()
const clickAudioRef = ref<HTMLAudioElement | undefined>()
const dropAudioRef = ref<HTMLAudioElement | undefined>()
const winAudioRef = ref<HTMLAudioElement | undefined>()
const loseAudioRef = ref<HTMLAudioElement | undefined>()
const gameAudioRef = ref<HTMLAudioElement | undefined>()
const successModal = ref(false)
const failModal = ref(false)
const storeItemPostionList = ref([] as Array<positionObj>)

let storeItemRefs: any[] = [];

const setStoreItemRefs = (el: any) => {
    if (el) {
        storeItemRefs.push(el);
    }
}

const state = reactive({
    grassList: [
    ] as Array<grassObj>,
    levelConfig: [
        {
            cardNum: 3,
            layerNum: 2,
            trap: false
        }, {
            cardNum: 5,
            layerNum: 4,
            trap: false
        }, {
            cardNum: 8,
            layerNum: 6,
            trap: false
        }, {
            cardNum: 10,
            layerNum: 8,
            trap: false
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
    // let nodeProxy = {} as any;
    // nodesRefs.value.forEach((item: any) => {
    //     if (item.id == card.id) {
    //         console.log(item.el);
    //         nodeProxy = item.el;
    //     }
    // })
    // for (let i = 0; i < nodesRefs.value.length; i++) {
    //     if (nodesRefs.value[i].id == card.id) {
    //         nodeProxy = nodesRefs.value[i].el;
    //         break;
    //     }
    // }
    // if (nodeProxy) {
    //     nodeProxy.$el.style = `position: absolute; z-index: ${card.zIndex}; top: ${storeItemPostionList.value[selectedNodes.value.length].top}px; left: ${storeItemPostionList.value[selectedNodes.value.length].left}px; opacity: 0;`;
    // }
    // card = { ...card, ...{ top: storeItemPostionList.value[selectedNodes.value.length].top, left: storeItemPostionList.value[selectedNodes.value.length].left } }
    const top = storeItemPostionList.value[selectedNodes.value.length].top;
    const left = storeItemPostionList.value[selectedNodes.value.length].left;
    // console.log(card.ref);
    card.ref?.setAttribute('style', `position: absolute; z-index: ${card.zIndex}; top: ${top}px; left: ${left}px;`);
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
                if (state.currentLevel === state.levelConfig.length - 1) {
                    state.currentLevel = 0;
                } else {
                    state.currentLevel += 1;
                }
                removeFlag.value = false;
                backFlag.value = false;
                shuffleFlag.value = false;
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
                removeFlag.value = false;
                backFlag.value = false;
                shuffleFlag.value = false;
                initCardList(state.levelConfig[state.currentLevel]);
                break;
            case 'back':
                router.back();
                break;
        }
    }, 300);
}

const calcStoreItemPostion = () => {
    storeItemPostionList.value = [];
    const xOffset = (screenRef.value.getBoundingClientRect().width - storeRef.value.getBoundingClientRect().width) / 2;
    const yOffset = (window.innerHeight - screenRef.value.getBoundingClientRect().height) / 2;
    // const xOffset = storeRef.value.getBoundingClientRect().left;
    storeItemRefs.forEach((item, index) => {
        let rect: DOMRect = item.getBoundingClientRect();
        let obj = {
            top: rect.top - yOffset,
            left: xOffset + index * rect.width
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
    shuffleFlag,
    selectCardHandler,
    selectRemoveCardHandler,
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
    // windowDraw()
    // calcRate()
    initGrassList();
    state.currentDate = '- ' + getCurrentDate() + ' -';
    nextTick(() => {
        initCardList();
        calcStoreItemPostion();
    })
})

onUnmounted(() => {
    // unWindowDraw();
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
    // overflow-y: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
    overflow: scroll;
    background-color: #c3fe8b;
    min-height: 875px;
    height: 100%;
    // height: 100vh;


    &::-webkit-scrollbar {
        display: none;
        /* Chrome Safari */
    }

    .game-content {
        width: 500px;
        position: relative;
        position: absolute;

        .remove-card-section {
            position: absolute;
            left: 0;
            bottom: 185px;
            width: 150px;
            height: 50px;
        }

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
            // height: calc(100% - 235px);
            // min-height: 640px;
            height: 640px;
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
                width: 350px;
                height: 50px;
                background-color: #965a1c;
                border: 10px #c1812f solid;
                border-radius: 5px;

                .game-store {
                    width: 100%;
                    height: 100%;
                }

                .store-item {
                    width: 50px;
                    height: 50px;
                }
            }

            .btn-section {
                width: 370px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-top: 20px;

                .btn-item {
                    width: 100px;
                    height: 50px;
                    border: none;
                    background-color: #22a4ff;
                    border-radius: 10px;
                    border-bottom: 5px #1580ca solid;
                    cursor: pointer;

                    .btn-title {
                        color: #fff;
                        font-size: 17px;
                    }
                }

                .forbid {
                    background-color: gray;
                    border-bottom: 5px #8a8a8a solid;
                    pointer-events: none;
                }
            }

        }
    }
}
</style>