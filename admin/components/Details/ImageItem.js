import React, {Component, PropTypes} from 'react'

class ImageItem extends Component {
	constructor(props) {
		super(props)
	}
	render() {
		const {
			value,
			width,
			height,
			label
		} = this.props

		return (
			<div>{label}<image src={value} width={width} height={height}/></div>
		)
	}
}

ImageItem.defaultProps = {
	width : '100px',
	height : '100%'
}

ImageItem.propTypes = {
	value : PropTypes.string.isRequired,
	label : PropTypes.string.isRequired
}

export default ImageItem