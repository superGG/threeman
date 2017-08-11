import React, {Component} from 'react'

import Radio from 'antd/lib/radio'
import 'antd/lib/radio/style'

class RadioItem extends Component {
	constructor(props) {
		super(props)
	}
	state = {
		values : this.props.values || []
	}
	changeValue = e => {
		this.props.changeValue(e.target.value)
	}
	renderRadioGroup() {
		let {
			value,
			values
		} = this.props

		value = value == null ? '' : value

		return (
			<Radio.Group value={value} onChange={this.changeValue}>
				{values.map((value, index) => this.renderRadio(value, index))}
			</Radio.Group>
		)
	}
	renderRadio(value, index) {
		const {
			options
		} = this.props
		let radioValue = value[options.value]
		let label = value[options.label]
		return (
			<Radio key={index} value={radioValue}>{label}</Radio>
		)
	}
	render() {
		return this.renderRadioGroup()
	}
}

RadioItem.defaultProps = {
	options : {label : 'label', value : 'value'}
}

export default RadioItem