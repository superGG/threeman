import React, {Component, PropTypes} from 'react'

import InputItem from './InputItem'
import ImageItem from './ImageItem'
import RadioItem from './RadioItem'
import SelectItem from './SelectItem'
import ObjectItem from './ObjectItem'
import ArrayItem from './ArrayItem'

class MutationItem extends Component {
	static contextTypes = {
		changeValue : PropTypes.func.isRequired,
		value : PropTypes.object
	}
	changeValue = column => {
		return value => {
			this.context.changeValue(Object.assign({}, this.context.value, {[column] : value}))
		}
	}
	renderItem(type, props) {
		props.changeValue = this.changeValue(props.column)
		props.value = this.context.value[props.column]
		switch (type) {
			case undefined:
			case 'input':
				return (
					<InputItem {...props} />
				)
			case 'image':
				return (
					<ImageItem {...props} />
				)
			case 'radio':
				return (
					<RadioItem {...props} />
				)
			case 'select':
				return (
					<SelectItem {...props} />
				)
			case 'object':
				return (
					<ObjectItem {...props} />
				)
			case 'array':
				return (
					<ArrayItem {...props} />
				)
		}
	}
	render() {
		const {
			type,
			...others
		} = this.props

		return this.renderItem(type, others)
	}
}

export default MutationItem