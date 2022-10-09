import { ref } from "vue";
import type { CardNode, GameConfig, Game } from "../../types/type";
import { ceil, floor, random, shuffle } from "lodash-es";

const cardImgArr: Array<string> = [
    "boluo",
    "caomei",
    "chelizi",
    "chengzi",
    "huolongguo",
    "lanmei",
    "liulian",
    "lizi",
    "mangguo",
    "ningmeng",
    "niuyouguo",
    "pingguo",
    "putao",
    "qiyiguo",
    "shanzhu",
    "taozi",
    "xiangjiao",
    "yangtao",
    "xigua",
    "yangtao",
    "yezi",
];

const defaultGameConfig: GameConfig = {
    cardNum: 4,
    layerNum: 2,
    trap: true,
    delNode: false,
};

export default function initGame(config: GameConfig): Game {
    const selectedCardList = ref<CardNode[]>([]);
    const removeCardList = ref<CardNode[]>([]);
    const {
        container,
        delNode,
        events = {},
        ...initConfig
    } = { ...defaultGameConfig, ...config };
    const histroyList = ref<CardNode[]>([]);
    const backFlag = ref(false);
    const removeFlag = ref(false);
    const removeList = ref<CardNode[]>([]);
    const preNode = ref<CardNode | null>(null);
    const nodes = ref<CardNode[]>([]);
    const indexSet = new Set();
    let perFloorNodes: CardNode[] = [];
    const selectedNodes = ref<CardNode[]>([]);
    const size = 60;
    let floorList: number[][] = [];

    const initCardList = () => {
        const { cardNum, layerNum, trap } = { ...initConfig, ...config };
        histroyList.value = [];
        backFlag.value = false;
        removeFlag.value = false;
        removeList.value = [];
        preNode.value = null;
        nodes.value = [];
        indexSet.clear();
        perFloorNodes = [];
        selectedNodes.value = [];
        floorList = [];
        const isTrap = trap && floor(random(0, 100)) !== 50;

        // 生成节点池
        const itemTypes = new Array(cardNum).fill(0).map((_, index) => index + 1);
        let itemList: number[] = [];
        for (let i = 0; i < 3 * layerNum; i++)
            itemList = [...itemList, ...itemTypes];

        if (isTrap) {
            const len = itemList.length;
            itemList.splice(len - cardNum, len);
        }
        console.log('卡牌列表:' + JSON.stringify(itemList));
        // 打乱节点
        itemList = shuffle(shuffle(itemList));

        // 初始化各个层级节点
        let len = 0;
        let floorIndex = 1;
        const itemLength = itemList.length;
        while (len <= itemLength) {
            const maxFloorNum = floorIndex * floorIndex;
            const floorNum = ceil(random(maxFloorNum / 2, maxFloorNum));
            floorList.push(itemList.splice(0, floorNum));
            len += floorNum;
            floorIndex++;
        }
        const containerWidth = container!.value!.clientWidth;
        const containerHeight = container!.value!.clientHeight;
        const width = containerWidth / 2;
        const height = containerHeight / 2;

        floorList.forEach((o, index) => {
            indexSet.clear();
            let i = 0;
            const floorNodes: CardNode[] = [];
            o.forEach((k) => {
                i = floor(random(0, (index + 1) ** 2));
                while (indexSet.has(i)) i = floor(random(0, (index + 1) ** 2));
                const row = floor(i / (index + 1));
                const column = index ? i % index : 0;
                const node: CardNode = {
                    id: `${index}-${i}`,
                    type: cardImgArr[k],
                    zIndex: index,
                    index: i,
                    row,
                    column,
                    top: height + (size * row - (size / 2) * index),
                    left: width + (size * column - (size / 2) * index),
                    parents: [],
                    state: 0,
                };
                const xy = [node.top, node.left];
                perFloorNodes.forEach((e) => {
                    if (
                        Math.abs(e.top - xy[0]) <= size &&
                        Math.abs(e.left - xy[1]) <= size
                    )
                        e.parents.push(node);
                });
                floorNodes.push(node);
                indexSet.add(i);
            });
            nodes.value = nodes.value.concat(floorNodes);
            perFloorNodes = floorNodes;
        });
        console.log('矩阵列表:' + JSON.stringify(floorList));
        updateState();
    };

    const updateState = () => {
        nodes.value.forEach((o) => {
            o.state = o.parents.every((p) => p.state > 0) ? 1 : 0;
        });
    };

    /**
     * card点击事件
     */
    const selectCardHandler = (card: CardNode) => {
        console.log('我点击的节点:' + JSON.stringify(card));
        if (selectedNodes.value.length === 7) return;
        card.state = 2
        histroyList.value.push(card)
        preNode.value = card
        const index = nodes.value.findIndex(o => o.id === card.id)
        if (index > -1) {
            delNode && nodes.value.splice(index, 1)
        }
        // 判断是否有可以消除的节点
        const selectedSomeNode = selectedNodes.value.filter(s => s.type === card.type)
        if (selectedSomeNode.length === 2) {
            // 第二个节点索引
            const secondIndex = selectedNodes.value.findIndex(o => o.id === selectedSomeNode[1].id)
            selectedNodes.value.splice(secondIndex + 1, 0, card)
            // 为了动画效果添加延迟
            setTimeout(() => {
                for (let i = 0; i < 3; i++) {
                    // const index = selectedNodes.value.findIndex(o => o.type === node.type)
                    selectedNodes.value.splice(secondIndex - 1, 1);
                }
                preNode.value = null
                // 判断是否已经清空节点，即是否胜利
                if (delNode ? nodes.value.length === 0 : nodes.value.every(o => o.state > 0) && removeList.value.length === 0 && selectedNodes.value.length === 0) {
                    removeFlag.value = true
                    backFlag.value = true
                    events.winCallback && events.winCallback()
                } else {
                    events.dropCallback && events.dropCallback()
                }
            }, 100)
        } else {
            events.clickCallback && events.clickCallback()
            const index = selectedNodes.value.findIndex(o => o.type === card.type)
            if (index > -1) {
                selectedNodes.value.splice(index + 1, 0, card);
            } else {
                selectedNodes.value.push(card);
            }
            // 判断卡槽是否已满，即失败
            if (selectedNodes.value.length === 7) {
                removeFlag.value = true
                backFlag.value = true
                events.loseCallback && events.loseCallback()
            }
        }
    };
    /**
     * card点击事件
     * 3个同类型的card移除事件
     */
    const selectCardAndRemoveHandler = (node: CardNode) => { };
    /**
     * 移出3个card事件
     */
    const removeThreeCardHandler = () => { };
    /**
     *  回退1个card事件
     */
    const rollbackOneCardHandler = () => { };

    return {
        nodes,
        selectedNodes,
        removeFlag,
        removeList,
        backFlag,
        selectCardHandler,
        rollbackOneCardHandler,
        removeThreeCardHandler,
        selectCardAndRemoveHandler,
        initCardList,
    };
}
