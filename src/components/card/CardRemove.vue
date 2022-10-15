<template>
    <div :ref="(el: any) => {setCardRef(el)}" class="card-remove-container flex-c" :data-id="node.id" :data-state="node.state"
        :style="cardStyle"
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
import { computed, CSSProperties } from 'vue';
import type { CardNode } from "../../types/type";

type positionObj = {
    left: number,
    top: number,
    width: number
}

interface Props {
    node: CardNode
    isDock?: boolean,
    nodeIndex: number,
    position: positionObj,
    removeIndex: number
}

const props = defineProps<Props>();
const emit = defineEmits(['cardRemoveTap']);

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

const cardStyle = computed(() => {
    return {
        position: 'absolute', zIndex: node.zIndex, top: `${props.position.top}px`, left: `${props.position.left + props.position.width * props.removeIndex}px`
    } as CSSProperties
})

const cardTapAction = () => {
    if (isForbid.value) return;
    emit('cardRemoveTap', node);
}

const setCardRef = (el: undefined | HTMLElement) => {
    node.ref = el;
    // storeRef.value = el;
    // console.log(node.ref?.style);
}
</script>

<style lang="scss" scoped>
.card-remove-container {
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
</style>