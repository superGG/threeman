import React, {Component, PropTypes} from 'react'

import Icon from 'antd/lib/icon'
import 'antd/lib/icon/style'
import Upload from 'antd/lib/upload'
import 'antd/lib/upload/style'
import Spin from 'antd/lib/spin'
import 'antd/lib/spin/style'
import message from 'antd/lib/message'
import 'antd/lib/message/style'

import config from '../../config'

import './style/image-item.css'

class ImageItem extends Component {
	constructor(props) {
		super(props)
	}
	state = {
		uploading : false,
		imageUrl : this.props.value
	}
	handleUpload = info => {
		if (info.file.status == 'uploading') {
			//上传中
			this.setState({
				uploading : true
			})
		}
		if (info.file.status === 'done') {
			let imageUrl = info.file.response.files.avatar
			this.props.changeValue(imageUrl)
			this.setState({
				uploading : false
			})
			message.success(`${info.file.name} 上传成功`)
		} else if (info.file.status === 'error') {
			this.setState({
				uploading : false
			})
			message.error(`${info.file.name} 上传失败`)
		}
	}
	render() {
		const imageUrl =  this.props.value == null ? null : config.server + this.props.value
		let data = {}
		if (this.props.thumb == true) {
			data.thumb = true
		}
		if (Object.keys(data).length == 0) {
			data = null
		}
		const uploadUrl = config.server + config.reqlApi + '/upload'
		return (
			<div style={{display:'inline-block',textAlign:'center'}}>
				<Spin spinning={this.state.uploading}>
					<Upload
						className="avatar-uploader"
						name="avatar"
						showUploadList={false}
						onChange={this.handleUpload}
						data={data}
						action={uploadUrl} >
						{
							imageUrl ?
								<img src={imageUrl} alt="" className="avatar" /> :
								<Icon type="plus" className="avatar-uploader-trigger" />
						}
					</Upload>
					<p>{this.props.label}</p>
				</Spin>
			</div>
		)
	}
}

ImageItem.propTypes = {
	//true，同时生成缩略图，默认为false
	thumb : PropTypes.bool
}

export default ImageItem