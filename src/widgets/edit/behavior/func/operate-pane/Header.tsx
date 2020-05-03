import { create, tsx } from "@dojo/framework/core/vdom";
import store from "@blocklang/designer-core/store";
import FontAwesomeIcon from "dojo-fontawesome/FontAwesomeIcon";
import * as c from "bootstrap-classes";
import * as css from "./Header.m.css";

export interface HeaderProperties {}

const factory = create({ store }).properties<HeaderProperties>();

export default factory(function Header({ properties, middleware: { store } }) {
	return (
		<div classes={[css.root]}>
			<FontAwesomeIcon icon="arrows-alt" classes={[c.text_muted, c.ml_1]} />
			<span classes={[c.text_muted, c.ml_2]}></span>
		</div>
	);
});
