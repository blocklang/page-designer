import { create, tsx } from "@dojo/framework/core/vdom";

import * as css from "./index.m.css";
import Header from "./Header";
import { drag } from "../../../../middleware/drag";
import Tab from "./tabs";

export interface UIOperatePaneProperties {
	top?: number; // 设置初始化位置
}

const factory = create({ drag }).properties<UIOperatePaneProperties>();

const OPERATE_PANE_WIDTH = 370; // 操作面板的宽度
const DRAG_BOTTOM_LIMIT = 100; // 低端拖拽的保留高度（这里包括了去除设计器上面的工具栏的高度）
const DRAG_RIGHT_LIMIT = 40; // 右侧拖拽的保留宽度

let dragRight = 0;
let dragTop = 0;

export default factory(function UIOperatePane({ properties, middleware: { drag } }) {
	const { top = 0 } = properties();

	const dragResults = drag.get("header");
	if (dragResults.isDragging) {
		dragTop += dragResults.delta.y;
		dragRight -= dragResults.delta.x;

		// 边界校验
		// 注意，用户有时需要暂时移走属性面板，以查看设计区的全貌
		// 所以，可以将属性面板的一部分移出视窗外
		// 1. 属性面板的顶端不能移出 editor 的顶部
		if (dragTop < 0) {
			dragTop = 0;
		}

		// 2. 属性面板的左侧不能移到视窗右侧外面
		if (dragRight < DRAG_RIGHT_LIMIT - OPERATE_PANE_WIDTH) {
			dragRight = DRAG_RIGHT_LIMIT - OPERATE_PANE_WIDTH;
		}

		// 3. 属性面板的顶端不能移出视窗的底部
		const clientHeight = document.documentElement.clientHeight || document.body.clientHeight;
		if (dragTop > clientHeight - DRAG_BOTTOM_LIMIT) {
			dragTop = clientHeight - DRAG_BOTTOM_LIMIT;
		}
	}

	const styles = {
		right: `${dragRight}px`,
		top: `${top + dragTop}px`,
	};

	return (
		<div key="root" classes={[css.root]} styles={styles}>
			<div key="header">
				<Header />
			</div>
			<Tab />
		</div>
	);
});
