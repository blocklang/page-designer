import { create, tsx, invalidator } from "@dojo/framework/core/vdom";
import { PageFunction, AttachedWidget, AttachedWidgetProperty, FunctionDeclaration } from "designer-core/interfaces";
import store from "designer-core/store";
import { drag } from "../../../../middleware/drag";
import { find } from "@dojo/framework/shim/array";
import { newFunctionProcess } from "../../../../processes/pageFunctionProcesses";
import dimensions from "@dojo/framework/core/middleware/dimensions";
import TitleBar from "./TitleBar";
import Editor from "./Editor";

export interface EditorProperties {
	functions: PageFunction[];
	widgets: AttachedWidget[];
}

const factory = create({ store, drag, invalidator, dimensions }).properties<EditorProperties>();

export default factory(function Func({ properties, middleware: { store, drag, invalidator, dimensions } }) {
	const { widgets = [], functions = [] } = properties();

	const { get, path, executor } = store;

	function getActiveWidget(): { node: AttachedWidget; index: number } | undefined {
		if (widgets.length === 0) {
			console.warn("页面中未添加部件。");
			return;
		}

		const selectedWidgetIndex = get(path("selectedWidgetIndex"));
		if (selectedWidgetIndex == undefined || selectedWidgetIndex === -1) {
			console.warn(`selectedWidgetIndex 的值为 ${selectedWidgetIndex}。`);
			return;
		}

		const activeWidget = widgets[selectedWidgetIndex];
		if (!activeWidget) {
			console.warn(`在页面的 widgets 列表中未找到索引为 ${selectedWidgetIndex} 的部件。`);
			return;
		}

		return { node: activeWidget, index: selectedWidgetIndex };
	}

	function getActiveProperty(activeWidget: AttachedWidget): AttachedWidgetProperty | undefined {
		const selectedWidgetPropertyIndex = get(path("selectedWidgetPropertyIndex"));
		if (selectedWidgetPropertyIndex == undefined || selectedWidgetPropertyIndex === -1) {
			console.warn(`selectedWidgetPropertyIndex 的值为 ${selectedWidgetPropertyIndex}。`);
			return;
		}

		const activeWidgetProperty = activeWidget.properties[selectedWidgetPropertyIndex];
		if (!activeWidgetProperty) {
			console.warn(`在当前选中的部件中未找到索引为 ${selectedWidgetPropertyIndex} 的属性。`);
			return;
		}

		if (activeWidgetProperty.valueType !== "function") {
			console.warn(
				`只能编辑值类型为 function 的属性，但当前选中的属性值类型为 ${activeWidgetProperty.valueType}。`
			);
			return;
		}

		return activeWidgetProperty;
	}

	const activeWidget = getActiveWidget();
	const activeWidgetProperty = activeWidget && getActiveProperty(activeWidget.node);

	// FIXME: 获取函数的逻辑，应该移到父部件中去，这样就不会在每次渲染时都要重复计算当前函数
	let currentFunction;
	if (activeWidgetProperty) {
		currentFunction = find(functions, (item) => item.id === activeWidgetProperty.value);
		// 如果在 functions 中没有找到 id 标识的函数，则创建一个。
		if (!currentFunction) {
			// TODO: pageModel 中还需要存储函数定义信息

			// 新建一个函数
			const functionDeclaration: FunctionDeclaration = {
				id: activeWidgetProperty.value!,
				name: activeWidgetProperty.name,
				arguments: activeWidgetProperty.arguments || []
			};
			executor(newFunctionProcess)({ functionDeclaration });
		}
	}

	return (
		<div key="root">
			<TitleBar
				selectedWidgetIndex={activeWidget ? activeWidget.index : -1}
				activeWidget={activeWidget && activeWidget.node}
				widgets={activeWidget ? widgets : []}
				activeWidgetProperty={activeWidgetProperty}
			/>
			<Editor pageFunction={currentFunction} />
		</div>
	);

	// if (!activeWidget || !activeWidgetProperty) {
	// 	return (
	// 		<div key="root">
	// 			<div key="title-bar">
	// 				<span key="title">页面行为</span>
	// 				<small classes={[c.ml_2, c.text_info]}>请先选择事件</small>
	// 			</div>
	// 			<div key="empty" classes={[c.text_center, c.p_5, c.border, c.mb_4, css.canvas]}>
	// 				<span classes={[c.text_muted]}>
	// 					在“界面/操作面板/属性选项卡”中选择一个事件后，在此处定义事件处理函数。
	// 				</span>
	// 			</div>
	// 		</div>
	// 	);
	// }

	// // 获取所有父部件
	// const nodePath = getNodePath(widgets, activeWidget.index);
	// const parentWidgetPathes = nodePath
	// 	.map(({ node, index }) => {
	// 		if (index === -1) {
	// 			return node.widgetName;
	// 		}
	// 		return `[${index}]${node.widgetName}`;
	// 	})
	// 	.join(" / ");

	// // FIXME: 获取函数的逻辑，应该移到父部件中去，这样就不会在每次渲染时都要重复计算当前函数
	// const currentFunction = find(functions, (item) => item.id === activeWidgetProperty.value);

	// // 如果在 functions 中没有找到 id 标识的函数，则创建一个。
	// if (!currentFunction) {
	// 	// 新建一个函数
	// 	const functionDeclaration: FunctionDeclaration = {
	// 		id: activeWidgetProperty.value!,
	// 		name: activeWidgetProperty.name,
	// 		arguments: activeWidgetProperty.arguments || []
	// 	};
	// 	executor(newFunctionProcess)({ functionDeclaration });
	// 	return;
	// }

	// // 即使没有选中任何节点，也要先显示所有节点。
	// const selectedFunctionNodeId = get(path("selectedFunctionNodeId"));
	// const selectedFunctionNode = find(currentFunction.nodes, (node) => node.id === selectedFunctionNodeId);

	// // 为让所有函数节点可以移动
	// const dragResultsMap = new Map();
	// currentFunction.nodes.forEach((node, index) => {
	// 	dragResultsMap.set(node.id, drag.get(node.id));
	// });

	// if (selectedFunctionNode) {
	// 	const dragResults = dragResultsMap.get(selectedFunctionNodeId);
	// 	if (dragResults.isDragging) {
	// 		let dragTop = selectedFunctionNode.top + dragResults.delta.y;
	// 		let dragLeft = selectedFunctionNode.left + dragResults.delta.x;
	// 		// 添加部分边界校验
	// 		if (dragTop < 0) {
	// 			dragTop = 0;
	// 		}
	// 		executor(moveFunctionNodeProcess)({ functionId: currentFunction.id, top: dragTop, left: dragLeft });
	// 	}
	// }

	// // interface VisualNode {
	// // 	id: string;
	// // 	top: number;
	// // 	left: number;
	// // 	caption: string;
	// // 	text: string;
	// // 	category: "flow_control" | "data";
	// // 	input_sequence_port?: { id: string; top?: number; left?: number }; // 注意，input 只会有0或一个点
	// // 	output_sequence_ports: { id: string; top?: number; left?: number; text: string }[];
	// // 	input_data_ports: { type: "string" | "any"; name: string }[];
	// // 	output_data_ports: { type: "string" | "any"; name: string }[];
	// // }

	// // const nodes: VisualNode[] = [
	// // 	{
	// // 		id: "1",
	// // 		top: 20,
	// // 		left: 20,
	// // 		caption: "函数",
	// // 		text: "",
	// // 		category: "flow_control",
	// // 		input_sequence_port: undefined,
	// // 		output_sequence_ports: [
	// // 			{
	// // 				id: "onValue_out_seq_port",
	// // 				text: "onValue",
	// // 				top: 20,
	// // 				left: 20
	// // 			}
	// // 		],
	// // 		input_data_ports: [],
	// // 		output_data_ports: [
	// // 			{
	// // 				type: "string",
	// // 				name: "value"
	// // 			}
	// // 		]
	// // 	},
	// // 	{
	// // 		id: "2",
	// // 		top: 200,
	// // 		left: 200,
	// // 		caption: "Set a",
	// // 		text: "",
	// // 		category: "data",
	// // 		input_sequence_port: {
	// // 			id: "setData_a_input_seq_port",
	// // 			top: 200,
	// // 			left: 200
	// // 		},
	// // 		output_sequence_ports: [
	// // 			{
	// // 				id: "",
	// // 				text: "" // 如果有文本，则不要根 input_sequence 放在一行
	// // 			}
	// // 		],
	// // 		input_data_ports: [
	// // 			{
	// // 				type: "string",
	// // 				name: "set"
	// // 			}
	// // 		],
	// // 		output_data_ports: []
	// // 	},
	// // 	{
	// // 		id: "3",
	// // 		top: 100,
	// // 		left: 500,
	// // 		caption: "Set b",
	// // 		text: "",
	// // 		category: "data",
	// // 		input_sequence_port: {
	// // 			id: "setData_b_input_seq_port",
	// // 			top: 100,
	// // 			left: 500
	// // 		},
	// // 		output_sequence_ports: [
	// // 			{
	// // 				id: "",
	// // 				text: "" // 如果有文本，则不要根 input_sequence 放在一行
	// // 			}
	// // 		],
	// // 		input_data_ports: [
	// // 			{
	// // 				type: "string",
	// // 				name: "set"
	// // 			}
	// // 		],
	// // 		output_data_ports: []
	// // 	}
	// // ];

	// // interface SequenceConnection {
	// // 	id: string;
	// // 	fromNode: string;
	// // 	fromOutput: string;
	// // 	toNode: string;
	// // 	toInput: string;
	// // }
	// // const sequenceConnections: SequenceConnection[] = [
	// // 	{
	// // 		id: "sc_1",
	// // 		fromNode: "1",
	// // 		fromOutput: "onValue_out_seq_port",
	// // 		toNode: "2",
	// // 		toInput: "setData_a_input_seq_port"
	// // 	}
	// // ];

	// const dimensionsResult = dimensions.get("canvas");

	// const drawingConnectorOffset =
	// 	drawingConnectorStartPoint && getConnectorOffset(drawingConnectorStartPoint, drawingConnectorEndPoint);
	// const drawingConnectorPath =
	// 	drawingConnectorStartPoint && getConnectorPath(drawingConnectorStartPoint, drawingConnectorEndPoint);

	// return (
	// 	<div key="root">
	// 		<div key="title-bar">
	// 			<span key="title">页面行为</span>
	// 			<small classes={[c.ml_2, c.text_muted]}>
	// 				{`${parentWidgetPathes} / `}
	// 				<strong>{`${activeWidgetProperty.name}`}</strong>
	// 			</small>
	// 		</div>
	// 		<div
	// 			key="container"
	// 			classes={[c.border, css.canvas]}
	// 			onpointermove={(event: PointerEvent) => {
	// 				if (!moving) {
	// 					return;
	// 				}
	// 				drawingConnectorEndPoint = {
	// 					x: event.clientX - dimensionsResult.position.left,
	// 					y: event.clientY - dimensionsResult.position.top
	// 				};
	// 				invalidator();

	// 				event.preventDefault();
	// 				event.stopPropagation();
	// 			}}
	// 			onpointerup={(event: PointerEvent) => {
	// 				if (!moving) {
	// 					return;
	// 				}

	// 				moving = false;

	// 				// 存储连线的起点和终点坐标
	// 				// 存储连线信息

	// 				invalidator();

	// 				event.preventDefault();
	// 				event.stopPropagation();
	// 			}}
	// 		>
	// 			<div key="canvas">
	// 				{nodes.map((node, index) => {
	// 					// 注意，此处使用 onpointerdown，而不是 onmousedown，
	// 					// 因为在 drag 中阻止了 onmousedown 的触发
	// 					if (node.category === "flow_control") {
	// 						return (
	// 							<div
	// 								key={`${node.id}`}
	// 								classes={[
	// 									c.border,
	// 									selectedFunctionNodeId === node.id && c.border_primary,
	// 									css.node
	// 								]}
	// 								styles={{ top: `${node.top}px`, left: `${node.left}px` }}
	// 								onpointerdown={(event: MouseEvent) => {
	// 									// 如果已经选中了，则不再重复选中
	// 									if (selectedFunctionNodeId !== node.id) {
	// 										executor(activeFunctionNodeProcess)({ functionNodeId: node.id });
	// 									}
	// 									event.preventDefault();
	// 								}}
	// 							>
	// 								<div classes={[c.bg_secondary, c.px_1]}>{node.caption}</div>
	// 								{node.output_sequence_ports.map((out_sequence_port) => (
	// 									<div classes={[c.d_flex, c.justify_content_between]}>
	// 										<div></div>
	// 										<div>{`${out_sequence_port.text}`}</div>
	// 										<div
	// 											onpointerdown={(event: PointerEvent) => {
	// 												drawingConnectorStartPoint = {
	// 													x: event.clientX - dimensionsResult.position.left,
	// 													y: event.clientY - dimensionsResult.position.top
	// 												};

	// 												console.log(
	// 													"drawingConnectorStartPoint",
	// 													drawingConnectorStartPoint
	// 												);

	// 												// start
	// 												moving = true;

	// 												event.preventDefault();
	// 												event.stopPropagation();
	// 											}}
	// 										>
	// 											<span classes={[c.pl_1, c.pr_2]}>
	// 												<FontAwesomeIcon icon="caret-right" />
	// 											</span>
	// 										</div>
	// 									</div>
	// 								))}

	// 								{node.output_data_ports.map((out_data_port) => {
	// 									return (
	// 										<div classes={[c.d_flex, c.justify_content_between]}>
	// 											<div></div>
	// 											<div classes={[c.ml_2]}>
	// 												<span>{out_data_port.name}</span>
	// 												<small classes={[c.ml_1, c.font_italic]}>
	// 													{out_data_port.type}
	// 												</small>
	// 											</div>
	// 											<div>
	// 												<span classes={[c.pl_1, c.pr_2, css.dataPointIcon]}>
	// 													<FontAwesomeIcon icon="circle" size="xs" />
	// 												</span>
	// 											</div>
	// 										</div>
	// 									);
	// 								})}
	// 							</div>
	// 						);
	// 					} else if(node.category === "data") {
	// 						return (
	// 							<div
	// 								key={`${node.id}`}
	// 								classes={[
	// 									c.border,
	// 									selectedFunctionNodeId === node.id && c.border_primary,
	// 									css.node
	// 								]}
	// 								styles={{ top: `${node.top}px`, left: `${node.left}px` }}
	// 								onpointerdown={(event: MouseEvent) => {
	// 									// 如果已经选中了，则不再重复选中
	// 									if (selectedFunctionNodeId !== node.id) {
	// 										executor(activeFunctionNodeProcess)({ functionNodeId: node.id });
	// 									}
	// 									//event.preventDefault();
	// 									event.stopPropagation();
	// 								}}
	// 							>
	// 								<div classes={[c.bg_secondary, c.px_1]}>{node.caption}</div>
	// 								{node.input_sequence_port &&
	// 									node.output_sequence_ports.length === 1 &&
	// 									node.output_sequence_ports[0].text === "" && (
	// 										<div classes={[c.d_flex, c.justify_content_between]}>
	// 											<div
	// 												classes={[c.pl_2, c.pr_1]}
	// 												onpointerup={(event: PointerEvent) => {
	// 													// TODO: 校验是否能放
	// 													// 如果可以放，
	// 													// 则将此作为结束点的 left 和 top 添加到数据中
	// 													// 则将此条连线加入到 connections 数组中
	// 													console.log("on pointer up");
	// 												}}
	// 											>
	// 												<FontAwesomeIcon icon="caret-right" />
	// 											</div>
	// 											<div classes={[c.pl_1, c.pr_2]}>
	// 												<FontAwesomeIcon icon="caret-right" />
	// 											</div>
	// 										</div>
	// 									)}
	// 								{node.input_data_ports.length > 0 &&
	// 									node.input_data_ports.map((input_data_port) => (
	// 										<div classes={[c.d_flex, c.justify_content_between]}>
	// 											<div>
	// 												<span classes={[c.pl_2, c.pr_1, css.dataPointIcon]}>
	// 													<FontAwesomeIcon icon="circle" size="xs" />
	// 												</span>

	// 												<small classes={[c.font_italic]}>{input_data_port.type}</small>
	// 												<span classes={[c.ml_1]}>{input_data_port.name}</span>
	// 												<input classes={[c.ml_1, css.inputValue]} type="text" />
	// 											</div>
	// 											<div classes={[c.mr_2]}></div>
	// 										</div>
	// 									))}
	// 							</div>
	// 						);
	// 					}
	// 				})}

	// 				{sequenceConnections.map((sc) => {
	// 					console.log("sc", sc);
	// 					const fromNode = find(nodes, (item) => item.id === sc.fromNode);
	// 					if (!fromNode) {
	// 						return;
	// 					}
	// 					console.log(1);
	// 					const toNode = find(nodes, (item) => item.id === sc.toNode);
	// 					if (!toNode) {
	// 						return;
	// 					}
	// 					console.log(2);

	// 					const startPort = find(fromNode.output_sequence_ports, (item) => item.id === sc.fromOutput);
	// 					if (!startPort) {
	// 						return;
	// 					}
	// 					console.log(3);
	// 					fromNode.input_sequence_port;
	// 					const endPort = toNode.input_sequence_port;
	// 					if (!endPort) {
	// 						return;
	// 					}

	// 					const svgWidth = Math.abs((startPort.left || 0) - (endPort.left || 0));
	// 					const svgHeight = Math.abs((startPort.top || 0) - (endPort.top || 0));
	// 					console.log(
	// 						startPort,
	// 						endPort,
	// 						startPort.left || 0,
	// 						endPort.left || 0,
	// 						(startPort.left || 0) - (endPort.left || 0)
	// 					);
	// 					console.log(4, svgWidth, svgHeight);
	// 					return (
	// 						<svg
	// 							key={sc.id}
	// 							classes={[css.svg]}
	// 							styles={{ left: `${startPort.left}px`, top: `${startPort.top}px` }}
	// 							version="1.1"
	// 							width={`${svgWidth < 2 ? 2 : svgWidth}`}
	// 							height={`${svgHeight < 2 ? 2 : svgHeight}`}
	// 							pointer-events="none"
	// 							xmnls="http://www.w3.org/2000/svg"
	// 						>
	// 							<path
	// 								d={`M0 0 L${svgWidth} ${svgHeight}`}
	// 								fill="none"
	// 								stroke="#6c757d"
	// 								stroke-width="2"
	// 								pointer-events="visibleStroke"
	// 							></path>
	// 						</svg>
	// 					);
	// 				})}

	// 				{moving && (
	// 					<svg
	// 						classes={[css.svg]}
	// 						styles={{
	// 							left: `${drawingConnectorOffset.left}px`,
	// 							top: `${drawingConnectorOffset.top}px`
	// 						}}
	// 						version="1.1"
	// 						width={`${Math.max(drawingConnectorOffset.width, 2)}`}
	// 						height={`${Math.max(drawingConnectorOffset.height, 2)}`}
	// 						pointer-events="none"
	// 						xmnls="http://www.w3.org/2000/svg"
	// 					>
	// 						<path
	// 							d={`M${drawingConnectorPath.start.x} ${drawingConnectorPath.start.y} L${drawingConnectorPath.end.x} ${drawingConnectorPath.end.y}`}
	// 							fill="none"
	// 							stroke="#6c757d"
	// 							stroke-width="2"
	// 							pointer-events="visibleStroke"
	// 						></path>
	// 					</svg>
	// 				)}
	// 			</div>
	// 		</div>
	// 	</div>
	// );
});
