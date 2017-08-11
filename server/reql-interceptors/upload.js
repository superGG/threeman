const multer = require('koa-multer')
const _ = require('lodash')
const path = require('path')
const mkdirp = require('mkdirp')
const gm = require('gm')
const slash = require('slash')

const config = configSync(path.resolve(__dirname, '../upload.config.json'))

/**
 * 根据配置创建存储
 */
const storage = multer.diskStorage({
	/**
	 * 文件上传的目录
	 * @param req
	 * @param file
	 * @param cb
	 */
	destination : function (req, file, cb) {
		mkdirp.sync(config.dir)
		cb(null, config.dir)
	},
	/**
	 * 文件名称
	 * @param req
	 * @param file
	 * @param cb
	 */
	filename : function (req, file, cb) {
		let date = new Date()
		let pathParse = path.parse(file.originalname)
		let timestamp = date.getTime(),
			name = pathParse.name,
			ext = pathParse.ext == '' ? '' : pathParse.ext.substring(1)
		let filename = `${timestamp}-${name}.${ext}`
		cb(null, filename)
	}
})
/**
 * 上传实例
 */
const upload = multer({
	storage : storage
})
/**
 * 可以接受one array任意类型
 */
const uploadAny = upload.any()

exports.common = async ({ctx}) => {
	let res = ctx.response
	try {
		//上传文件
		await uploadAny(ctx)
		if (ctx.req.files == null || ctx.req.files.length == 0) {
			res.status = 400
			res.body = {
				error : true,
				message : '没有上传文件'
			}
			return false
		}
		//true为需要得到缩略图，默认为false
		const thumb = ctx.req.body.thumb
		if (thumb) {
			const options = {}
			options.width = ctx.req.body.width || config.thumb.width
			//压缩图片
			await Promise.all(
				ctx.req.files
					.filter(file => file.mimetype.indexOf('image/') == 0)
					.map(async file => resize(file.path, options))
			)
		}
		let files = {}
		//遍历返回结果
		ctx.req.files.forEach(file => {
			files[file.fieldname] = config.url + slash(path.relative(config.dir, file.path))
		})
		res.body = {
			success : true,
			message : '上传成功',
			files : files
		}
		return false
	} catch (err) {
		console.error(err)
		res.body = {
			error : true,
			message : '文件上传失败'
		}
		return false
	}
}