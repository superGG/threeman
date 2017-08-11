import React, {Component, PropTypes} from 'react'

class RadioItem extends Component {
	constructor(props) {
		super(props)
	}
	render() {
		const {
			label,
			value
		} = this.props

		return (
			<span>{label} : {value}</span>
		)
	}
}

RadioItem.propsType = {
	label : PropTypes.string.isRequired
}

export default RadioItem