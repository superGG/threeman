import React, {Component, PropTypes} from 'react'

class RichTextItem extends Component {
	constructor(props) {
		super(props)
	}
	render() {
		const {
			label,
			value
		} = this.props
		return (
			<div>
				<p>{label}</p>
				<div dangerouslySetInnerHTML={{__html: value}} />
			</div>
		)
	}
}

export default RichTextItem