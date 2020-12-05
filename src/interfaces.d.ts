import { WidgetProperties } from "@dojo/framework/core/interfaces";

export interface User {
	name: string;
	avatar: string;
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
 * @property id            页面标识
 * @property key           页面的 key
 * @property name          页面的显示名
 * @property appType       应用类型
 * @property deviceType    设备类型
 */
export interface Page {
	id: number;
	key: string;
	name: string;
	appType: string;
	deviceType?: string;
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
 * @type InstWidgetProperties
 *
 * 关于 AttachedWidgetProperty 和 InstWidgetProperties 两个名字的区别：
 * 1. 两个都表示添加到页面中的部件属性信息；
 * 2. InstWidgetProperties 是由 AttachedWidgetProperty[] 转换来的，是更贴近于部件实例的数据格式;
 * 3. InstWidgetProperties 在渲染时候使用，而 AttachedWidgetProperty[] 是在定义关系时使用。
 *
 * 部件的属性值
 */
export interface InstWidgetProperties extends WidgetProperties {
	[propName: string]: any;
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
 * @function customFetchHeaders   自定义 fetch 请求的 header 信息
 */
export interface RequestUrl {
	fetchApiRepoWidgets: string;
	fetchApiRepoServices: string;
	fetchApiRepoFunctions: string;
	fetchPageModel: string;
	fetchIdeDependencyInfos: string;
	savePageModel: string;
	externalScriptAndCssWebsite: string;
	customFetchHeaders?: () => { [key: string]: string };
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

// 有三类数据
// 1. 配置数据
// 2. 部件级数据
// 3. 全局数据
