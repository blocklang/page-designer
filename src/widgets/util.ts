import { DimensionResults, Size, TopLeft } from "@dojo/framework/core/meta/Dimensions";

/**
 * 获取部件的位置信息和大小信息，如果传入的 widgetDimensions 的值为 undefined，则返回的值都为 0
 *
 * @param widgetDimensions 包含选中节点的详细维度信息
 *
 * @returns 只返回 left、top、width、height 的值
 */
export function calculateOffset(widgetDimensions: DimensionResults): TopLeft & Size {
	if (!widgetDimensions) {
		return { left: 0, top: 0, width: 0, height: 0 };
	}

	const left = widgetDimensions.position.left + document.documentElement.scrollLeft;
	// 注意，大部分浏览器都支持 document.documentElement.scrollTop;
	// 但旧版本的 chrome 浏览器只支持 document.body.scrollTop
	// documentElement.scrollTop 与 body.scrollTop 其中总有一个有值，另一个为 0
	// 所以为了兼容，可以相加
	const top = widgetDimensions.position.top + (document.documentElement.scrollTop + document.body.scrollTop);
	const width = widgetDimensions.size.width;
	const height = widgetDimensions.size.height;
	return { left, top, width, height };
}
