import { create, v, w } from "@dojo/framework/core/vdom";
import Data from "./Data";
import store from "../../../store";
import * as c from "bootstrap-classes";

export interface BehaviorViewProperties {}

const factory = create({ store }).properties<BehaviorViewProperties>();

export default factory(function BehaviorView({ properties, middleware: { store } }) {
	const {} = properties();
	const { get, path } = store;
	const pageModel = get(path("pageModel"));

	if (!pageModel) {
		return v("div", { key: "root" }, [
			v(
				"div",
				{
					key: "loading",
					classes: [c.spinner_border, c.text_secondary, c.text_center, c.mt_5],
					role: "status"
				},
				[v("span", { classes: [c.sr_only] }, ["Loading..."])]
			)
		]);
	}

	const pageData = pageModel.data || [];

	return v("div", { classes: [c.mx_2] }, [w(Data, { data: pageData })]);
});
