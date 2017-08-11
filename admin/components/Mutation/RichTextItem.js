import React, {Component} from 'react'
import Simditor from 'simditor'
import 'simditor/styles/simditor.css'
const config = require('../../config')

/**
 * 图片是包含服务器路径的全路径
 * 不然可能导致客户端加载失败
 */
class RichText extends Component {
	constructor(props) {
		super(props)
	}
	state = {
		value : this.props.value || '<div></div>'
	}
	componentDidMount() {
		console.log(this.props.value)
		const uploadConfig = {
			url : config.server + config.upload,
			fileKey : 'richText'
		}
		if (this.props.width != null) {
			uploadConfig.params = {thumb : true, width : this.props.width}
		}
		this.editor = new Simditor({
			textarea: this.textarea,
			toolbar: ['title', 'bold', 'italic', 'underline', 'strikethrough', 'fontScale', 'color',
				'ol', 'ul', 'blockquote', 'code', 'table', 'link', 'image', 'indent', 'outdent', 'alignment', 'hr'],
			upload : uploadConfig,
			//允许粘贴上传图片
			pasteImage : false
		})
		this.editor.setValue(this.state.value)
		this.editor.on("valuechanged", (e, src) => {
			this.state.value = this.editor.getValue()
			this.props.changeValue(this.state.value)
		})
		//移除原来事件
		this.editor.uploader.off('uploadsuccess')
		let imageButton = this.editor.toolbar.findButton('image')
		this.editor.uploader.on('uploadsuccess', (function(_this) {
			return function(e, file, result) {
				var $img, img_path, msg;
				if (!file.inline) {
					return;
				}
				$img = file.img;
				if (!($img.hasClass('uploading') && $img.parent().length > 0)) {
					return;
				}
				if (typeof result !== 'object') {
					try {
						result = $.parseJSON(result);
					} catch (_error) {
						e = _error;
						result = {
							success: false
						};
					}
				}
				if (result.state === 'error') {
					msg = result.msg || _this._t('uploadFailed');
					alert(msg);
					img_path = _this.defaultImage;
				} else {
					let url = document.origin
					let resultUrl = result.files[file.fileKey]
					img_path = config.server + resultUrl
				}
				_this.loadImage($img, img_path, function() {
					var $mask;
					$img.removeData('file');
					$img.removeClass('uploading').removeClass('loading');
					$mask = $img.data('mask');
					if ($mask) {
						$mask.remove();
					}
					$img.removeData('mask');
					_this.editor.trigger('valuechanged');
					if (_this.editor.body.find('img.uploading').length < 1) {
						return _this.editor.uploader.trigger('uploadready', [file, result]);
					}
				});
				if (_this.popover.active) {
					_this.popover.srcEl.prop('disabled', false);
					return _this.popover.srcEl.val(result.file_path);
				}
			};
		})(imageButton));
	}
	render() {
		return (
			<div>
				<textarea
					ref={textarea => this.textarea = textarea}
					placeholder="请输入内容..." autoFocus>
				</textarea>
			</div>
		)
	}
}

export default RichText