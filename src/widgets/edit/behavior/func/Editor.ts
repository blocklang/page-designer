import { create, v, w } from "@dojo/framework/core/vdom";
import { PageFunction, VisualNode, NodeConnection } from "designer-core/interfaces";
import * as c from "bootstrap-classes";
import * as css from "./Editor.m.css";
import { DNode } from "@dojo/framework/core/interfaces";
import store from "designer-core/store";
import { activeFunctionNodeProcess } from "../../../../processes/pageFunctionProcesses";
import FontAwesomeIcon from "dojo-fontawesome/FontAwesomeIcon";
import { find } from "@dojo/framework/shim/array";
import { getConnectorOffset, getConnectorPath } from "./util";

export interface EditorProperties {
	pageFunction?: PageFunction;
}

const factory = create({ store }).properties<EditorProperties>();

let isConnecting = false;
// let drawingConnectorStartPoint: { x: number; y: number };
// let drawingConnectorEndPoint: { x: number; y: number };

export default factory(function Editor({ properties, middleware: { store } }) {
	const { pageFunction } = properties();

	if (!pageFunction) {
		return v("div", { key: "root", classes: [c.border, css.root] }, [
			v("div", { classes: [c.text_center, c.text_muted, c.mt_5, c.pt_5] }, [
				`在“界面/操作面板/属性选项卡”中选择一个事件后，在此处定义事件处理函数。`
			])
		]);
	}

	const { get, path, executor } = store;
	const selectedFunctionNodeId = get(path("selectedFunctionNodeId"));
	const { nodes, sequenceConnections, dataConnections } = pageFunction;

	return v(
		"div",
		{
			key: "root",
			classes: [c.border, css.root],
			onpointermove: (event: PointerEvent) => {},
			onpointerup: (event: PointerEvent) => {}
		},
		[
			...renderNodes(),
			...renderSequenceConnections(),
			...renderDataConnections(),
			isConnecting && renderDrawingConnection()
		]
	);

	function renderNodes(): DNode[] {
		return nodes.map((node) => {
			if (node.category === "flowControl") {
				return renderFlowControlNode(node);
			} else if (node.category === "data") {
				return renderDataNode(node);
			} else {
				return v("div", { classes: [c.border, css.node] }, ["未实现"]);
			}
		});
	}

	function renderFlowControlNode(node: VisualNode): DNode {
		return v(
			"div",
			{
				key: node.id,
				classes: [c.border, node.id === selectedFunctionNodeId ? c.border_primary : undefined, css.node],
				styles: { top: `${node.top}px`, left: `${node.left}px` },
				onpointerdown: (event: PointerEvent) => {
					// 用于选中节点
					// 如果已经选中了，则不再重复选中
					if (selectedFunctionNodeId !== node.id) {
						executor(activeFunctionNodeProcess)({ functionNodeId: node.id });
					}
					event.preventDefault();
				}
			},
			[
				v("div", { key: "caption", classes: [c.bg_secondary, c.px_1] }, [node.caption]),
				node.outputSequencePorts.length === 1 &&
					v("div", { classes: [c.d_flex, c.justify_content_between] }, [
						v("div", { classes: [css.port] }),
						v("div", {}, [node.text]),
						v(
							"div",
							{
								classes: [css.port],
								onpointerdown: (event: PointerEvent) => {},
								onpointerup: (event: PointerEvent) => {}
							},
							[w(FontAwesomeIcon, { icon: "caret-right" })]
						)
					]),
				...node.outputDataPorts.map((item) =>
					v("div", { classes: [c.d_flex, c.justify_content_between] }, [
						v("div", {}, [v("span", { classes: [css.port] })]),
						v(
							"div",
							{
								onpointerdown: (event: PointerEvent) => {},
								onpointerup: (event: PointerEvent) => {}
							},
							[
								v("span", {}, [item.name]),
								v("small", { classes: [c.ml_1, c.font_italic] }, [item.type]),
								v("span", { classes: [css.port, c.ml_1] }, [
									w(FontAwesomeIcon, { icon: "circle", size: "xs" })
								])
							]
						)
					])
				)
			]
		);

		// return (<div
		//     key={node.id}
		//     classes={[c.border, node.id === selectedFunctionNodeId && c.border_primary, css.node]}
		//     styles={{ top: `${node.top}px`, left: `${node.left}px` }}
		//     onpointerdown={(event: PointerEvent) => {
		//         // 用于选中节点
		//         // 如果已经选中了，则不再重复选中
		//         if (selectedFunctionNodeId !== node.id) {
		//             executor(activeFunctionNodeProcess)({ functionNodeId: node.id });
		//         }
		//         event.preventDefault();
		//     }}>
		//     <div key="caption" classes={[c.bg_secondary, c.px_1]}>{node.caption}</div>
		//     {
		//         singleSequenceOutput && (<div classes={[c.d_flex, c.justify_content_between]}>
		//             <div classes={[css.port]}>
		//                 {
		//                     node.inputSequencePort && <FontAwesomeIcon icon="caret-right" />
		//                 }
		//             </div>
		//             <div>{node.text}</div>
		//             <div classes={[css.port]}>
		//                 <FontAwesomeIcon icon="caret-right" />
		//             </div>
		//         </div>)
		//     }
		//     {
		//         !singleSequenceOutput && (<virtual>
		//             {
		//                 node.
		//             }
		//         </virtual>)
		//     }
		// </div>);
	}

	function renderDataNode(node: VisualNode): DNode {
		const singleSequenceOutput = node.outputSequencePorts.length === 1 && node.outputSequencePorts[0].text === "";
		const singleSequenceInputAndOutput = node.inputSequencePort && singleSequenceOutput;

		return v(
			"div",
			{
				key: node.id,
				classes: [c.border, node.id === selectedFunctionNodeId ? c.border_primary : undefined, css.node],
				styles: { top: `${node.top}px`, left: `${node.left}px` },
				// FIXME: 抽取出一个事件 onSelectNode?
				onpointerdown: (event: PointerEvent) => {
					// 用于选中节点
					// 如果已经选中了，则不再重复选中
					if (selectedFunctionNodeId !== node.id) {
						executor(activeFunctionNodeProcess)({ functionNodeId: node.id });
					}
					event.preventDefault();
				}
			},
			[
				v("div", { key: "caption", classes: [c.bg_secondary, c.px_1] }, [
					node.caption,
					v("span", { classes: [c.float_right, c.text_white], onclick: () => {} }, [
						w(FontAwesomeIcon, { icon: "times" })
					])
				]),
				// sequence port
				singleSequenceInputAndOutput &&
					v("div", { classes: [c.d_flex, c.justify_content_between] }, [
						v(
							"div",
							{
								classes: [css.port],
								onpointerdown: (event: PointerEvent) => {},
								onpointerup: (event: PointerEvent) => {}
							},
							[w(FontAwesomeIcon, { icon: "caret-right" })]
						),
						v("div", {}, [node.text]),
						v(
							"div",
							{
								classes: [css.port],
								onpointerdown: (event: PointerEvent) => {},
								onpointerup: (event: PointerEvent) => {}
							},
							[w(FontAwesomeIcon, { icon: "caret-right" })]
						)
					]),
				// data ports
				...node.inputDataPorts.map((item) =>
					v("div", { classes: [c.d_flex, c.justify_content_between] }, [
						v("div", { classes: [c.d_flex, c.justify_content_start] }, [
							v(
								"div",
								{
									onpointerdown: (event: PointerEvent) => {},
									onpointerup: (event: PointerEvent) => {}
								},
								[
									v("span", { classes: [css.port, c.ml_1] }, [
										w(FontAwesomeIcon, { icon: "circle", size: "xs" })
									])
								]
							),
							v("div", {}, [
								v("div", {}, [
									v("small", { classes: [c.ml_1, c.font_italic] }, [item.type]),
									v("span", {}, [item.name])
								]),
								v("div", {}, [v("input", {})])
							])
						]),
						v("div", {}, [v("span", { classes: [css.port] })])
					])
				),
				...node.outputDataPorts.map((item) =>
					v("div", { classes: [c.d_flex, c.justify_content_between] }, [
						v("div", {}, [v("span", { classes: [css.port] })]),
						v("div", {}, [
							v("span", {}, [item.name]),
							v("small", { classes: [c.ml_1, c.font_italic] }, [item.type]),
							v(
								"span",
								{
									classes: [css.port, c.ml_1],
									onpointerdown: (event: PointerEvent) => {},
									onpointerup: (event: PointerEvent) => {}
								},
								[w(FontAwesomeIcon, { icon: "circle", size: "xs" })]
							)
						])
					])
				)
			]
		);
	}

	function renderSequenceConnections(): DNode[] {
		return sequenceConnections.map((connection) => renderSequenceConnection(connection));
	}

	function renderDataConnections(): DNode[] {
		return dataConnections.map((connection) => renderDataConnection(connection));
	}

	function renderSequenceConnection(connection: NodeConnection): DNode {
		const fromNode = find(nodes, (item) => item.id === connection.fromNode);
		if (!fromNode) {
			console.warn(`没有找到 id 为 ${connection.fromNode} 的节点`);
			return;
		}

		const toNode = find(nodes, (item) => item.id === connection.toNode);
		if (!toNode) {
			console.warn(`没有找到 id 为 ${connection.toNode} 的节点`);
			return;
		}

		const startPort = find(fromNode.outputSequencePorts, (item) => item.id === connection.fromOutput);
		if (!startPort) {
			console.warn(
				`在 id 为 ${connection.fromNode} 的节点中没有找到 id 为 ${connection.fromOutput} 的输出型端口`
			);
			return;
		}

		if (!(toNode.inputSequencePort && toNode.inputSequencePort.id === connection.toInput)) {
			console.warn(`在 id 为 ${connection.toNode} 的节点中没有找到 id 为 ${connection.toInput} 的输入型端口`);
			return;
		}
		const endPort = toNode.inputSequencePort;

		const startPoint = { x: startPort.left || 0, y: startPort.top || 0 };
		const endPoint = { x: endPort.left || 0, y: endPort.top || 0 };

		return renderConnection(startPoint, endPoint, connection);
	}

	function renderDataConnection(connection: NodeConnection): DNode {
		const fromNode = find(nodes, (item) => item.id === connection.fromNode);
		if (!fromNode) {
			console.warn(`没有找到 id 为 ${connection.fromNode} 的节点`);
			return;
		}

		const toNode = find(nodes, (item) => item.id === connection.toNode);
		if (!toNode) {
			console.warn(`没有找到 id 为 ${connection.toNode} 的节点`);
			return;
		}

		const startPort = find(fromNode.outputDataPorts, (item) => item.id === connection.fromOutput);
		if (!startPort) {
			console.warn(
				`在 id 为 ${connection.fromNode} 的节点中没有找到 id 为 ${connection.fromOutput} 的输出型端口`
			);
			return;
		}

		const endPort = find(toNode.inputDataPorts, (item) => item.id === connection.toInput);
		if (!endPort) {
			console.warn(`在 id 为 ${connection.toNode} 的节点中没有找到 id 为 ${connection.toInput} 的输入型端口`);
			return;
		}

		const startPoint = { x: startPort.left || 0, y: startPort.top || 0 };
		const endPoint = { x: endPort.left || 0, y: endPort.top || 0 };

		return renderConnection(startPoint, endPoint, connection);
	}

	function renderConnection(
		startPoint: { x: number; y: number } = { x: 0, y: 0 },
		endPoint: { x: number; y: number } = { x: 0, y: 0 },
		connection: NodeConnection
	) {
		const svgOffset = getConnectorOffset(startPoint, endPoint);
		const connectorPath = getConnectorPath(startPoint, endPoint);
		return v(
			"svg",
			{
				key: connection.id,
				classes: [css.svg],
				styles: { left: `${svgOffset.left}px`, top: `${svgOffset.top}px` },
				width: `${Math.max(svgOffset.width, 2)}`,
				height: `${Math.max(svgOffset.height, 2)}`,
				"pointer-events": "none"
			},
			[
				v("path", {
					d: `M${connectorPath.start.x} ${connectorPath.start.y} L${connectorPath.end.x} ${connectorPath.end.y}`,
					fill: "none",
					stroke: "#6c757d",
					"stroke-width": "2",
					"pointer-events": "visibleStroke"
				})
			]
		);
	}

	function renderDrawingConnection(): DNode {
		return v("svg");
	}
});
