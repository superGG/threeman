import React, {Component} from 'react'
import md5 from 'blueimp-md5'
import Form from 'antd/lib/form'
import 'antd/lib/form/style'
import Button from 'antd/lib/button'
import 'antd/lib/button/style'
import Input from 'antd/lib/input'
import 'antd/lib/input/style'
import message from 'antd/lib/message'
import 'antd/lib/message/style'
import Icon from 'antd/lib/icon'
import 'antd/lib/icon/style'

import fetch, {setToken} from '../util/reql-api'
import './login.css'
const FormItem = Form.Item

class Login extends Component {
	constructor(props) {
		super(props)
	}
	state = {
		phone : '',
		password : ''
	}
	login = () => {
		const {
			phone,
			password
		} = this.state

		delete localStorage.token

		let param = {phone : phone, password : md5(password)}
		fetch('/admin/login', {param}, (data, err) => {
			if (err) {
				message.error(err.response.data.message)
			} else {
				message.success('登录成功')
				let token = data.token
				setToken(token)
				this.props.history.replace('/')
			}
		})
	}
	render() {
		const {
			phone,
			password
		} = this.state

		const formItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 14 },
    }

		return (
			<div className="component-login">
				<header className="header">
					<div className="welcome-text">欢迎来到</div>
					<div>OE加速器后台管理系统</div>
				</header>
				<Form layout='horizontal'>
					<FormItem>
						<Input
							prefix={<Icon type="user" style={{transform:'scale(1.2)'}}/>}
							placeholder="Login"
							value={phone}
							onChange={event => this.setState({phone : event.target.value})}
						/>
					</FormItem>
					<FormItem>
						<Input
							prefix={<Icon type="lock" style={{transform:'scale(1.2)'}}/>}
							placeholder="Password"
							type="password"
							value={password}
							onChange={event => this.setState({password : event.target.value})}
						/>
					</FormItem>
					<FormItem>
						<Button className="btn-login" onClick={this.login} type="primary">Sign in<Icon type="login"/></Button>
					</FormItem>
				</Form>
			</div>
		)
	}
}

export default Login