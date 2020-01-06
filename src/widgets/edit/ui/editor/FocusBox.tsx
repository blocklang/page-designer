import { create, tsx } from "@dojo/framework/core/vdom";
import { HighlightBoxProperties } from "./HighlightBox";
import Box from "./Box";
import * as css from "./FocusBox.m.css";
import * as c from "bootstrap-classes";
import FontAwesomeIcon from "dojo-fontawesome/FontAwesomeIcon";
import { getPreviousIndex, getNextIndex } from "../../../../utils/pageTree";
import { getWidgetPositionAndSize } from "../../../util";
import {
	activeParentWidgetProcess,
	moveActiveWidgetPreviousProcess,
	moveActiveWidgetNextProcess,
	removeActiveWidgetProcess
} from "../../../../processes/uiProcesses";
import store from "designer-core/store";
import { AttachedWidget } from "designer-core/interfaces";

export interface FocusBoxProperties extends HighlightBoxProperties {
	selectedWidgetIndex: number;
	widgets: AttachedWidget[];
}

const factory = create({ store }).properties<FocusBoxProperties>();

export default factory(function FocusBox({ properties, middleware: { store } }) {
	const { widgetName, widgets: pageWidgets, selectedWidgetIndex } = properties();
	const { get, path, executor } = store;
	const activeWidgetDimensions = get(path("activeWidgetDimensions"));

	// 如果选中的是根节点，则不显示操作栏
	const showOperateBar = selectedWidgetIndex > 0;

	const { left, top, width, height } = getWidgetPositionAndSize(activeWidgetDimensions);
	let disableMovePreviousButton = true;
	let disableMoveNextButton = true;

	if (showOperateBar && pageWidgets && pageWidgets.length > 0) {
		disableMovePreviousButton = getPreviousIndex(pageWidgets, selectedWidgetIndex) === -1;
		disableMoveNextButton = getNextIndex(pageWidgets, selectedWidgetIndex) === -1;
	}

	return (
		<Box left={left} top={top} width={width} height={height}>
			<div key="name-bar" classes={[css.nameBar, css.nameBarPosition]}>
				{widgetName}
			</div>
			{showOperateBar && (
				<div key="operate-bar" classes={[css.operateBar, css.operateBarPosition]}>
					<div classes={[c.btn_group, c.btn_group_sm]} role="group">
						{/*选择父部件*/}
						<button
							key="active-parent"
							type="button"
							title="选择父部件"
							classes={[c.btn, c.btn_primary]}
							onclick={() => {
								executor(activeParentWidgetProcess)({});
							}}
						>
							<FontAwesomeIcon icon="level-up-alt" />
						</button>
						{/*前移部件*/}
						<button
							key="move-previous"
							type="button"
							title="前移"
							classes={[c.btn, c.btn_primary]}
							onclick={
								disableMovePreviousButton
									? undefined
									: () => {
											executor(moveActiveWidgetPreviousProcess)({});
									  }
							}
							disabled={disableMovePreviousButton}
						>
							<FontAwesomeIcon icon="step-backward" />
						</button>
						{/*后移部件*/}
						<button
							key="move-next"
							type="button"
							title="后移"
							classes={[c.btn, c.btn_primary]}
							onclick={
								disableMoveNextButton
									? undefined
									: () => {
											executor(moveActiveWidgetNextProcess)({});
									  }
							}
							disabled={disableMoveNextButton}
						>
							<FontAwesomeIcon icon="step-forward" />
						</button>
						{/*删除部件*/}
						<button
							key="remove"
							type="button"
							title="删除"
							classes={[c.btn, c.btn_primary]}
							onclick={() => {
								executor(removeActiveWidgetProcess)({});
							}}
						>
							<FontAwesomeIcon icon="trash-alt" />
						</button>
					</div>
				</div>
			)}
		</Box>
	);
});
