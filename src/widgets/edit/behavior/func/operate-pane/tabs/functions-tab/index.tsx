import { create, tsx } from "@dojo/framework/core/vdom";
import store from "@blocklang/designer-core/store";
import icache from "@dojo/framework/core/middleware/icache";
import { getFunctionsProcess } from "../../../../../../../processes/projectDependenciesProcesses";
import FontAwesomeIcon from "@blocklang/dojo-fontawesome/FontAwesomeIcon";
import * as c from "@blocklang/bootstrap-classes";
import * as css from "./index.m.css";
import { find } from "@dojo/framework/shim/array";
import { addFunctionNodeProcess } from "../../../../../../../processes/pageFunctionProcesses";

const factory = create({ store, icache }).properties();

export default factory(function Func({ middleware: { store, icache } }) {
	const { path, get, executor } = store;
	// 项目依赖的所有函数
	const repoFunctions = get(path("repoFunctions"));
	if (!repoFunctions) {
		executor(getFunctionsProcess)({});
	}

	// 存储函数列表的仓库
	const funcRepos = (get(path("projectDependencies")) || []).filter((repo) => repo.category === "WebAPI");

	return (
		<div>
			{
				// TODO: 增加搜索输入框
			}
			<div>
				{!repoFunctions && (
					<div classes={[c.text_muted, c.text_center]}>
						<div classes={[c.spinner_border]} role="status">
							<span classes={[c.visually_hidden]}>Loading...</span>
						</div>
					</div>
				)}
				{repoFunctions && repoFunctions.length === 0 && (
					<p classes={[c.text_muted, c.text_center]}>
						请在 <strong>DEPENDENCY.json</strong> 中添加客户端的函数仓库
					</p>
				)}
				{repoFunctions &&
					repoFunctions.length > 0 &&
					repoFunctions.map((repo) => {
						const apiRepoFold = icache.getOrSet<boolean>(`fold-repo-${repo.apiRepoId}`, false);
						const functionRepo = find(funcRepos, (item) => item.apiRepoId === repo.apiRepoId);
						if (!functionRepo) {
							console.warn(repo, "没有找到对应的客户端函数仓库信息");
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
									<div classes={[c.mx_1]}>
										{!repo.jsObjects || repo.jsObjects.length === 0 ? (
											<p classes={[c.text_muted, c.text_center]}>没有发现函数</p>
										) : (
											repo.jsObjects.map((jsObject) =>
												jsObject.functions.map((func, index) => (
													<div
														key={index}
														classes={[css.funcItem]}
														onclick={(): void => {
															executor(addFunctionNodeProcess)({
																apiRepoId: repo.apiRepoId,
																jsObject,
																methodSignature: func,
															});
														}}
													>
														{`${jsObject.name}.${func.name}`}
													</div>
												))
											)
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
