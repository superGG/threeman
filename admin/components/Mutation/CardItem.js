import React, { Component, PropTypes } from 'react'
import {Card } from 'antd'
import './style/card-item.css'

class CardItem extends Component {

  renderCard = (type, others) => {
    switch (type) {
      case 'addNode':
        return (<Card {...others} className="addNodeItem"/>);
      case 'nodeItem':
        return (<Card loading {...others}/>)
    }
  }

  render () {
    console.log(this.props)
    console.log(this.props.children)
    const {
      type,
      ...others
    } = this.props

    return this.renderCard(type, others)
  }

}

export default CardItem