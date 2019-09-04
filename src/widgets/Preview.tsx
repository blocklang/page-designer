import { create, tsx } from "@dojo/framework/core/vdom";

export interface PreviewProperties {}

const factory = create().properties<PreviewProperties>();

export default factory(function Preview({ properties }) {
	const {} = properties();
	return <div></div>;
});
