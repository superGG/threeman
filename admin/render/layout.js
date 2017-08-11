import React from 'react'
import Parser from 'reql-template'

const RenderNode = function (components) {
	const renderNode = function(layoutEl, {parent = '', path = 0, index = 0} = {}) {
		if (layoutEl.constructor == String) {
			return layoutEl
		}
		let Type = components[layoutEl.name] || layoutEl.name
		let props = layoutEl.props || {}
		props.key = props.key || index
		props['data-reql-path'] = path
		props['data-reql-parent'] = parent
		if (layoutEl.children && layoutEl.children.length > 0) {
			let children = layoutEl.children.map((child, index) => renderNode(
				child, {
					parent : path,
					path : `${path}.${index}`,
					index
				})
			)
			return React.createElement(Type, {...props}, children)
		} else {
			return React.createElement(Type, {...props})
		}
	}
	return renderNode
}

const RenderLayout = function (components) {
	let parser = new Parser()
	const renderNode = new RenderNode(components)
	return function (layout) {
		return renderNode(parser.parse(layout))
	}
}

export default RenderLayout