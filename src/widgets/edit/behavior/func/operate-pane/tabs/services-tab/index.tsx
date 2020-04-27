import { create, tsx } from "@dojo/framework/core/vdom";
import store from "designer-core/store";
import icache from "@dojo/framework/core/middleware/icache";
import { getServicesProcess } from "../../../../../../../processes/projectDependenciesProcesses";
import { addServiceNodeProcess } from "../../../../../../../processes/pageFunctionProcesses";
import * as c from "bootstrap-classes";
import * as css from "./index.m.css";
import { find } from "@dojo/framework/shim/array";
import FontAwesomeIcon from "dojo-fontawesome/FontAwesomeIcon";
import { HttpMethod } from "designer-core/interfaces";

export interface ApiProperties {}

const factory = create({ store, icache }).properties<ApiProperties>();

export default factory(function Api({ properties, middleware: { store, icache } }) {
	const {} = properties();
	const { path, get, executor } = store;

	const repoServices = get(path("repoServices"));
	if (!repoServices) {
		executor(getServicesProcess)({});
	}

	// FIXME: service 仓库，可能只有 api 仓库，没有 ide 仓库
	const serviceRepos = (get(path("projectDependencies")) || []).filter((repo) => repo.category === "Service");

	function getHttpMethodBadgeColor(httpMethod: HttpMethod) {
		if (httpMethod === "GET") {
			return c.badge_primary;
		}
		if (httpMethod === "POST") {
			return c.badge_success;
		}
		if (httpMethod === "PUT") {
			return `${c.badge_warning} ${c.text_white}`;
		}
		if (httpMethod === "DELETE") {
			return c.badge_danger;
		}
		return c.badge_secondary;
	}

	return (
		<div>
			{
				// TODO: 增加搜索输入框
			}
			<div>
				{!repoServices && (
					<div classes={[c.text_muted, c.text_center]}>
						<div classes={[c.spinner_border]} role="status">
							<span classes={[c.sr_only]}>Loading...</span>
						</div>
					</div>
				)}
				{repoServices && repoServices.length === 0 && (
					<p classes={[c.text_muted, c.text_center]}>
						请在 <strong>DEPENDENCE.json</strong> 中添加 Service 仓库
					</p>
				)}
				{repoServices &&
					repoServices.length > 0 &&
					repoServices.map((repo) => {
						const apiRepoFold = icache.getOrSet<boolean>(`fold-repo-${repo.apiRepoId}`, false);
						const serviceRepo = find(serviceRepos, (item) => item.apiRepoId === repo.apiRepoId);

						if (!serviceRepo) {
							console.warn(repo, "没有找到对应的 Service 仓库信息");
						}

						return (
							<div key={repo.apiRepoId} classes={[c.pb_2]}>
								<div
									classes={[c.pl_1, c.py_1, c.text_muted, css.repoNameBar]}
									onclick={() => icache.set<boolean>(`fold-repo-${repo.apiRepoId}`, !apiRepoFold)}
								>
									{apiRepoFold ? (
										<FontAwesomeIcon icon="angle-right" />
									) : (
										<FontAwesomeIcon icon="angle-down" />
									)}
									<span classes={[c.ml_1]}>{repo.apiRepoName}</span>
								</div>
								{!apiRepoFold && (
									<div>
										{repo.groups.length === 0 ? (
											<p classes={[c.text_muted, c.text_center]}>没有发现服务</p>
										) : (
											repo.groups.map((group) => {
												const groupFold = icache.getOrSet<boolean>(
													`fold-group-${repo.apiRepoId}-${group.name}`,
													false
												);
												return (
													<div key={group.name}>
														<div
															classes={[c.pl_1, c.text_muted, css.groupNameBar]}
															onclick={() =>
																icache.set<boolean>(
																	`fold-group-${repo.apiRepoId}-${group.name}`,
																	!groupFold
																)
															}
														>
															{groupFold ? (
																<FontAwesomeIcon icon="angle-right" />
															) : (
																<FontAwesomeIcon icon="angle-down" />
															)}
															<span classes={[c.ml_1]}>
																{group.name === "_" ? "未分组" : group.name}
															</span>
														</div>
														{!groupFold && (
															<div classes={[c.mx_1]}>
																{group.paths.map((pathItem) => {
																	return pathItem.operations.map((op) => {
																		return (
																			<div
																				classes={[css.opItem]}
																				onclick={() => {
																					executor(addServiceNodeProcess)({
																						service: {
																							path: pathItem.name,
																							...op,
																						},
																					});
																				}}
																			>
																				<span
																					classes={[
																						c.badge,
																						getHttpMethodBadgeColor(
																							op.httpMethod
																						),
																						css.httpMethodBadge,
																					]}
																				>
																					{op.httpMethod}
																				</span>
																				<span classes={[c.ml_1]}>
																					{pathItem.name}
																				</span>
																				<small classes={[c.text_muted, c.ml_1]}>
																					{op.description}
																				</small>
																			</div>
																		);
																	});
																})}
															</div>
														)}
													</div>
												);
											})
										)}
									</div>
								)}
							</div>
						);
					})}
			</div>
		</div>
	);
});
