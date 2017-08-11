import React, {Component} from 'react'
import {Link} from 'react-router'

class ActionItem extends Component {
	render() {
		const {
			text,
			primaryKey,
			isDelete,
			isUpdate,
			updatePage,
			deleteColumn
		} = this.props

		return (
			<span>
				{
					isDelete == true
						? <a onClick={deleteColumn(text)}><span>删除</span></a>
						: null
				}
				{
					isUpdate == true
						? <Link to={{pathname : updatePage, query : {id : text[primaryKey]}}}>更改</Link>
						: null
				}
			</span>
		)
	}
}

export default ActionItem