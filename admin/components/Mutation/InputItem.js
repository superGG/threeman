import React, {Component, PropTypes} from 'react'
import {Input} from 'antd'

/**
 * input类型输入
 * label  显示的label
 * changeValue  更改当前input的函数
 * value  默认的值
 */
class InputItem extends Component {
	constructor(props) {
		super(props)
	}
	state = {}
	renderInput() {
		const {
			label
		} = this.props
		let formItemProps = {}
		let inputProps = {}
		if (this.props.label) {
			formItemProps.label = this.props.label
		}
		if (this.props.placeholder) {
			inputProps.placeholder = this.props.placeholder
		}
		if (this.props.value) {
			this.state.data = this.props.value
		}
		inputProps.value = this.state.data
		inputProps.onChange = event => {
			let data = event.target.value
			this.props.changeValue(data)
			this.setState({data : data})
		}
		return (
			<span>{label} : <Input {... inputProps}/></span>
		)
	}
	render() {
		return (
			this.renderInput()
		)
	}
}

InputItem.propsType = {
	label : PropTypes.string.isRequired
}

export default InputItem