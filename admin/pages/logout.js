import React from 'react'

class Logout extends React.Component {
	constructor(props) {
		super(props)
	}
	componentDidMount() {
		delete localStorage.token
		this.props.history.replace('/login')
	}
	render() {
		return (
			<div></div>
		)
	}
}

export default Logout