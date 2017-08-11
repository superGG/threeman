import React, {Component, PropTypes} from 'react'

import config from '../../config'

class ImageItem extends Component {
	constructor(props) {
		super(props)
	}
	render() {
		const width = this.props.width || '50px'
		return (
			<image src={config.server + this.props.text} style={{width}}/>
		)
	}
}

ImageItem.propTypes = {
	width : PropTypes.string,
	text : PropTypes.string,
	record : PropTypes.object
}

export default ImageItem