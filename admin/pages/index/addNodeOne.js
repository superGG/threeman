import React, { Component, PropTypes } from 'react'
import {Icon, Form, Input, Button, message} from 'antd'
import fetch from '../../util/reql-api.js'
// import CardItem from '../../components/Mutation/CardItem.js'
import './addNode.css'
const FormItem = Form.Item

const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 6 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 14 },
      },
    };

class AddNodeOne extends Component {

  state = {
    nodeName : '',
    nodeLines : [
      {value: ''},
      {value: ''},
      {value: ''},
      {value: ''},
      {value: ''}      
    ],
    allNodeNames: [],
    defaultAddonBefore: 'ss://aes-256-cfb:'
  }

  componentDidMount () {
    fetch('/admin/getAllNode',{},(data,err)=>{
      this.setState({
        allNodeNames: new Set(data.map((node)=>{return node.name}))
      })
    })
  }

  handleOnCreateNode = () => {
    if(!this.handleOnCheck()){
      return message.error('请输入完整信息')
    }
    const {nodeName, nodeLines, defaultAddonBefore, allNodeNames} = this.state

    if(allNodeNames.has(nodeName)){
      this.refs.ipt_name.focus()
      return message.error('节点名称已存在，请更换')
    }

    let param = {
      name: nodeName,
      lines: nodeLines.map(line => {return {value: defaultAddonBefore+''+line.value}})
    }

    fetch('/admin/addNode_New', {data: param}, (data,err) => {
      if(err){
        return console.log(err)
      }

      message.success('新增节点成功')
    })
  }

  handleOnCheck = () => {
    return this.state.nodeLines.every((line)=>{return Boolean(line.value)}) && this.state.nodeName
  }

  handleOnChnageLine = (e, index) => {
    let _nodeLines = [...this.state.nodeLines]
    _nodeLines[index] = {value: e.target.value}
    this.setState({
      nodeLines: _nodeLines
    })
  }

  render () {

    const {nodeLines,nodeName,defaultAddonBefore} =this.state

    return (
      <div className="component-addNode">
        <div className="page-info-desc">
          <Icon type="info-circle"/>
          <span>当前页面仅用作<b>添加节点</b>操作</span>
        </div>
        <Form layout="horizontal">
          <FormItem label="节点名称">
            <Input type="text" onChange={(e)=>this.setState({nodeName: e.target.value.trim()})} ref="ipt_name"></Input>
          </FormItem>
          <FormItem label="路线地址">
            {nodeLines.map((line, index)=>{
              return (
                <div key={index}>
                  <Input type="text" addonBefore={defaultAddonBefore} onChange={(e) => this.handleOnChnageLine(e, index)}/>
                </div>
              )
            })}
          </FormItem>
          <Button type="primary" onClick={this.handleOnCreateNode}>新增节点</Button>
        </Form>
      </div>
    )
  }
}

export default AddNodeOne