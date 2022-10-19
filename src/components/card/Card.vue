<template>
    <div :ref="(el: any) => {setCardRef(el)}" class="card-container flex-c" :data-id="node.id" :data-state="node.state"
        :style="{ position: 'absolute', zIndex: node.zIndex, top: `${node.top}px`, left: `${node.left}px`}"
        @click="cardTapAction">
        <div class="card-section">
            <div class="card-content flex-c">
                <img class="card-img" :src="node.imgUrl" :alt="`${node.type}`">
                <!-- <img :src="'./../../assets/icons/caomei.png'"/> -->
            </div>
            <div v-if="isForbid && !isDock" class="card-mask"></div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { CardNode } from "../../types/type";

interface Props {
    node: CardNode
    isDock?: boolean
}

const props = defineProps<Props>();
const emit = defineEmits(['cardTap']);

const { node } = props;

const isForbid = computed(() => {
    return props.node.parents.length > 0 ? props.node.parents.some(o => o.state < 2) : false
})

const cardTapAction = () => {
    if (isForbid.value) return;
    emit('cardTap', node);
}

const setCardRef = (el: undefined | HTMLElement) => {
    node.ref = el;
    // storeRef.value = el;
    // console.log(node.ref?.style);
}
</script>

<style lang="scss" scoped>
.card-container {
    width: 50px;
    height: 50px;
    background-color: #5d731a;
    border-radius: 3px;
    cursor: pointer;
    transition: all .4s ease-in-out;

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