<template>
    <div class="welcome-container">
        <div ref="screenRef" class="welcome-content">
            <div class="welcome-header-section flex-c">
                <p class="welcome-title">果了个果</p>
                <img class="welcome-img1" src="@/assets/icons/caomei.png" alt="" />
                <img class="welcome-img2" src="@/assets/icons/yangtao.png" alt="" />
                <img class="welcome-img3" src="@/assets/icons/lizi.png" alt="" />
                <img class="welcome-img4" src="@/assets/icons/putao.png" alt="" />
            </div>
            <div class="welcome-content-section">
                <div class="animate-section">
                    <img v-for="(item, index) in cardImgArr" class="animate-img" :src="imgMapObj[item]" />
                </div>
                <div class="btn-section flex-c">
                    <p @click="startGameAction" class="btn-title flex-c">
                        <span>开始挑战</span>
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import windowResize from '../../utils/resize';
import { onMounted, onUnmounted, ref } from 'vue';

const router = useRouter();
const { screenRef, calcRate, windowDraw, unWindowDraw } = windowResize()

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
    router.push('/game');
}

onMounted(() => {
    // 监听浏览器窗口尺寸变化
    windowDraw()
    calcRate()
})

onUnmounted(() => {
    unWindowDraw();
})

</script>

<style lang="scss" scoped>
.welcome-container {
    background-color: #c3fe8b;
    height: 100%;
    overflow: hidden;

    .welcome-content {
        width: 500px;
        height: 100%;
        margin: 0 auto;

        .welcome-header-section {
            height: 100px;
            display: flex;
            position: relative;

            .welcome-title {
                font-size: 70px;
                font-weight: bolder;
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
            height: calc(100% - 100px);
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