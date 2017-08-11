import React, {Component} from 'react'
import Menu from 'antd/lib/menu'
import Icon from 'antd/lib/icon'
import 'antd/lib/icon/style'

class MenuItem extends Component{
	constructor(props) {
		super(props)
	}
	render() {
		let {title, icon, ...props} = this.props
		if (icon) {
			title = <span><Icon type={icon}/><span>{title}</span></span>
		}
		return (
			<Menu.Item {...props}>{title}</Menu.Item>
		)
	}
}

export default MenuItem