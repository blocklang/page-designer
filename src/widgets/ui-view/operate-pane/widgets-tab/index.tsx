import { create, tsx } from "@dojo/framework/core/vdom";

import store from "../../../../store";
import * as c from "bootstrap-classes";
import { getWidgetsProcess } from "../../../../processes/widgetProcesses";

export interface WidgetsTabProperties {}

const factory = create({ store }).properties<WidgetsTabProperties>();

export default factory(function WidgetsTab({ properties, middleware: { store } }) {
	const {} = properties();
	const { path, get, executor } = store;

	let widgetRepos = get(path("widgetRepos"));

	if (!widgetRepos) {
		executor(getWidgetsProcess)({});
	} else {
		widgetRepos.forEach(
			(repo) => (repo.widgetCategories = repo.widgetCategories.filter((category) => category.widgets.length > 0))
		);
	}

	return (
		<div>
			<div classes={[c.m_1]}>
				<input classes={[c.form_control]} placeholder="搜索部件" />
			</div>
			<div>
				{widgetRepos ? (
					widgetRepos.length === 0 ? (
						<p classes={[c.text_muted, c.text_center]}>
							请在 <strong>DEPENDENCE.json</strong> 中添加部件仓库
						</p>
					) : (
						widgetRepos.map((repo) => (
							<div key={`${repo.apiRepoId}`}>
								<div>{repo.apiRepoName}</div>
								<div>
									{repo.widgetCategories.length === 0 ? (
										<p classes={[c.text_muted, c.text_center]}>无部件</p>
									) : (
										repo.widgetCategories.map((category) => (
											<div key={category.name}>
												<div>{category.name}</div>
												<div>
													<ul>
														{category.widgets.map((widget) => (
															<li key={`${widget.widgetId}`}>
																<span>{widget.widgetName}</span>
															</li>
														))}
													</ul>
												</div>
											</div>
										))
									)}
								</div>
							</div>
						))
					)
				) : (
					<div classes={[c.text_muted, c.text_center]}>
						<div classes={[c.spinner_border]} role="status">
							<span classes={[c.sr_only]}>Loading...</span>
						</div>
					</div>
				)}
			</div>
		</div>
	);
});
