import initRoutes from './init-routes'

const scanRoutes = (context) => {
	let routes = []
	context.keys()
		.map(layout => layout.substring(2).split('/'))
		.sort((before, next) => before.length - next.length)
		.forEach(paths => {
			let last = paths[paths.length - 1]
			let path = last.substring(0, last.lastIndexOf('.'))
			let layout = paths.reduce((previous, path) =>
				previous + '/' +path
			, '.')
			layout = context(layout)
			if (paths.length == 1) {
				routes.push({
					path,
					layout,
					childRoutes : []
				})
			} else {
				let parent = getParentRoute(paths, routes)
				if (parent) {
					parent.childRoutes.push({
						path,
						layout,
						childRoutes : []
					})
				}
			}
		})
	return routes
}

const getParentRoute = (paths, routes) => {
	let last = paths[paths.length - 1]
	paths[paths.length - 1] = last.substring(0, last.lastIndexOf('.'))
	let parent = routes.filter(route => route.path == paths[0])[0]
	for (let i = 1; i < paths.length - 1; i ++) {
		parent = parent.childRoutes.filter(route => route.path == paths[0])[0]
	}
	return parent
}

export default (context, auth) => initRoutes(scanRoutes(context), true, auth)