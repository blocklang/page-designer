import { create, tsx } from "@dojo/framework/core/vdom";
import FontAwesomeIcon from "dojo-fontawesome/FontAwesomeIcon";
import * as c from "bootstrap-classes";
import * as css from "./Header.m.css";

const factory = create().properties();

export default factory(function Header() {
	return (
		<div classes={[css.root]}>
			<FontAwesomeIcon icon="arrows-alt" classes={[c.text_muted, c.ml_1]} />
			<span classes={[c.text_muted, c.ml_2]}></span>
		</div>
	);
});
