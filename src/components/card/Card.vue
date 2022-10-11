<template>
    <div class="card-container flex-c" :class="{'card-dock': isDock}"
        :style="isDock?{}:{ position: 'absolute', zIndex: node.zIndex, top: `${node.top}px`, left: `${node.left}px` }"
        @click="cardTapAction">
        <div class="card-section flex-c">
            <div class="card-content flex-c">
                <img class="card-img" :src="imgMapObj[node.type]" :alt="`${node.type}`">
                <!-- <img :src="'./../../assets/icons/caomei.png'"/> -->
            </div>
            <div v-if="isForbid" class="card-mask"></div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { CardNode, GameConfig } from "../../types/type";

interface Props {
    node: CardNode
    isDock?: boolean
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
    node.nodeIndex = nodeIndex;
    console.log('nodeIndex:' + nodeIndex);
    console.log('node:' + JSON.stringify(node));
    emit('cardTap', node);
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
    width: 60px;
    height: 60px;
    background-color: #5d731a;
    border-radius: 10px;
    cursor: pointer;

    .card-section {
        width: 100%;
        height: 100%;
        position: relative;

        .card-mask {
            position: absolute;
            top: 0;
            left: 0;
            bottom: 0;
            right: 0;
            border-radius: 10px;
            background-color: rgba($color: #000000, $alpha: .6);
            pointer-events: none;
            cursor: none;
        }

        .card-content {
            width: 55px;
            height: 55px;
            border-radius: 10px;
            background-color: #f3ffd1;

            .card-img {
                width: 50px;
                height: 50px;
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