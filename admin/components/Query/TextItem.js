import React, {Component, PropTypes} from 'react'
import {Button, Input} from 'antd'
import moment from 'moment'

class TextItem extends Component {
	constructor(props) {
		super(props)
	}
	state = {
		status : 'common'
	}
	cancel = e => {
		this.setState({
			status : 'common'
		})
	}
	save = e => {
		const {
			updateUrl
		} = this.props
	}
	handlerDoubleClick = e => {
		const {
			editor
		} = this.props
		if (editor == true) {
			this.setState({status : 'editor'})}
	}
	render() {
		const {
			text,
			record,
			time
		} = this.props

		const show = time ? moment(text).format(time) : text

		const {
			status
		} = this.state

		if (status == 'common') {
			return (
				<span
					onDoubleClick={this.handlerDoubleClick}>
						{show}
					</span>
			)
		} else if (status == 'editor') {
			return (
				<span>
					<Input value={show} size="small" style={{width : '100px'}}/>
					<Button size="small">保存</Button>
					<Button size="small" onClick={this.cancel}>取消</Button>
				</span>
			)
		}
	}
}

TextItem.propTypes = {
	time : PropTypes.string
}

export default TextItem