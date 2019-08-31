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
