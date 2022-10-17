import { Ref, VNodeRef } from "vue";

export interface Game {
	nodes: Ref<CardNode[]>;
	selectedNodes: Ref<CardNode[]>;
	removeList: Ref<CardNode[]>;
	removeFlag: Ref<boolean>;
	backFlag: Ref<boolean>;
    shuffleFlag: Ref<boolean>;
	selectCardHandler: (node: CardNode) => void;
    selectRemoveCardHandler: (node: CardNode) => void;
	shuffleCardListHandler: () => void;
	rollbackOneCardHandler: () => void;
	removeThreeCardHandler: () => void;
	initCardList: (config?: GameConfig) => void;
}

// 卡片节点类型
export type CardNode = {
	id: string; // 节点id zIndex-index
	type: string; // 类型
	zIndex: number; // 图层
	index: number; // 所在图层中的索引
	parents: CardNode[]; // 父节点
	row: number; // 行
	column: number; // 列
	top: number;
	left: number;
	state: number; // 卡片四种状态  0： 无状态  1： 可点击 2：已选 3：已消除
    nodeIndex: number;
    ref?:  undefined | HTMLElement
};

export interface GameConfig {
	container?: Ref<HTMLElement | undefined>; // cardNode容器
	cardNum: number; // card类型数量
	layerNum: number; // card层数
	events?: GameEvents; //  游戏事件
}

interface GameEvents {
	clickCallback?: (card: CardNode) => void;
    removeCallback?: () => void;
    rollCallback?: (card: CardNode) => void;
	dropCallback?: () => void;
	winCallback?: () => void;
	loseCallback?: () => void;
}
