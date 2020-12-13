import { create, tsx } from "@dojo/framework/core/vdom";
import store from "@blocklang/designer-core/store";
import icache from "@dojo/framework/core/middleware/icache";
import { getServicesProcess } from "../../../../../../../processes/projectDependenciesProcesses";
import { addServiceNodeProcess } from "../../../../../../../processes/pageFunctionProcesses";
import * as c from "@blocklang/bootstrap-classes";
import * as css from "./index.m.css";
import { find } from "@dojo/framework/shim/array";
import FontAwesomeIcon from "@blocklang/dojo-fontawesome/FontAwesomeIcon";
import { HttpMethod } from "@blocklang/designer-core/interfaces";

const factory = create({ store, icache }).properties();

export default factory(function Api({ middleware: { store, icache } }) {
	const { path, get, executor } = store;

	const repoServices = get(path("repoServices"));
	if (!repoServices) {
		executor(getServicesProcess)({});
	}

	// FIXME: service 仓库，可能只有 api 仓库，没有 ide 仓库
	const serviceRepos = (get(path("projectDependencies")) || []).filter((repo) => repo.category === "Service");

	function getHttpMethodBadgeColor(httpMethod: HttpMethod): string {
		if (httpMethod === "GET") {
			return c.bg_primary;
		}
		if (httpMethod === "POST") {
			return c.bg_success;
		}
		if (httpMethod === "PUT") {
			return `${c.bg_warning} ${c.text_white}`;
		}
		if (httpMethod === "DELETE") {
			return c.bg_danger;
		}
		return c.bg_secondary;
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
							<span classes={[c.visually_hidden]}>Loading...</span>
						</div>
					</div>
				)}
				{repoServices && repoServices.length === 0 && (
					<p classes={[c.text_muted, c.text_center]}>
						请在 <strong>DEPENDENCY.json</strong> 中添加 Service 仓库
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
									classes={[c.ps_1, c.py_1, c.text_muted, css.repoNameBar]}
									onclick={(): void => {
										icache.set<boolean>(`fold-repo-${repo.apiRepoId}`, !apiRepoFold);
									}}
								>
									{apiRepoFold ? (
										<FontAwesomeIcon icon="angle-right" />
									) : (
										<FontAwesomeIcon icon="angle-down" />
									)}
									<span classes={[c.ms_1]}>{repo.apiRepoName}</span>
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
															classes={[c.ps_1, c.text_muted, css.groupNameBar]}
															onclick={(): void => {
																icache.set<boolean>(
																	`fold-group-${repo.apiRepoId}-${group.name}`,
																	!groupFold
																);
															}}
														>
															{groupFold ? (
																<FontAwesomeIcon icon="angle-right" />
															) : (
																<FontAwesomeIcon icon="angle-down" />
															)}
															<span classes={[c.ms_1]}>
																{group.name === "_" ? "未分组" : group.name}
															</span>
														</div>
														{!groupFold && (
															<div classes={[c.mx_1]}>
																{group.paths.map((pathItem) => {
																	return pathItem.operations.map((op, index) => {
																		return (
																			<div
																				key={index}
																				classes={[css.opItem]}
																				onclick={(): void => {
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
																				<span classes={[c.ms_1]}>
																					{pathItem.name}
																				</span>
																				<small classes={[c.text_muted, c.ms_1]}>
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
