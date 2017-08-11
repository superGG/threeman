import React, {Component, PropTypes} from 'react'

class TextItem extends Component {
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

TextItem.propsType = {
	label : PropTypes.string.isRequired
}

export default TextItem