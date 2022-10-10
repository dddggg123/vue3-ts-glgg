<template>
    <div v-if="modal" class="modal-fail-continer flex-c" :class="{'modal-show': modal}">
        <p class="fail-title">挑战失败</p>
        <p @click="failModalAction('restart')" class="next-btn flex-c">
            <span>重新开始</span>
        </p>
        <p @click="failModalAction('back')" class="back-btn flex-c">
            <span>返回果园</span>
        </p>
    </div>
</template>

<script setup lang="ts">
const props = defineProps({
    modal: {
        type: Boolean,
        default: false,
    }
})
const emit = defineEmits(['failModalTap']);
// const { modal } = props;

const failModalAction = (type: string) => {
    emit('failModalTap', type);
}
</script>

<style lang="scss" scoped>
.modal-fail-continer {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 9999;
    flex-direction: column;
    visibility: hidden;
    transition: all .3s ease-in;

    .fail-title {
        color: red;
        font-size: 60px;
        font-weight: bold;
        margin-top: -200px;
        -webkit-text-stroke: 1px green;
        animation: shake .8s ease-in-out;
    }

    @keyframes shake {

        0% {
            transform: scale(1.5);
        }

        25% {
            transform: scale(1.4);
        }

        50% {
            transform: scale(1.2);
        }

        75% {
            transform: scale(1.1);
        }
    }

    .next-btn {
        background-color: #fff;
        width: 150px;
        height: 50px;
        margin-top: 200px;
        border-radius: 10px;
        font-size: 20px;
        box-sizing: border-box;
        cursor: pointer;
        position: relative;
        border: 4px solid;
        border-image: linear-gradient(45deg, gold, deeppink) 1;
        clip-path: inset(0 round 10px);
        animation: change 5s linear infinite;
    }

    .back-btn {
        background-color: #fff;
        width: 150px;
        height: 50px;
        margin-top: 20px;
        border-radius: 10px;
        font-size: 20px;
        color: greenyellow;
        box-sizing: border-box;
        cursor: pointer;
        position: relative;
        border: 4px solid;
        border-image: linear-gradient(45deg, green, gray) 1;
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

.modal-show {
    background-color: rgba($color: #000000, $alpha: .5);
    visibility: visible;
}
</style>