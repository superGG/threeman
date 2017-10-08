const xml2js = require('xml2js')

const XmlParser = () => {
	const parser = new xml2js.Parser()
	return xml => {
		return new Promise((resolve, reject) => {
			parser.parseString(xml, (err, result) => {
				if (err) return reject(err)
				resolve(result)
			})
		})
	}
}

exports.xmlParser = XmlParser()