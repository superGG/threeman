import React, {Component, PropTypes} from 'react'

import RenderLayout from '../render/layout'
import * as components from '../render/components'

class Root extends Component {
	constructor(props) {
		super(props)
		this.renderLayout = new RenderLayout(components)
	}
	static childContextTypes = {
		children : React.PropTypes.object,
		params : React.PropTypes.object
	}
	getChildContext() {
		return {
			children : this.props.children,
			params : this.props.params
		}
	}
	render() {
		const {
			layoutEl
		} = this.props

		return layoutEl
	}
}

export default Root