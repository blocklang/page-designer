import { create, tsx } from "@dojo/framework/core/vdom";
import { Func } from "designer-core/interfaces";

export interface EditorProperties {
	functions: Func[];
}

const factory = create().properties<EditorProperties>();

export default factory(function Editor({ properties }) {
	const {} = properties();
	return <div>编辑器</div>;
});
