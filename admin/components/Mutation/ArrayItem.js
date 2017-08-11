import React, {Component, PropTypes} from 'react'
import cloneDeep from 'lodash/cloneDeep'

import Button from 'antd/lib/button'
import 'antd/lib/button/style'

import ReaderItems from './RenderItems'

/**
 * 数组类型输入
 */
class ArrayItem extends Component {
	constructor(props) {
		super(props)
	}
	state = {}
	changeValue = index => {
		return value => {
			let arr = cloneDeep(this.props.value)
			arr[index] = value
			this.props.changeValue(arr)
		}
	}
	getItemsProps(value, index) {
		let props = {
			changeValue : this.changeValue(index),
			items : this.props.items
		}
		if (value) {
			props.value = value
		}
		return props
	}
	addChild = () => {
		let arr = cloneDeep(this.props.value) || []
		arr.push({})
		this.props.changeValue(arr)
	}
	removeChild = index => {
		return () => {
			let arr = cloneDeep(this.props.value)
			arr.splice(index, 1)
			this.props.changeValue(arr)
		}
	}
	renderChildren() {
		const {
			label,
			value
		} = this.props

		return value == null ? null : value.map((child, index) => {
			return (
				<div key={index}>
					<ReaderItems {...this.getItemsProps(child, index)}/>
					<Button onClick={this.removeChild(index)}>删除{label}</Button>
				</div>
			)
		})
	}
	render() {
		const {
			label
		} = this.props

		return (
			<div>
				{label ? <p>{label}</p> : null}
				{this.renderChildren()}
				<Button onClick={e => this.addChild()}>添加{label}</Button>
			</div>
		)
	}
}

ArrayItem.propsType = {
	//渲染的项
	items : PropTypes.array.isRequired,
	//更改值的函数
	changeValue : PropTypes.func.isRequired
}

export default ArrayItem