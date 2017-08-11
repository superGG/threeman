import React, {Component, PropTypes} from 'react'

import {Form, Button, message} from 'antd'

import fecth from '../../util/reql-api'
import primaryKeys from '../../util/primary-keys'


/**
 * id：数据主键
 * type : 表单类型
 * value : 表单的默认值
 */
class Mutation extends Component {
	constructor(props) {
		super(props)
		this.primaryKey = primaryKeys[props.model]
	}
	static defaultProps = {
		param : {},
		style : {}
	}
	static childContextTypes = {
		changeValue : PropTypes.func.isRequired,
		value : PropTypes.object
	}
	getChildContext() {
		return {
			changeValue : this.changeValue,
			value : this.state.data
		}
	}
	state = {
		data : this.props.data || {},
		loading : false
	}
	componentDidMount() {
		//更新类型而且上层组件没有传入数据，从网络请求数据
		if (this.props.type == 'update' && ! this.props.hasOwnProperty('data')) {
			this.fetchUpdateData()
		}
	}
	fetchUpdateData() {
		const {
			param
		} = this.props

		param['id'] = this.props.id
		fecth(this.props.from, {param}, (data, err) => {
			if (err) {
				message.error(err.response.data.message)
			} else {
				if (data == null) {
					message.error('修改数据不存在')
				} else {
					this.setState({
						data
					})
				}
			}
		})
	}
	changeValue = value => {
		this.setState({
			data : value
		})
	}
	getButtonText() {
		return this.props.type == 'add' ? '新增' : '更改'
	}
	submit = () => {
		const {
			type,
			url
		} = this.props

		const {
			data
		} = this.state

		this.setState({
			loading : true
		})
		if (type == 'update') {
			data[this.primaryKey] = this.props.id
		}
		fecth(url, {data}, (result, err) => {
			this.setState({
				loading : false
			})
			if (err) {
				message.error(err.response.data.message)
			} else {
				message.info('操作成功！')
			}
		})
	}
	render() {
		const {
			style,
			className
		} = this.props

		return (
			<div className={className} style={style}>
				<Form>
					<div className={className ? `${className}-panel` : ''}>{this.props.children}</div>
					<Form.Item>
						<Button
							type="primary"
							htmlType="submit"
							size="large"
							onClick={this.submit}
							loading={this.state.loading} >
							{this.getButtonText()}
						</Button>
					</Form.Item>
				</Form>
			</div>
		)
	}
}

Mutation.propTypes = {
	//执行操作的url,add或者update
	url : PropTypes.string.isRequired,
	//数据请求url
	from : PropTypes.string,
	//操作实体
	model : PropTypes.string.isRequired,
	type : PropTypes.oneOf(['update', 'add']),
	//样式
	style : PropTypes.object
}

export default Mutation