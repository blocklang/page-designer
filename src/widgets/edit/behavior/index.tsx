import { create, tsx } from "@dojo/framework/core/vdom";
import store from "@blocklang/designer-core/store";
import Data from "./Data";
import * as c from "@blocklang/bootstrap-classes";
import Func from "./func";

const factory = create({ store }).properties();

export default factory(function BehaviorView({ middleware: { store } }) {
	const { get, path } = store;
	const pageModel = get(path("pageModel"));

	if (!pageModel) {
		return (
			<div key="root">
				<div key="loading" classes={[c.spinner_border, c.text_secondary, c.text_center, c.mt_5]} role="status">
					<span classes={[c.visually_hidden]}>Loading...</span>
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
