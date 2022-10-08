// 获取assets静态资源
export function getAssetsHomeFile(url: string) {
	const path = `../assets/icons/${url + ".png"}`;
	const modules = import.meta.globEager("../assets/icons/*");
	return modules[path].default;
}