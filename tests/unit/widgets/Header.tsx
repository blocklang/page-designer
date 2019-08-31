const { describe, it } = intern.getInterface("bdd");

import assertionTemplate from "@dojo/framework/testing/assertionTemplate";
import harness from "@dojo/framework/testing/harness";
import { tsx } from "@dojo/framework/core/vdom";
import FontAwesomeIcon from "dojo-fontawesome/FontAwesomeIcon";
import Header from "../../../src/widgets/Header";
import { User, Project, Path, Permission } from "../../../src/interfaces";

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

const pathes: Path[] = [{ name: "page1", path: "page1" }];

describe("Header", () => {
	const baseAssertion = assertionTemplate(() => (
		<div>
			<FontAwesomeIcon icon={["far", "arrow-alt-circle-left"]} />
		</div>
	));

	it("renders", () => {
		const h = harness(() => <Header user={user} project={project} permission={permission} pathes={pathes} />);

		h.expect(baseAssertion);
	});
});
