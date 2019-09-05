import { create, tsx } from "@dojo/framework/core/vdom";

export interface PropertiesTabProperties {}

const factory = create().properties<PropertiesTabProperties>();

export default factory(function PropertiesTab({ properties }) {
	const {} = properties();
	return <div>属性面板</div>;
});
