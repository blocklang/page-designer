import { DimensionResults } from "@dojo/framework/core/meta/Dimensions";

export interface User {
	name: string;
	avatar: string;
}

export interface Project {
	id: number;
	name: string;
	createUserName: string;
}

/**
 *
 * 登录用户对项目的操作权限。
 *
 * 如果是匿名用户：
 * 1. 对公开项目有读的权限
 * 1. 对私有项目没有任何权限
 *
 * 如果是登录用户：
 * 1. 对自己创建的项目（包括公开和私有）有管理权限
 * 1. 对公开项目，但不是创建者，则有读的权限
 * 1. 对私有项目，不是创建者，且未被授权，则没有任何权限
 * 1. 对私有项目，不是创建者，但被授予 READ 权限，则有读权限
 * 1. 对私有项目，不是创建者，但被授予 WRITE 权限，则有写权限
 * 1. 对私有项目，不是创建者，但被授予 ADMIN 权限，则有管理权限
 */
export interface Permission {
	canRead: boolean;
	canWrite: boolean;
}

/**
 * @type Page
 *
 * 页面基本信息
 *
 * @property id    页面标识
 */
export interface Page {
	id: number;
	key: string;
	name: string;
	appType: string;
}

/**
 * @type Path
 *
 * 一个页面是存放在分组下的，本接口描述每一个分组信息。
 *
 * @property name     分组名或页面名
 * @property path     当前节点的完整路径
 */
export interface Path {
	name: string;
	path: string;
}

/**
 * @type EditMode
 *
 * 编辑模式:
 *
 * 1. Preview: 预览
 * 2. Edit: 编辑
 */
export type EditMode = "Preview" | "Edit";

/**
 * @type ViewType
 *
 * 视图类型
 *
 * 1. ui: 界面
 * 2. behavior: 行为或交互
 */
export type ViewType = "ui" | "behavior";

/**
 * @interface WidgetRepo
 *
 * 主要描述 API 部件仓库中的部件信息
 *
 * @property apiRepoId         API 仓库标识
 * @property apiRepoName       API 仓库名称，对应于 api.json 中的 name 属性
 * @property widgetCategories  分组的部件信息
 */
export interface WidgetRepo {
	apiRepoId: number;
	apiRepoName: string;
	widgetCategories: WidgetCategory[];
}

/**
 * @interface WidgetCategory
 *
 * @property name      分类名称，如果未分类，则值为 “_”
 * @property widgets   部件列表
 */
export interface WidgetCategory {
	name: string;
	widgets: Widget[];
}

/**
 * @type Widget
 *
 * UI 部件信息
 *
 * @property widgetId           部件标识
 * @property widgetName         部件名称
 * @property widgetCode         部件编码
 * @property canHasChildren     是否可以包含子部件
 * @property apiRepoId          部件所属的 API 库标识
 * @property properties         部件的属性列表，要按顺序加载全部属性
 */
export interface Widget {
	widgetId: number;
	widgetName: string;
	widgetCode: string;
	canHasChildren: boolean;
	apiRepoId: number;
	properties: WidgetProperty[];
}

export type PropertyValueType = "string" | "int" | "float" | "date" | "boolean" | "function";

/**
 * @interface WidgetProperty
 *
 * @property code           属性编码，是属性的基本信息，此字段要存入到页面模型中
 * @property name           属性名，此字段仅做显示用，如果 label 有值则优先使用 label 的值
 * @property defaultValue   属性的默认值
 * @property valueType      属性值类型,支持 string、int、float、date、boolean 和 function 类型
 */
export interface WidgetProperty {
	code: string;
	name: string;
	defaultValue?: string;
	valueType: PropertyValueType;
}

/**
 * @interface AttachedWidget
 *
 * 添加到页面中的部件信息
 *
 * @property id          部件 id，部件添加到页面中后，新生成的 id
 * @property parentId    部件的父 id，也是添加到页面中后，之前生成的 id
 * @property properties  部件的属性列表，不论是否有值，都要加载全部属性
 */
export interface AttachedWidget extends Widget {
	id: string;
	parentId: string;

	properties: AttachedWidgetProperty[];
}

/**
 * @interface AttachedWidgetProperty
 *
 * 部件添加到页面后，部件的属性信息
 *
 * @property id         属性标识，是部件添加到页面之后重新生成的 id
 * @property value      属性值
 * @property isExpr     属性值是不是包含表达式，默认为 false
 */
export interface AttachedWidgetProperty extends WidgetProperty {
	id: string;
	value?: string;
	isExpr: boolean;
}

// 部件列表中显示的是组件的 API，但是在页面中使用的是 ide 版的组件，两者之间怎么关联？

