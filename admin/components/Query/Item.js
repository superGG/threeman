import React, {Component} from 'react'
import TextItem from './TextItem'
import ImageItem from './ImageItem'
import ActionItem from './ActionItem'

class QueryItem extends Component {
	renderItem(type, props) {
		switch (type) {
			case undefined:
			case 'text':
				return (
					<TextItem {...props} />
				)
			case 'image':
				return (
					<ImageItem {...props} />
				)
			case 'action':
				return (
					<ActionItem {...props} />
				)
		}
	}
	render() {
		const {
			type,
			...other
		} = this.props

		return this.renderItem(type, other)
	}
}

export default QueryItem