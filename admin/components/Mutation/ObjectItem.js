import React, {Component, PropTypes} from 'react'

class ObjectItem extends Component {
	static defaultProps = {
		value : {}
	}
	static childContextTypes = {
		changeValue : PropTypes.func.isRequired,
		value : PropTypes.object
	}
	getChildContext() {
		return {
			changeValue : this.props.changeValue,
			value : this.props.value
		}
	}
	render() {
		return (
			<div>
				<div>
					{this.props.label}
				</div>
				<div>
					{this.props.children}
				</div>
			</div>
		)
	}
}

export default ObjectItem