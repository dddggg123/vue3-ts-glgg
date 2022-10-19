import { Ref, VNodeRef } from "vue";

export interface Game {
	cardList: Ref<CardNode[]>;
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
	id: string; // 卡片唯一id
	type: string; // 卡片的图标类型
    imgUrl: string; // 卡片的图标路径
	zIndex: number; // 卡片所在的图层
	index: number; // 所在图层中的索引
	parents: CardNode[]; // 卡片的
	row: number; // 卡片所在行
	column: number; // 卡片所在列
	top: number; // 卡片top距离
	left: number; // 卡片left距离
	state: number; // 卡片四种状态  0： 无状态  1：可点击 2：已选 3：已消除
    ref?:  undefined | HTMLElement // 卡片自身的dom引用
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