// /**
//  * @type WidgetProperty
//  *
//  * 部件的属性信息
//  *
//  * @property propId     属性标识
//  * @property name       属性名
//  * @property label      属性显示名
//  * @property value      属性值
//  * @property valueType  属性值类型,支持 string、int、float、date、boolean 类型
//  * @property nls        是否支持国际化
//  * @property options    属性可选值列表
//  */
// export interface WidgetProperty {
// 	propId: string;
// 	name: string;
// 	label: string;
// 	// FIXME:
// 	// value 存储的值类型可能为 string|number|boolean
// 	// 但是这里的 value 只以 string 类型存储，将类型信息存在 valueType 中
// 	// 如果直接使用 TypeScript 中的或类型，需要在设计器中的属性部件中对值做不同类型的转换，
// 	// 我们选择直接使用 any 类型，避免强制转换。
// 	value: string|number|boolean;
// 	valueType: string;
// 	nls: boolean;
// 	options?: PropertyValueOption[];
// }

// /**
//  * 属性值可选项
//  *
//  * @property value      可选值
//  * @property label      可选值的显示值
//  * @property iconClass  用图标表示可选值
//  */
// export interface PropertyValueOption {
// 	// FIXME:
// 	// 节点中 value 值类型为 string|undefined，这边如果指定类型会出现 number 赋值给 undefined 的错误
// 	value: string;
// 	label?: string;
// 	title?: string;
// 	iconClass: string;
// }

/**
 * @type RequestUrl
 *
 * 从服务器端请求数据的 url
 *
 * @property fetchApiRepoWidgets  用户获取 API 仓库中的部件列表
 */
export interface RequestUrl {
	fetchApiRepoWidgets: string;
	fetchPageModel: string;
	fetchIdeDependenceInfos: string;
	externalScriptAndCssWebsite: string;
}

/**
 * 设计器中跳转到其他页面时使用的路由
 *
 * @property profile       跳转到用户个人首页
 * @property parentGroup   跳转到父分组页面
 */
export interface RouteName {
	profile: string;
	parentGroup: string;
	// 因为目前 dojo route 不支持通配符，所以在此处加入自定义逻辑
	// 当支持时去除该逻辑
	gotoGroup?: (owner: string, project: string, parentPath: string) => void;
}

/**
 * @interface ComponentRepo
 *
 * 组件仓库
 *
 * @property id                 组件仓库标识
 * @property apiRepoId          该组件仓库实现的 API 仓库标识
 * @property gitRepoWebsite     托管该组件仓库的域名或者 ip 地址
 * @property gitRepoOwner       组件仓库的拥有者，是在托管网站上注册用户的登录名
 * @property gitRepoName        组件仓库的仓库名
 * @property name               组件仓库的名称，是在 component.json 中配置的名称
 * @property category           组件库分类
 * @property version            组件库的版本号，此版本不是组件库的最新版本，而是项目当前依赖的版本
 * @property std                是否标准库
 */
export interface ComponentRepo {
	id: number;
	apiRepoId: number;
	gitRepoWebsite: string;
	gitRepoOwner: string;
	gitRepoName: string;
	name: string;
	category: string;
	version: string;
	std: boolean;
}

/**
 * 页面模型
 *
 * @property pageId      页面标识
 * @property widgets     页面中的部件列表，widgets 的排列结构如下：
 *
 * 1. 一个页面只能有一个根节点；
 * 1. widgets 的第一个节点必须是根节点；
 * 1. 直属子部件紧跟父部件之后，如
 *    ```text
 *    Page
 *       Node1
 *          Node11
 *             Node111
 *          Node12
 *       Node2
 *    ```
 *
 */
export interface PageModel {
	pageId: number;
	widgets: AttachedWidget[];
}

/**
 * @type State
 *
 * 设计器的共享状态
 *
 * @property project                       项目基本信息
 * @property widgetRepos                   项目依赖的所有 widget，类型为 widget 的 API 库，按 API 库分组。
 * @property ideRepos                      项目依赖的 ide 组件库信息
 * @property pageModel                     页面模型
 * @property selectedWidgetIndex           当前选中的部件索引，是相对于全页面的索引
 * @property activeWidgetDimensions        当前选中部件的位置和大小信息等
 * @property highlightWidgetIndex          高亮显示部件的索引，是相对于全页面的索引
 * @property highlightWidgetDimensions     高亮显示部件的位置和大小信息等
 * @property dirty                         判断是否有未保存的内容，如果有则 dirty 的值为 true，否则 dirty 的值为 false，默认为 false
 */
export interface State {
	project: Project;
	widgetRepos: WidgetRepo[];
	ideRepos: ComponentRepo[];
	pageModel: PageModel;
	// ui 的焦点信息
	selectedWidgetIndex: number;
	activeWidgetDimensions: DimensionResults;
	// 页面中高亮显示部件的信息
	highlightWidgetIndex: number;
	highlightWidgetDimensions: DimensionResults;
	// 数据操作状态：保存
	dirty: boolean;
}

// 有三类数据
// 1. 配置数据
// 2. 部件级数据
// 3. 全局数据
