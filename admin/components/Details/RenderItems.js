import React, {Component, PropTypes} from 'react'

import TextItem from './TextItem'
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
				return <TextItem key={index} {...this.getItemProps(item)}/>
			case 'select':
				return <SelectItem key={index} {...this.getItemProps(item)}/>
			case 'radio' :
				return <RadioItem key={index} {...this.getItemProps(item)}/>
			case 'rich' :
				return <RichTextItem key={index} {...this.getItemProps(item)}/>
			case 'image' :
				return <ImageItem key={index} {...this.getItemProps(item)}/>
			case 'object' :
				return <RenderItems key={index} {...this.getItemProps(item)}/>
			case 'array' :
				return <ArrayItem key={index} {...this.getItemProps(item)} />
			default:
				return <TextItem key={index} {...this.getItemProps(item)}/>
		}
	}
	getItemProps(item) {
		const {
			value
		} = this.props

		let props = {...item.props}
		props.value = value != null ? value[item.column] : null
		props.label = item.label
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