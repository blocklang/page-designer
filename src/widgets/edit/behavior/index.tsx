import { create, tsx } from "@dojo/framework/core/vdom";
import store from "designer-core/store";
import Data from "./Data";
import * as c from "bootstrap-classes";
import Func from "./func";

export interface BehaviorViewProperties {}

const factory = create({ store }).properties<BehaviorViewProperties>();

export default factory(function BehaviorView({ properties, middleware: { store } }) {
	const {} = properties();
	const { get, path } = store;
	const pageModel = get(path("pageModel"));

	if (!pageModel) {
		return (
			<div key="root">
				<div key="loading" classes={[c.spinner_border, c.text_secondary, c.text_center, c.mt_5]} role="status">
					<span classes={[c.sr_only]}>Loading...</span>
				</div>
			</div>
		);
	}

	const pageData = pageModel.data || [];
	const widgets = pageModel.widgets || [];
	const functions = pageModel.functions || [];

	return (
		<div classes={[c.mx_2]}>
			<Data data={pageData} />
			<hr />
			<Func widgets={widgets} functions={functions} />
		</div>
	);
});
