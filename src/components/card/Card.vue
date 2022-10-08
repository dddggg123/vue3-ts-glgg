<template>
    <div class="card-container"
        :style="isDock ? {} : { position: 'absolute', zIndex: node.zIndex, top: `${node.top}px`, left: `${node.left}px` }">
        <img class="card-img" :src="imgMapObj[node.type]" :alt="`${node.type}`">
        <!-- <img :src="'./../../assets/icons/caomei.png'"/> -->
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

    .card-img {
        width: 50px;
        height: 50px;
    }
}
</style>