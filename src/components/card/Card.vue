<template>
    <div class="card-container">
        <img class="card-img" :src="imgMapObj[node.type]" :alt="`${node.type}`">
        <!-- <img :src="'./../../assets/icons/caomei.png'"/> -->
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

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
    width: 40px;
    height: 40px;
    background-color: #fff;
    display: flex;
    justify-content: center;
    align-items: center;

    .card-img {
        width: 30px;
        height: 30px;
    }
}
</style>