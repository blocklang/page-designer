import { create, tsx } from "@dojo/framework/core/vdom";
import FontAwesomeIcon from "@blocklang/dojo-fontawesome/FontAwesomeIcon";
import * as c from "@blocklang/bootstrap-classes";
import * as css from "./MiniProgramNavigator.m.css";

const factory = create().properties();

export default factory(function MiniProgramNavigator() {
	return (
		<div key="root" classes={[css.root, c.row, c.px_2, c.py_2]}>
			<div classes={[c.col]}></div>
			<strong classes={[c.col, c.text_center]}>Mini Program</strong>
			<div classes={[c.col, c.d_flex, c.justify_content_end]}>
				<div classes={[css.capsule]}>
					<span classes={[c.px_2]}>
						<FontAwesomeIcon icon="ellipsis-h" />
					</span>
					<span classes={[c.px_2]}>
						<FontAwesomeIcon icon="dot-circle" />
					</span>
				</div>
			</div>
		</div>
	);
});
