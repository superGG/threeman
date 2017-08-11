import React, {Component, PropTypes} from 'react'

class RouteView extends Component {
	constructor(props) {
		super(props)
	}
	static contextTypes = {
		children : React.PropTypes.object,
		params : React.PropTypes.object
	}
	render() {
		return <div>{this.context.children}</div>
	}
}

export default RouteView