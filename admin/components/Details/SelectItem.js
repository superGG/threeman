import React, {Component, PropTypes} from 'react'

class SelectItem extends Component {
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

SelectItem.propsType = {
	label : PropTypes.string.isRequired
}

export default SelectItem