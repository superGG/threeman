import schemas from '../../schemas.json'

const primaryKeys = {}

Object.keys(schemas).forEach(schemaName => {
	let schema = schemas[schemaName]
	Object.keys(schema).forEach(itemName => {
		let item = schema[itemName]
		if (item.primaryKey == true) {
			primaryKeys[schemaName] = itemName
		}
	})
})

export default primaryKeys