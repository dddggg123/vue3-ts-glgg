<template>
    <div :ref="(el: any) => {setCardRef(el)}" class="card-container flex-c" :data-id="node.id" :data-state="node.state"
        :style="isDock?{}:{ position: 'absolute', zIndex: node.zIndex, top: `${node.top}px`, left: `${node.left}px`}"
        @click="cardTapAction">
        <div class="card-section">
            <div class="card-content flex-c">
                <img class="card-img" :src="imgMapObj[node.type]" :alt="`${node.type}`">
                <!-- <img :src="'./../../assets/icons/caomei.png'"/> -->
            </div>
            <div v-if="isForbid && !isDock" class="card-mask"></div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, VNodeRef, ref } from 'vue';
import type { CardNode, GameConfig } from "../../types/type";
import { throttle } from "lodash-es";

interface Props {
    node: CardNode
    isDock?: boolean,
    nodeIndex: number
}

const props = defineProps<Props>();
const emit = defineEmits(['cardTap']);

const { node, nodeIndex } = props;

// 加载图片资源
const modulesFiles = import.meta.globEager('../../assets/icons/*.png');

const imgMapObj = Object.keys(modulesFiles).reduce(
    (module: { [key: string]: any }, path: string) => {
        const moduleName = path.replace('../../assets/icons/', '').replace('.png', '');
        module[moduleName] = modulesFiles[path].default;
        return module
    }, {} as Record<string, string>
)

const isForbid = computed(() => {
    return props.node.parents.length > 0 ? props.node.parents.some(o => o.state < 2) : false
})

const cardTapAction = () => {
    if (isForbid.value) return;
    throttleCardTapAction();
}

/**
 * 这里加一个节流函数
 * 防止点击过快 增大动画延时误差
 */
const throttleCardTapAction = throttle(() => {
    node.nodeIndex = nodeIndex;
    emit('cardTap', node);
}, 500, {
    leading: true,
    trailing: false
})

const storeRef = ref<HTMLElement | undefined>()

const setCardRef = (el: undefined | HTMLElement) => {
    node.ref = el;
    // storeRef.value = el;
    // console.log(node.ref?.style);
}

const px2rem = (px: string) => {
    if (/%/ig.test(px)) { // 有百分号%，特殊处理，表述pc是一个有百分号的数，比如：90%
        return px
    } else {
        return (parseFloat(px) / 17) + 'rem' // 这里的37.5，和rootValue值对应
    }
}
</script>

<style lang="scss" scoped>
.card-container {
    width: 50px;
    height: 50px;
    background-color: #5d731a;
    border-radius: 3px;
    cursor: pointer;
    transition: all .2s ease-in-out;

    .card-section {
        width: 100%;
        height: 100%;
        position: relative;
        overflow: hidden;

        .card-mask {
            position: absolute;
            top: 0;
            left: 0;
            bottom: 0;
            right: 0;
            border-radius: 3px;
            background-color: rgba($color: #000000, $alpha: .6);
            pointer-events: none;
            cursor: none;
        }

        .card-content {
            width: 45px;
            height: 43px;
            border-radius: 3px;
            background-color: #f3ffd1;
            margin: 0 auto;
            margin-top: 2px;

            .card-img {
                width: 40px;
                height: 40px;
            }
        }
    }
}

.card-dock {
    animation: shake 0.4s ease-in-out;
}

@keyframes shake {

    0% {
        transform: scale(1);
    }

    25% {
        transform: scale(1.1);
    }

    50% {
        transform: scale(1.2);
    }

    75% {
        transform: scale(1.1);
    }
}
</style>