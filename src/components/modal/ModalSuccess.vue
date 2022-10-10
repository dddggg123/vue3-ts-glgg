<template>
    <div v-if="modal" class="modal-success-continer flex-c" :class="{'modal-show': modal}">
        <p class="success-title">挑战成功</p>
        <p @click="successModalAction('next')" class="next-btn flex-c">
            <span>下一关</span>
        </p>
        <p @click="successModalAction('back')" class="back-btn flex-c">
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
const emit = defineEmits(['successModalTap']);
// const { modal } = props;

const successModalAction = (type: string) => {
    emit('successModalTap', type);
}
</script>

<style lang="scss" scoped>
.modal-success-continer {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 9999;
    flex-direction: column;
    visibility: hidden;
    transition: all .3s ease-in;

    .success-title {
        color: yellow;
        font-size: 60px;
        font-weight: bold;
        margin-top: -200px;
        -webkit-text-stroke: 1px pink;
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