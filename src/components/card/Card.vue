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
const modulesFiles = import.meta.glob(`../../assets/icons/*.png`)
// const IMG_MAP = Object.keys(modules);
console.log(modulesFiles);
const imgMapObj = Object.keys(modulesFiles).reduce(
    (acc: { [key: string]: any }, path: string) => {
        const moduleName = path.replace('../../assets/icons/', '').replace('.png', '');
        acc[moduleName] = modulesFiles[path];
        return acc
    }, {} as Record<string, string>
)
console.log(imgMapObj);
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