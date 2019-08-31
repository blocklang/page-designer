import { create, tsx } from "@dojo/framework/core/vdom";
import FontAwesomeIcon from "dojo-fontawesome/FontAwesomeIcon";
import { User, Project, Path, Permission } from "../interfaces";

export interface HeaderProperties {
	user?: User;
	permission: Permission;
	project: Project;
	pathes: Path[];
}

const factory = create().properties<HeaderProperties>();

export default factory(function Header({ properties }) {
	return (
		<div>
			<FontAwesomeIcon icon={["far", "arrow-alt-circle-left"]} />
		</div>
	);
});
