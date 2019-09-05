import { create, tsx } from "@dojo/framework/core/vdom";
import FontAwesomeIcon from "dojo-fontawesome/FontAwesomeIcon";
import * as c from "bootstrap-classes";
import * as css from "./Header.m.css";

export interface HeaderProperties {}

const factory = create().properties<HeaderProperties>();

export default factory(function Header({ properties }) {
	const {} = properties();
	return (
		<div classes={[c.d_flex, c.justify_content_between, c.align_items_center, css.root]}>
			<div>
				<FontAwesomeIcon icon="arrows-alt" classes={[c.text_muted]} />
				<div classes={[c.d_inline_block]}>
					<nav classes={[c.d_inline_flex]}>
						<ol classes={[c.breadcrumb, css.focusWidgetPath]}>
							<li classes={[c.breadcrumb_item, c.active]}>Page</li>
						</ol>
					</nav>
				</div>
			</div>
			<div>
				<button
					type="button"
					title="最小化"
					onclick={() => {
						alert("Hi");
					}}
				>
					<FontAwesomeIcon icon="minus" />
				</button>
			</div>
		</div>
	);
});
