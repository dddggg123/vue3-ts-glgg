import { ref } from "vue";
import type { CardNode, GameConfig, Game } from "../../types/type";
import { ceil, floor, random, shuffle, cloneDeep, throttle } from "lodash-es";

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
};

export default function initGame(config: GameConfig): Game {
    const {
        container,
        events = {},
        ...initConfig
    } = { ...defaultGameConfig, ...config };
    const backFlag = ref(false);
    const removeFlag = ref(false);
    const shuffleFlag = ref(false);
    const historyList = ref<CardNode[]>([]);
    const removeList = ref<CardNode[]>([]);
    const preNode = ref<CardNode | null>(null);
    const nodes = ref<CardNode[]>([]);
    const indexSet = new Set();
    let perFloorNodes: CardNode[] = [];
    const selectedNodes = ref<CardNode[]>([]);
    const size = 50;
    let floorList: number[][] = [];
    let clickCount = 1;
    let itemList: number[] = [];
    let leftNodes: CardNode[] = [];
    let rightNodes: CardNode[] = [];

    const initCardList = (config?: GameConfig | null) => {
        const { cardNum, layerNum, trap } = { ...initConfig, ...config };
        backFlag.value = false;
        removeFlag.value = false;
        shuffleFlag.value = false;
        removeList.value = [];
        selectedNodes.value = [];
        historyList.value = [];
        preNode.value = null;
        nodes.value = [];
        indexSet.clear();
        perFloorNodes = [];
        leftNodes = [];
        rightNodes = [];
        floorList = [];
        const isTrap = trap && floor(random(0, 100)) !== 50;
        let shuffleCardImgArr = shuffle(cardImgArr);
        itemList = [];
        clickCount = 1;

        // 生成节点池
        const itemTypes = new Array(cardNum).fill(0).map((_, index) => index + 1);
        for (let i = 0; i < 3 * layerNum; i++)
            itemList = [...itemList, ...itemTypes];

        if (isTrap) {
            const len = itemList.length;
            itemList.splice(len - cardNum, len);
        }

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
        const offset = 30;

        // 生成中间部分卡牌
        floorList.forEach((o, index) => {
            indexSet.clear();
            let i = 0;
            const floorNodes: CardNode[] = [];
            o.forEach((k, index1) => {
                i = floor(random(0, (index + 1) ** 2));
                while (indexSet.has(i)) i = floor(random(0, (index + 1) ** 2));
                const row = floor(i / (index + 1));
                const column = index ? i % index : 0;
                const node: CardNode = {
                    id: `${index}-${i}`,
                    type: shuffleCardImgArr[k],
                    zIndex: index,
                    index: i,
                    row,
                    column,
                    top: height + (size * row - (size / 2) * index) - offset,
                    left: width + (size * column - (size / 2) * index),
                    parents: [],
                    state: 0,
                    nodeIndex: 0,
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

        if (layerNum > 3) {
            const leftTotal = Number(cardNum * 3 / 2);
            const rightTotal = cardNum * 3 - leftTotal;
            const topOffset = containerHeight - ((layerNum > 5) ? size : 2 * size);
            // 生成左右两边的卡牌池
            for (let i = 0; i < 3; i++)
                itemList = [...itemList, ...itemTypes];
            // 打乱节点
            itemList = shuffle(shuffle(itemList));
            // 生成左边部分卡牌
            for (let j = 0; j < leftTotal; j++) {
                const node: CardNode = {
                    id: `left-${j}`,
                    type: shuffleCardImgArr[itemList[j]],
                    zIndex: j,
                    index: j,
                    row: j,
                    column: 1,
                    top: topOffset,
                    left: j * 7,
                    parents: [],
                    state: 0,
                    nodeIndex: 0,
                };
                leftNodes.push(node);
            }
            for (let j = 0; j < leftTotal; j++) {
                for (let k = leftTotal - 1; k > j; k--) {
                    leftNodes[j].parents.push(leftNodes[k]);
                }
            }
        
            // 生成右边部分卡牌
            for (let k = 0; k < rightTotal; k++) {
                const node: CardNode = {
                    id: `right-${k}`,
                    type: shuffleCardImgArr[itemList[leftTotal + k]],
                    zIndex: k,
                    index: k,
                    row: k,
                    column: 1,
                    top: topOffset,
                    left: containerWidth - k * 7 - size,
                    parents: [],
                    state: 0,
                    nodeIndex: 0,
                };
                rightNodes.push(node);
            }
            for (let j = 0; j < rightTotal; j++) {
                for (let k = rightTotal - 1; k > j; k--) {
                    rightNodes[j].parents.push(rightNodes[k]);
                }
            }
            nodes.value = nodes.value.concat(leftNodes).concat(rightNodes);
        }
        nodes.value.forEach((o) => {
            o.state = o.parents.every((p) => p.state > 0) ? 1 : 0;
        });
    };

    /**
     * card点击事件
     */
    const selectCardHandler = (card: CardNode) => {
        // console.log('我点击的节点:' + JSON.stringify(card));
        if (selectedNodes.value.length === 7) {
            return;
        }
        historyList.value.push(card);
        if (clickCount !== historyList.value.length) {
            historyList.value.pop();
            return;
        } else {
            preNode.value = card;
            events.clickCallback && events.clickCallback(card);
            setTimeout(() => {
                card.state = 2;
                card.id = card.id + '_click';
                // 判断是否有可以消除的节点
                const selectedSomeNode = selectedNodes.value.filter(
                    (s) => s.type === card.type
                );
                if (selectedSomeNode.length >= 2) {
                    const secondIndex = selectedNodes.value.findIndex(
                        (o) => o.id === selectedSomeNode[1].id
                    );
                    preNode.value = null;
                    selectedNodes.value.splice(secondIndex + 1, 0, card);
                    for (let i = 0; i < 3; i++) {
                        selectedNodes.value.splice(secondIndex - 1, 1);
                    }
                    gameResultHandler();
                } else {
                    const index = selectedNodes.value.findIndex(
                        (o) => o.type === card.type
                    );
                    if (index > -1) {
                        selectedNodes.value.splice(index + 1, 0, card);
                    } else {
                        selectedNodes.value.push(card);
                    }
                    // 判断卡槽是否已满，即失败
                    if (selectedNodes.value.length === 7) {
                        removeFlag.value = true;
                        backFlag.value = true;
                        shuffleFlag.value = true;
                        events.loseCallback && events.loseCallback();
                    }
                }
                clickCount += 1;
            }, 420);
        };
    };

    const selectRemoveCardHandler = (card: CardNode) => {
        selectCardHandler(card);
        // events.clickCallback && events.clickCallback(card);
        setTimeout(() => {
            const index = removeList.value.findIndex((o) => o.id === card.id);
            if (index > -1) {
                removeList.value.splice(index, 1);
            }
        }, 210);
    };

    const gameResultHandler = () => {
        // 判断是否已经清空节点，即是否胜利
        if (
            nodes.value.every((o) => o.state > 0) &&
            removeList.value.length === 0 &&
            selectedNodes.value.length === 0
        ) {
            removeFlag.value = true;
            backFlag.value = true;
            shuffleFlag.value = true;
            events.winCallback && events.winCallback();
        } else {
            events.dropCallback && events.dropCallback();
        }
    };

    /**
     * card点击事件
     * 3个同类型的card移除事件
     */
    const shuffleCardListHandler = () => {
        shuffleFlag.value = true;
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
        let nodesArr: Array<CardNode> = cloneDeep(nodes.value);
        // console.log('图片类型:' + JSON.stringify(typeArr));
        let nodeItem: CardNode;
        let nodeItemArr: Array<CardNode> = [];
        nodes.value = [];
        floorList.forEach((o, index) => {
            indexSet.clear();
            let i = 0;
            let floorNodes: CardNode[] = [];
            o.forEach((k, index1) => {
                let indexPath = 0;
                for (let j = 0; j < index; j++) {
                    indexPath += floorList[j].length;
                }
                indexPath += index1;
                i = floor(random(0, (index + 1) ** 2));
                while (indexSet.has(i)) i = floor(random(0, (index + 1) ** 2));
                let row = floor(i / (index + 1));
                let column = index ? i % index : 0;
                if (
                    nodesArr[indexPath].state === 0 ||
                    nodesArr[indexPath].state === 1
                ) {
                    nodeItem = {
                        top: height + (size * row - (size / 2) * index),
                        left: width + (size * column - (size / 2) * index),
                        parents: [],
                        state: 0,
                        nodeIndex: 0,
                        type: nodesArr[indexPath].type,
                        id: nodesArr[indexPath].id + "shuffle",
                        zIndex: index,
                        index: i,
                        row,
                        column,
                    };
                } else if (nodesArr[indexPath].state === 3) {
                    nodeItem = nodesArr[indexPath];
                } else {
                    nodeItem = nodesArr[indexPath];
                }
                let node: CardNode = nodeItem;
                let xy = [node.top, node.left];
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
            nodeItemArr = nodeItemArr.concat(floorNodes);
            perFloorNodes = floorNodes;
        });
        nodes.value = [...nodeItemArr];
        nodes.value.forEach((o) => {
            if (o.state !== 2) {
                o.state = o.parents.every((p) => p.state > 0) ? 1 : 0;
            }
        });
    };
    /**
     * 移出3个card事件
     */
    const removeThreeCardHandler = () => {
        if (selectedNodes.value.length < 3) return;
        removeFlag.value = true;
        events.removeCallback && events.removeCallback();
        setTimeout(() => {
            for (let i = 0; i < 3; i++) {
                const node: CardNode = selectedNodes.value.shift() as CardNode;
                node.state = 3;
                if (!node) return;
                removeList.value.push(node);
            }
            if (selectedNodes.value.length) {
                preNode.value = selectedNodes.value[selectedNodes.value.length - 1];
            } else {
                preNode.value = null;
            }
            console.log(preNode.value);
        }, 210);
    };
    /**
     *  回退1个card事件
     */
    const rollbackOneCardHandler = () => {
        const node = preNode.value;
        if (!node) return;
        // events.rollCallback && events.rollCallback(node);
        setTimeout(() => {
            // const card = selectedNodes.value[selectedNodes.value.length - 1];
            node.state = 1;
            const index = nodes.value.findIndex((o) => o.id === node.id);
            nodes.value[index] = node;
            const index1 = selectedNodes.value.findIndex((o) => o.id === node.id);
            selectedNodes.value.splice(index1, 1);
            preNode.value = null;
            backFlag.value = true;
        }, 210);
    };

    return {
        nodes,
        selectedNodes,
        removeFlag,
        removeList,
        backFlag,
        shuffleFlag,
        selectCardHandler,
        selectRemoveCardHandler,
        rollbackOneCardHandler,
        removeThreeCardHandler,
        shuffleCardListHandler,
        initCardList,
    };
}
