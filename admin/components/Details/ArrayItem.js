import React, {Component, PropTypes} from 'react'

import RenderItems from './RenderItems'

/**
 * props
 * items  渲染的列数组
 * value  父data
 */
class ArrayItem extends Component {
	constructor(props) {
		super(props)
	}
	renderItems(items, value) {
		return value.map((child, index) => <RenderItems items={items} value={child} key={index}/>)
	}
	render() {
		const {
			items,
			value
		} = this.props

		return (
			<div>
				{this.renderItems(items, value)}
			</div>
		)
	}
}

ArrayItem.propsType = {
	items : PropTypes.array.isRequired,
	value : PropTypes.object.isRequired
}

export default ArrayItem