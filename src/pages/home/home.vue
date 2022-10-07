<template>
    <div class="home-container">
        <Card v-for="(item, index) in cardList" :node="item"></Card>
    </div>
</template>

<script setup lang="ts">
import Card from '../../components/card/Card.vue';
// type CardNode = {
//     id: string           // 节点id zIndex-index
//     type: number         // 类型
//     zIndex: number       // 图层
//     index: number        // 所在图层中的索引
//     parents: CardNode[]  // 父节点
//     row: number          // 行
//     column: number       // 列
//     top: number
//     left: number
//     state: number        // 是否可点击 0： 无状态  1： 可点击 2：已选 3：已消除
// }

const cardList: Array<CardNode> = [
    {
        id: '123',
        type: 'caomei',
        zIndex: 1,       // 图层
        index: 1,       // 所在图层中的索引
        parents: [
        ], // 父节点
        row: 1,         // 行
        column: 1,      // 列
        top: 1,
        left: 1,
        state: 1,
    }
]
</script>

<style lang="scss" scoped>
.home-container {
    background-color: #c3fe8b;
    height: 100%;
}
</style>