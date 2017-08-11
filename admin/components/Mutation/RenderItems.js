import React, {Component, PropTypes} from 'react'

import InputItem from './InputItem'
import ImageItem from './ImageItem'
import SelectItem from './SelectItem'
import RadioItem from './RadioItem'
import RichTextItem from './RichTextItem'
import ArrayItem from './ArrayItem'

/**
 * props
 * items  渲染的列数组
 * value  父data
 */
class RenderItems extends Component {
	constructor(props) {
		super(props)
	}
	changeValue = column => {
		return value => {
			this.props.changeValue(Object.assign({}, this.props.value, {[column] : value}))
		}
	}
	renderItems() {
		const {
			items
		} = this.props

		return items.map((item, index) => {
			return this.renderItem(item, index)
		})
	}
	renderItem(item, index) {
		switch (item.type) {
			case 'input':
				return <InputItem key={index} {...this.getItemProps(item)}/>
			case 'select':
				return <SelectItem key={index} {...this.getItemProps(item)}/>
			case 'radio' :
				return <RadioItem key={index} {...this.getItemProps(item)}/>
			case 'rich' :
				return <RichTextItem key={index} {...this.getItemProps(item)}/>
			case 'image' :
				return <ImageItem key={index} {...this.getItemProps(item)}/>
			case 'array' :
				return <ArrayItem key={index} {...this.getItemProps(item)} />
			case 'object':
				return <RenderItems key={index} {...this.getItemProps(item)}/>
			default:
				return <InputItem key={index} {...this.getItemProps(item)}/>
		}
	}
	getItemProps(item) {
		let props = {...item.props}
		props.label = item.label
		props.placeholder = item.placeholder
		props.key = item.column
		props.changeValue = this.changeValue(item.column)
		if (this.props.value && this.props.value.hasOwnProperty(item.column)) {
			//父props有值，用父props值覆盖原来props的值
			props.value = this.props.value[item.column]
		}
		return props
	}
	render() {
		return (
			<div>
				{this.renderItems()}
			</div>
		)
	}
}

RenderItems.propsType = {
	items : PropTypes.array.isRequired,
	value : PropTypes.object.isRequired
}

export default RenderItems