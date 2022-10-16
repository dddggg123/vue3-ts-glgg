<template>
    <div class="welcome-container flex-c">
        <div class="welcome-content">
            <div class="welcome-header-section flex-c">
                <p class="welcome-title">果了个果</p>
                <img class="welcome-img1" src="@/assets/icons/caomei.png" alt="" />
                <img class="welcome-img2" src="@/assets/icons/xigua.png" alt="" />
                <img class="welcome-img3" src="@/assets/icons/lizi.png" alt="" />
                <img class="welcome-img4" src="@/assets/icons/putao.png" alt="" />
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
            <div class="welcome-content-section">
                <div class="animate-section">
                    <img v-for="(item, index) in cardImgArr" class="animate-img" :src="imgMapObj[item]" />
                </div>
                <div class="btn-section flex-c">
                    <p @click="startGameAction" class="btn-title flex-c">
                        <span>开始挑战</span>
                    </p>
                    <p class="version">版本号：1.0.101601</p>
                </div>
            </div>
        </div>
        <audio @ended="audioEndedHandler" style="display: none" ref="welcomeAudioRef" preload="auto" controls>
            <source src="@/assets/audios/welcome.mp3" />
        </audio>
        <audio ref="clickAudioRef" style="display: none;" preload="auto" controls>
            <source src="@/assets/audios/click.mp3" />
        </audio>
    </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { ref } from 'vue';

const router = useRouter();
const welcomeAudioRef = ref();
const clickAudioRef = ref();
const cardImgArr: Array<string> = [
    "boluo",
    "caomei",
    "chelizi",
    "chengzi",
    "huolongguo",
    "lanmei",
    "liulian",
    "lizi",
    "mangguo",
    "ningmeng",
    "niuyouguo",
    "pingguo",
    "putao",
    "qiyiguo",
    "shanzhu",
    "taozi",
    "xiangjiao",
    "yangtao",
    "xigua",
    "yangtao",
    "yezi",
];
const musicEnable = ref(false);

// 加载图片资源
const modulesFiles = import.meta.globEager('../../assets/icons/*.png');

const imgMapObj = Object.keys(modulesFiles).reduce(
    (module: { [key: string]: any }, path: string) => {
        const moduleName = path.replace('../../assets/icons/', '').replace('.png', '');
        module[moduleName] = modulesFiles[path].default;
        return module
    }, {} as Record<string, string>
)


const startGameAction = () => {
    clickAudioRef.value.play();
    setTimeout(() => {
        router.push('/game')
    }, 300);
}

const startMusicHandler = () => {
    musicEnable.value = !musicEnable.value;
    if (musicEnable.value) {
        welcomeAudioRef.value.play();
    } else {
        welcomeAudioRef.value.pause();
    }
}

const audioEndedHandler = () => {
    welcomeAudioRef.value.play();
}

</script>

<style lang="scss" scoped>
.welcome-container {
    background-color: #c3fe8b;
    height: 100%;
    min-height: 875px;
    overflow-y: auto;
    /* 隐藏滚动条 */
    scrollbar-width: none;
    /* firefox */
    -ms-overflow-style: none;
    /* IE 10+ */

    .welcome-content {
        width: 500px;

        .welcome-header-section {
            height: 100px;
            display: flex;
            position: relative;

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

            .welcome-title {
                font-size: 70px;
                font-weight: bold;
                -webkit-text-stroke: 3px #fff;
            }

            .welcome-img1 {
                position: absolute;
                width: 30px;
                height: 30px;
                left: 130px;
                top: 20px;
            }

            .welcome-img2 {
                position: absolute;
                width: 30px;
                height: 30px;
                left: 340px;
                top: 45px;
            }

            .welcome-img3 {
                position: absolute;
                width: 30px;
                height: 30px;
                left: 240px;
                top: 30px;
            }

            .welcome-img4 {
                position: absolute;
                width: 30px;
                height: 30px;
                left: 180px;
                top: 60px;
            }
        }

        .welcome-content-section {
            height: 775px;
            display: flex;
            flex-direction: column;
            justify-content: flex-end;

            .animate-section {
                flex: 1;
                display: flex;
                justify-content: center;
                align-items: center;
                flex-wrap: wrap;
                padding: 10% 0;

                .animate-img {
                    width: 80px;
                    height: 80px;
                    animation: shake 1.5s linear infinite;
                }

                @keyframes shake {

                    10% {
                        transform: rotate(15deg);
                    }

                    20% {
                        transform: rotate(-10deg);
                    }

                    30% {
                        transform: rotate(5deg);
                    }

                    40% {
                        transform: rotate(-5deg);
                    }

                    50%,
                    100% {
                        transform: rotate(0deg);
                    }
                }

            }

            .btn-section {
                text-align: center;
                height: 20%;
                flex-direction: column;

                .version {
                    font-size: 13px;
                    margin-top: 5px;
                }

                .btn-title {
                    width: 300px;
                    height: 100px;
                    background: #fff;
                    font-size: 30px;
                    box-sizing: border-box;
                    cursor: pointer;
                    position: relative;
                    border: 10px solid;
                    border-image: linear-gradient(45deg, gold, deeppink) 1;
                    clip-path: inset(0 round 10px);
                    animation: change 5s linear infinite;
                }

                @keyframes change {

                    from {
                        filter: hue-rotate(0);
                    }

                    to {
                        filter: hue-rotate(360deg);
                    }

                }
            }
        }
    }
}
</style>