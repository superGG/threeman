import React, {Component, PropTypes} from 'react'
import {message, Button} from 'antd'

import Mutation from '../Mutation'
import RenderItems from './RenderItems'
import fetch from '../../util/reql-api'
import primaryKeys from '../../util/primary-keys'

const Status = {
	common : 'common',
	update : 'update'
}

/**
 * id：实体id
 * 详情组件
 */
class Details extends Component {
	constructor(props) {
		super(props)
	}
	state = {
		data : null,
		status : Status.common
	}
	componentDidMount() {
		this.fetchData()
	}
	fetchData() {
		const {
			id,
			url
		} = this.props

		let param = {id}

		fetch(url, {param}, (data, err) => {
			if (err) {
				message.error(err.response.data.message)
			} else {
				this.setState({
					data
				})
			}
		})
	}
	deleteClick = e => {
		let url = this.props.deleteUrl || this.props.url + '/delete'
		let primaryKey = primaryKeys[this.props.model]
		const id = this.state.data[primaryKey]
		fetch(url, {data : {[primaryKey] : id}}, (data, err) => {
			if (err) {
				message.error(err.response.data.message)
			} else {
				message.info('删除成功')
				this.context.router.goBack()
			}
		})
	}
	renderActions() {
		const {
			updateAble,
			deleteAble
		} = this.props

		return (
			<div>
				{updateAble ? <Button onClick={e => this.setState({status : Status.update})}>更改</Button> : null}
				{deleteAble ? <Button onClick={this.deleteClick}>删除</Button> : null}
			</div>
		)
	}
	filterPrimaryItem = (items, primaryKey) => {
		return items.filter(item => item.column != primaryKey)
	}
	renderUpdate() {
		const {
			model,
			items
		} = this.props

		const {
			data
		} = this.state

		let primaryKey = primaryKeys[model]
		const id = data[primaryKey]

		const updateUrl = this.props.updateUrl || this.props.url + '/update'
		return (
			<div>
				<Mutation
					id={id}
					data={data}
					model={model}
					items={this.filterPrimaryItem(items, primaryKey)}
					updateUrl={updateUrl}
				    type="update"
				/>
			</div>
		)
	}
	renderCommon() {
		const {
			data
		} = this.state

		if (data == null) {
			return null
		}

		const {
			items
		} = this.props

		return (
			<div>
				{this.renderActions()}
				<RenderItems value={data} items={items}/>
			</div>
		)
	}
	render() {
		switch (this.state.status) {
			case Status.common:
				return this.renderCommon()
			case Status.update:
				return this.renderUpdate()
			default :
				return this.renderCommon()
		}
	}

}

Details.defaultProps = {
	deleteAble : true,
	updateAble : true
}

Details.propTypes = {
	//数据加载url
	url : PropTypes.string.isRequired,
	//实体名称
	model : PropTypes.string.isRequired,
	//数据展示列表
	items : PropTypes.array.isRequired,
	//删除数据url，默认为加载url/delete
	deleteUrl : PropTypes.string,
	//是否可以删除，true为可以删除，默认为true
	deleteAble : PropTypes.bool,
	//数据修改url，默认为加载url/update
	updateUrl : PropTypes.string,
	//是否可以修改，true为可以修改，默认为true
	updateAble : PropTypes.bool
}

Details.contextTypes = {
	router: React.PropTypes.object
}

export default Details