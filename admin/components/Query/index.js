import React, {Component, PropTypes} from 'react'
import {Table, message} from 'antd'
import {Link} from 'react-router'

import fetch, {fetchCount} from '../../util/reql-api'
import primaryKeys from '../../util/primary-keys'
import './style/index.css'

/**
 * 默认分页链接为url/count
 */
class Query extends Component {
	constructor(props) {
		super(props)
		this.columns = this.getColumns(props)
		this.primaryKey = primaryKeys[props.model]
	}
	static defaultProps = {
		param : {},
		deleteAble : true
	}
	state = {
		columns : [],
		data : null,
		count : 0,
		page : 1,
		pageSize : this.props.pageSize || 10,
		loading : false
	}
	componentDidMount() {
		this.fetchData()
		this.fetchCount()
	}
	changePage = (num) => {
		this.state.page = num
		this.setState({
			page : num
		})
		this.fetchData()
	}
	getColumns(props) {
		const columns = []
		React.Children.forEach(props.children, child => {
			const column = {
				title: child.props.label,
				dataIndex: child.props.column,
				key: child.props.column,
				render: (text, record, index) => {
					return React.cloneElement(child, {
						text,
						index,
						deleteColumn: this.deleteColumn,
						primaryKey: this.primaryKey
					})
				}
			}
			columns.push(column)
		})
		return columns
	}
	deleteColumn = record => {
		return () => {
			this.setState({
				loading : true
			})
			let id = record[this.primaryKey]
			let url = this.props.deleteUrl || this.props.url + '/delete'
			let data = {
				[this.primaryKey] : id
			}
			fetch(url, {data}, (result, err) => {
				if (err) {
					message.error(err.message)
				} else {
					this.fetchData()
					this.fetchCount()
				}
				this.setState({
					loading : false
				})
			})
		}
	}
	fetchData() {
		this.setState({
			loading : true
		})
		let {param, page} = this.props
		if (page != false) {
			param.page = this.state.page
			param.pageSize = this.state.pageSize
		}
		fetch(this.props.url, {param}, (data, err) => {
			this.setState({
				loading : false
			})
			if (err) {
				message.error(err.message)
			} else {
				this.setState({
					data
				})
			}
		})
	}
	fetchCount() {
		if (this.props.page == false) return
		let {param} = this.props
		let url = this.props.countUrl || this.props.url + '/count'
		fetchCount(url, {param}, (count, err) => {
			if (err) {
				message.error(err.message)
			} else {
				this.setState({
					count
				})
			}
		})
	}
	render() {
		const {
			page
		} = this.props

		return (
			<div>
				<Table
					className="owner-table"
					pagination={page == false ? null : {pageSize : this.state.pageSize, total : this.state.count, onChange : this.changePage}}
					dataSource={this.state.data}
					rowKey={this.primaryKey}
					loading={this.state.loading}
					columns={this.columns}
				/>
			</div>
		)
	}
}

Query.propTypes = {
	//查询url
	url : PropTypes.string.isRequired,
	//查询实体
	model : PropTypes.string.isRequired,
	//总数查询，默认为url/count
	countUrl : PropTypes.string,
	//删除链接，默认为url/delete
	deleteUrl : PropTypes.string,
	//是否可以删除，true为可以删除，默认为true
	deleteAble : PropTypes.bool,
	//表格列表
	columns : PropTypes.arrayOf(PropTypes.object),
	//是否启用分页，默认启用
	page : PropTypes.bool,
	//分页数目，默认为10页
	pageSize : PropTypes.number
}

export default Query