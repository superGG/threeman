import React, {Component, PropTypes} from 'react'

import Select from 'antd/lib/select'
import 'antd/lib/select/style'
import message from 'antd/lib/message'
import 'antd/lib/message/style'

import fetch from '../../util/reql-api'
/**
 * props
 * label : 显示的label
 * url : 数据加载链接
 * values : 直接设置为values
 * options : {value : select的value, text : select的text}
 */
class SelectItem extends Component {
	static defaultProps = {
		option : {value : 'value', text : 'text'}
	}
	state = {
		values : this.props.values || []
	}
	componentDidMount() {
		if (this.props.from) {
			fetch(this.props.from, {param : this.props.param}, (data, err) => {
				if (err) {
					message.error(err.message)
				} else {
					this.setState({
						values : data
					})
				}
			})
		}
	}
	renderOptions() {
		const {
			values
		} = this.state

		return values.map((value, index) => {
			return this.renderOption(value, index)
		})
	}
	renderOption(value, index) {
		const {
			option
		} = this.props

		let optionValue = value[option.value].toString()
		let optionText = value[option.text]
		return <Select.Option key={index} value={optionValue}>{optionText}</Select.Option>
	}
	render() {
		let value = this.props.value
		value = value || ''
		return (
			<div>
				<p>{this.props.label}</p>
				<Select value={value.toString()} onChange={this.props.changeValue}>
					{this.renderOptions()}
				</Select>
			</div>
		)
	}
}

SelectItem.propTypes = {
	label : PropTypes.string.isRequired,
	from : PropTypes.string,
	values : PropTypes.array,
	option : PropTypes.object
}

export default SelectItem