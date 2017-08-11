import React from 'react'
import components from './components'
import RenderLayout from './layout'
import Root from '../containers/Root'
var minimatch = require("minimatch")

let renderLayout = new RenderLayout(components)

const checkAuth = (path, auth) => {
	if (localStorage.token == null) {
		return minimatch(path, auth.none)
	} else {
		return minimatch(path, auth.logged)
	}
}

const initRoutes = (routeArray, parent, auth) => {
	return routeArray.map(item => {
		let route = {}
		route.path = item.path == 'index' ? '/' : `/${item.path}`
		let layoutEl = item.layout.constructor == String ? renderLayout(item.layout) : item.layout.default
		if (parent === true) {
			route.component = props => {
				if (! checkAuth(route.path, auth)) {
					window.location.href = auth.login
					return <div>跳转到登陆！</div>
				}
				let query = props.location.query || {}
				return layoutEl.constructor == Function ?
					React.createElement(layoutEl, {...props, ...query}) :
					React.createElement(Root, {layoutEl, ...props, ...query})
			}
		} else {
			route.component = props => {
				if (! checkAuth(route.path, auth)) {
					window.location.href = auth.login
					return <div>跳转到登陆！</div>
				}
				const query = props.location.query || {}
				const {children, ... others} = props
				return layoutEl.constructor == Function ?
					React.createElement(layoutEl, {...others, ...query}) :
					React.cloneElement(layoutEl, {...others, ...query})
			}
		}
		if (item.childRoutes) {
			route.childRoutes = initRoutes(item.childRoutes, false, auth)
		}
		return route
	})
}

export default initRoutes