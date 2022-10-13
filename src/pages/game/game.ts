import { ref } from "vue";
import type { CardNode, GameConfig, Game } from "../../types/type";
import { ceil, floor, random, shuffle, cloneDeep } from "lodash-es";

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

let itemList: number[] = [];

export default function initGame(config: GameConfig): Game {
	const {
		container,
		events = {},
		...initConfig
	} = { ...defaultGameConfig, ...config };
	const histroyList = ref<CardNode[]>([]);
	const backFlag = ref(false);
	const removeFlag = ref(false);
	const shuffleFlag = ref(false);
	const removeList = ref<CardNode[]>([]);
	const preNode = ref<CardNode | null>(null);
	const nodes = ref<CardNode[]>([]);
	const indexSet = new Set();
	let perFloorNodes: CardNode[] = [];
	const selectedNodes = ref<CardNode[]>([]);
	const size = 50;
	let floorList: number[][] = [];
	let timer = 0;

	const initCardList = (config?: GameConfig | null) => {
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
		let shuffleCardImgArr = shuffle(cardImgArr);
		itemList = [];
		timer = setInterval(() => {
			delteSelectedThreeSameNodes();
		}, 500);

		// 生成节点池
		const itemTypes = new Array(cardNum).fill(0).map((_, index) => index + 1);
		for (let i = 0; i < 3 * layerNum; i++)
			itemList = [...itemList, ...itemTypes];

		if (isTrap) {
			const len = itemList.length;
			itemList.splice(len - cardNum, len);
		}
		// console.log('卡牌列表:' + JSON.stringify(itemList));
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
					top: height + (size * row - (size / 2) * index),
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
		nodes.value.forEach((o) => {
			o.state = o.parents.every((p) => p.state > 0) ? 1 : 0;
		});
		console.log("生成的元素个数:" + nodes.value.length);
	};

	/**
	 * card点击事件
	 */
	const selectCardHandler = (card: CardNode) => {
		// console.log('我点击的节点:' + JSON.stringify(card));
		if (selectedNodes.value.length === 7) {
			clearInterval(timer);
			return;
		}
		// checkSelectedNodes();
		// 为了动画效果添加延迟
		setTimeout(() => {
			card.state = 2;
			// card.id = card.id + '-click';
			preNode.value = card;
			nodes.value[card.nodeIndex] = card;
		}, 210);
		histroyList.value.push(card);
		// console.log('消除的个数:' + histroyList.value.length);
		// 判断是否有可以消除的节点
		const selectedSomeNode = selectedNodes.value.filter(
			(s) => s.type === card.type
		);
		events.clickCallback && events.clickCallback(card);
		if (selectedSomeNode.length === 2) {
			setTimeout(() => {
				// nodes.value[card.nodeIndex] = card;
				// nodes.value = nodes.value.filter(s => s.state === 0 || s.state === 1)
				// 第二个节点索引
				const secondIndex = selectedNodes.value.findIndex(
					(o) => o.id === selectedSomeNode[1].id
				);
				preNode.value = null;
				selectedNodes.value.splice(secondIndex + 1, 0, card);
				setTimeout(() => {
					// for (let i = 0; i < 3; i++) {
					//     selectedNodes.value.splice(secondIndex - 1, 1)
					// }
					delteSelectedThreeSameNodes();
					// 判断是否已经清空节点，即是否胜利
					if (
						nodes.value.every((o) => o.state > 0) &&
						removeList.value.length === 0 &&
						selectedNodes.value.length === 0
					) {
						removeFlag.value = true;
						backFlag.value = true;
						events.winCallback && events.winCallback();
					} else {
						events.dropCallback && events.dropCallback();
					}
				}, 100);
			}, 220);
		} else {
			setTimeout(() => {
				// nodes.value[card.nodeIndex] = card;
				// nodes.value = nodes.value.filter(s => s.state === 0 || s.state === 1)
				// card.state = 2
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
					events.loseCallback && events.loseCallback();
				}
			}, 220);
		}
	};

	const selectRemoveCardHandler = (card: CardNode) => {
		const index = removeList.value.findIndex((o) => o.id === card.id);
		if (index > -1) {
			removeList.value.splice(index, 1);
			selectCardHandler(card);
		}
	};

	const delteSelectedThreeSameNodes = () => {
		type mapObj = {
			[f: string]: any;
		};
		let typesArr = selectedNodes.value.map((value) => value.type);
		let typeMap: mapObj = {};
		for (let i = 0; i < typesArr.length; i++) {
			var item = typesArr[i];
			if (typeMap[item]) {
				typeMap[item]++;
			} else {
				typeMap[item] = 1;
			}
		}
		let bool = false;
		let imgType = "";
        // 判断数组中某个type是否出现3次以及以上 
        // 手动调用 消除误差
		Object.keys(typeMap).forEach((key) => {
			if (typeMap[key] >= 3) {
				bool = true;
				imgType = key;
			}
		});
		if (bool) {
			let count = 0;
			let arr: CardNode[] = [];
            // 这里将出现三次的card放到辅助数组中 用于三消
			for (let i = 0; i < selectedNodes.value.length; i++) {
				if (imgType === selectedNodes.value[i].type) {
					arr.push(selectedNodes.value[i]);
					count += 1;
					if (count === 3) {
						break;
					}
				}
			}
			// 这里取两个数组的补集
            // 相当于三消
			selectedNodes.value = selectedNodes.value.reduce(function (
				pre: CardNode[],
				cur
			) {
				if (arr.every((item) => item.id !== cur.id)) {
					pre.push(cur);
				}
				return pre;
			},
			[]);
			// console.log("误差校检中执行了3消");
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
		preNode.value = null;
		for (let i = 0; i < 3; i++) {
			const node = selectedNodes.value.shift();
			if (!node) return;
			removeList.value.push(node);
		}
	};
	/**
	 *  回退1个card事件
	 */
	const rollbackOneCardHandler = () => {
		const node = preNode.value;
		if (!node) return;
		preNode.value = null;
		backFlag.value = true;
		node.state = 0;
		const index = selectedNodes.value.findIndex((o) => o.id === node.id);
		selectedNodes.value.splice(index, 1);
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
