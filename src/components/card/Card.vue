<template>
    <div class="card-container"
        :class="{'card-dock': isDock}"
        :style="isDock?{}:{ position: 'absolute', zIndex: node.zIndex, top: `${node.top}px`, left: `${node.left}px` }"
        @click="cardTapAction"
    >
        <img class="card-img" :src="imgMapObj[node.type]" :alt="`${node.type}`">
        <!-- <img :src="'./../../assets/icons/caomei.png'"/> -->
        <div v-if="isForbid" class="card-mask"></div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { CardNode, GameConfig } from "../../types/type";

interface Props {
    node: CardNode
    isDock?: boolean
}

const props = defineProps<Props>();
const emit = defineEmits(['cardTap']);

const { node } = props;

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
    emit('cardTap', node);
}
</script>

<style lang="scss" scoped>
.card-container {
    width: 60px;
    height: 60px;
    background-color: #f3ffd1;
    display: flex;
    justify-content: center;
    align-items: center;
    border: 3px #5d731a solid;
    border-radius: 10px;
    box-sizing: border-box;
    overflow: hidden;
    cursor: pointer;

    .card-img {
        width: 50px;
        height: 50px;
    }

    .card-mask {
        position: absolute;
        top: 0;
        left: 0;
        width: 60px;
        height: 60px;
        background-color: rgba($color: #000000, $alpha: .6);
        pointer-events: none;
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