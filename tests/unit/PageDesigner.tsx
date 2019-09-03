const { describe, it } = intern.getInterface("bdd");

import assertionTemplate from "@dojo/framework/testing/assertionTemplate";
import harness from "@dojo/framework/testing/harness";
import { tsx } from "@dojo/framework/core/vdom";

import * as css from "../../src/styles/PageDesigner.m.css";
import PageDesigner from "../../src/PageDesigner";
import Header from "../../src/widgets/Header";
import { User, Project, Path, Page, Permission } from "../../src/interfaces";

// login user
const user: User = {
	name: "jack",
	avatar: "url"
};

const project: Project = {
	id: 1,
	name: "project",
	createUserName: "lucy"
};

const permission: Permission = {
	canRead: true,
	canWrite: false
};

const page: Page = {
	id: 2
};

const pathes: Path[] = [{ name: "page1", path: "page1" }];

describe("PageDesigner", () => {
	const baseAssertion = assertionTemplate(() => (
		<div classes={[css.root]}>
			<Header
				editMode="Preview"
				user={user}
				project={project}
				permission={permission}
				pathes={pathes}
				onChangeEditMode={() => {}}
			/>
		</div>
	));

	it("renders", () => {
		const h = harness(() => (
			<PageDesigner user={user} project={project} permission={permission} page={page} pathes={pathes} />
		));

		h.expect(baseAssertion);
	});
});
