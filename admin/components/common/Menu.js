import React, {Component} from 'react'

import AntdMenu from 'antd/lib/menu'
import 'antd/lib/menu/style'

class Menu extends Component{
	constructor(props) {
		super(props)
	}
	state = {
		props : {},
		openKeys : []
	}
	componentWillMount() {
		let self = this
		let {children, ...props} = this.props
		props.onClick = function ({item, key, keyPath}) {
			if (item.props.path) {
				//切换路由
				self.context.router.push(item.props.path)
			}
		}
		this.state.props = props
	}
	onOpenChange = (openKeys) => {
		if (openKeys.length == 2) {
			openKeys.splice(0, 1)
		}
		this.setState({
			openKeys
		})
	}
	render() {
		return React.createElement(
			AntdMenu, {
				onOpenChange : this.onOpenChange,
				openKeys : this.state.openKeys,
				...this.state.props
			}, this.props.children)
	}
}

Menu.contextTypes = {
	router: React.PropTypes.object
}

export default Menu