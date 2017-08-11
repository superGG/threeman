import React, { Component, PropTypes } from 'react'
import fetch from '../../util/reql-api.js'
import {message, Table, Form, Input, Select, Button, Row, Col, Icon, Modal, DatePicker} from 'antd'
const FormItem = Form.Item
const Option = Select.Option
const {RangePicker} = DatePicker
import './orderList.css'
import moment from 'moment'
import forMatTargetTime from '../../util/time.js'
const forMatMoment = (time) => {
  let _result = moment(time).format('YYYY-MM-DD HH:mm:ss')
  return _result === 'Invalid date' ? '❌' : _result
}

const checkTime = (time) => {
  return forMatMoment(time) < forMatMoment(new Date()) ? '已过期' : forMatMoment(time)
}

class UserListNew extends Component{

  state = {
    isMount: true,
    originData : [],
    loading: true,
    // dataCount: 0,
    count: {
      totalCount: 0,
      validUserCount: 0,
      filterCount: 0
    },
    page: 1,
    pageSize: 10,
    phone: '',
    visible: false, // 分配用户节点modal
    timeModalVisible: false, // 分配用户有效时间modal
    modalLoading: false,
    registerTime: {
      startTime: '',
      endTime: ''
    },
    currentNodeName: '',
    currentNodeId: '',
    currentUserId: '',
    nodeNames: [],
    originDataIndex: '',
    currentTimeInfo: {id: '', index: '', time: '', newTime: ''}, // 重新分配有效时间modal所需state
    isInValidUser: '',    
  }

  componentDidMount () {
    this.getTableData(true)
    this.getNodeName()
  }

  setLoading = (state, props) => {
    return {
      loading: state.loading
    }
  }

  getNodeName = () => {

    fetch('/admin/getAllNode',{},(data,err)=>{
      let _ary = []
      let result = _ary.concat(data.map((node) => {
        return {name: node.name, id: node.id}
      }))
      this.setState({
        nodeNames: result
      })
    })
  }

  getTableData = (isFilter = false) => {
    const {loading,originData,dataCount,page,pageSize,phone,registerTime,isInValidUser,isMount} = this.state

    let dynamic = `${phone ? `phone='${phone}'` : 'phone>0'}
                   ${registerTime.startTime ? `&& registerTime > '${registerTime.startTime}'` : ' && userId>0'}
                   ${registerTime.endTime? `&& registerTime < '${registerTime.endTime}'`: '' }`
    dynamic = dynamic.replace(/\s/g, '').replace(/(registerTime)(>|<)(.{11})/g, '$1$2$3 ')

    let balanceDynamic = `${isInValidUser === '已过期' ? `expire < '${forMatMoment(new Date())}'` 
                          : isInValidUser === '有效' ? `expire > '${forMatMoment(new Date())}'` : 'expire>0'}` // 查询用户是否过期

    const param = {
      page,
      pageSize,
      balanceDynamic,
      dynamic,
    }

    this.setState(this.setLoading({loading: true}))
    fetch('/admin/user/list', {param}, (data, err)=>{
      if(err) {
        message.error('出错了请稍后再试！')
      }

      this.setState({
        originData: data,
        loading: false
      })
    })

    isFilter ? fetch('/admin/user/list/count', {param}, (data,err)=>{
      this.setState(()=>{
        return isMount ? {count: Object.assign({},{totalCount: data, filterCount: data}), isMount: false} 
                : {count: Object.assign({}, this.state.count, {filterCount: data})}
      })
    }) : ''
  }

  getFields = () => {
    const formItemLayout = {
      labelCol: { span: 5 },
      wrapperCol: { span: 19 },
    }

    return (
      <Row gutter={40}>
        <Col span={8} key='userName'>
          <FormItem {...formItemLayout} label="用户名">
            <Input placeholder="请输入用户名（手机号）" onChange={(e) => this.handleOnStatus(e.target.value, 'phone')} value={this.state.phone}/>
          </FormItem>
        </Col>
        <Col span={8} key="validTime">
          <FormItem {...formItemLayout} label="有效时间">
            <Select onChange={(val)=>this.handleOnStatus(val, 'isInValidUser')} value={this.state.isInValidUser}>
              <Option value="全部" key="all">全部</Option>
              <Option value="有效" key="validUser">有效</Option>
              <Option value="已过期" key="inValidUser">已过期</Option>
            </Select>
          </FormItem>
        </Col>
        <Col span={8} key="registerTime">
          <FormItem {...formItemLayout} label="注册时间">
            <RangePicker onChange={this.onChangeRegisteTimer} />
          </FormItem>
        </Col>
      </Row>
    )
  }

  onChangeRegisteTimer = (date, dateString) => {
    this.setState({
      registerTime: Object.assign({},{startTime: `${dateString[0] ? `${dateString[0]} 00:00:00`: ''}`, 
                                      endTime:   `${dateString[1] ? `${dateString[1]} 24:00:00`: ''}`})
    })
  }

  handleOnStatus = (value, key) => {
    this.setState({
      [key]: value
    })
  }

  handleSearch = (e) => {
    e.preventDefault();
    const {dynamic} = this.state
    this.getTableData(true)
  }
  
  handleReset = () => {
    this.setState({
      phone: '',
      isInValidUser: '',
      registerTime: {startTime: '', endTime: ''}
    })
  }

  handleTableChange = (pagination) => {
    const {current} = pagination
    this.setState({
      page: current
    },()=>{
      this.getTableData()
    })
  }

  middleCheckName = (record, index) => {
    let obj = {}
    let _currentNodeName = record.userNode ? record.userNode.node.name : ''
    obj = Object.assign({}, {visible: true, currentUserId: record.userId, currentNodeName: _currentNodeName, originDataIndex: index})
    this.setState(obj)
  }

  renderColumn = () => {return [{
  title: 'Id',
  dataIndex: 'userId',
  key: 'userId',
}, {
  title: '用户',
  dataIndex: 'phone',
  key: 'phone'
}, {
  title: '最近登录时间',
  dataIndex: 'lastLoginTime',
  key: 'lastLoginTime',
  render: (text)=>{
    return forMatTargetTime(text)        
  }
}, {
  title: '注册时间',
  dataIndex: 'registerTime',
  key: 'registerTime',
  render: (text) => {
    return forMatMoment(text)
  }
}, {
  title: '过期时间',
  dataIndex: 'balance.expire',
  key: 'balance.expire',
  render: (text) => {
    return checkTime(text)
  }
},{
  title: '节点',
  dataIndex: 'userNode.node.name',
  key: 'userNode.node.name',
  render: (text) => {
    return text ? text : '🤡未分配节点'
  }
}, {
  title: '操作',
  dataIndex: 'action',
  key: 'action',
  render: (text, record, index) => {
    return (
      <span>
        <a href="javascript:" onClick={()=> this.middleCheckName(record, index)}>分配节点</a>　
        <a href="javascript:" onClick={()=> this.changeValidTiem(record, index)}>更改有效期</a>
      </span>
    )
  }
}] }

renderNodeSelect = () => {
  const {currentNodeName, nodeNames} = this.state
  return (
    <Select
    showSearch
    style={{ width: 200 }}
    placeholder="Select a node"
    optionFilterProp="children"
    onChange={this.handleOnSwitch}
    filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
    >
    {nodeNames.filter(item => item.name!= currentNodeName).map((item)=>{
      return (<Option value={item.id} key={item.id}>{item.name}</Option>)
    })}
  </Select>
  )
}

handleOnSwitch = (value) => {
  this.setState({currentNodeId: value})
}

handleModalCancel = () => {
  this.setState({
    visible: false,
    modalLoading: false
  })
}

handleModalOk = () => {
  const {currentNodeId,currentUserId,originData,originDataIndex,nodeNames} = this.state
  if(!currentNodeId){
    return message.error('请选择目标节点')
  }

  this.setState({modalLoading: true})
  let param = {
    userId: currentUserId,
    nodeId: currentNodeId
  }
  fetch('/admin/updateUserNode', {data: param}, (data, err)=> {
    if(err){
      return message.error('出错了请稍后再试！')
    }
    
    message.success('更新用户节点信息成功')
    let _originData = [...originData]
    _originData[originDataIndex].userNode = {id:currentNodeId,node:{name: nodeNames.filter(item => item.id === currentNodeId)[0].name}} 
    this.setState({visible: false, originData: _originData,modalLoading: false})
  })
}

changeValidTiem = (record, index) => {
  this.setState({
    currentTimeInfo: {time:record.balance.expire,id: record.balance.balanceId,index: index,phone: record.phone},
    timeModalVisible: true
  })
}

handleMTimeCancel = () => {
  this.setState({
    timeModalVisible: false
  })
}

handleMTimeOk = () => {
  const {currentTimeInfo,originData} = this.state

  if(!currentTimeInfo.newTime){
    return message.error('请选择时间')
  }

  let param = {
    balanceId: currentTimeInfo.id,
    expire: currentTimeInfo.newTime
  }
  fetch('/admin/updateUserBalance', {data: param}, (data,err)=>{
    if(err) { return console.log(err)}
    message.success('更新用户有效时间成功')
    let _originData = [...originData]
    _originData[currentTimeInfo.index].balance = {balanceId: currentTimeInfo.id, expire: currentTimeInfo.newTime}
    this.setState({
      originData: _originData, 
      currentTimeInfo: Object.assign({}, this.state.currentTimeInfo, {newTime: ''})
    })
    this.handleMTimeCancel()
  })
}

ensureNewTime = (date, dateString) => {
  this.setState({
    currentTimeInfo: Object.assign({}, this.state.currentTimeInfo, {newTime: dateString})
  })
}

renderDatePicker = () => {
  return (
    <DatePicker
      format="YYYY-MM-DD HH:mm:ss"
      showTime={{ defaultValue: moment('00:00:00', 'HH:mm:ss') }}
      onChange={this.ensureNewTime}
    />
  )
}

  render(){

    const {
      originData,
      loading,
      count,
      visible,
      currentNodeName,
      modalLoading,
      timeModalVisible,
      currentTimeInfo
    } = this.state

    return (
      <div className="component-orderList">
        <div className="search-panel">
           <Form
              className="ant-advanced-search-form"
              onSubmit={this.handleSearch}
            >
              {this.getFields()}
              <Row>
                <Col span={24} style={{ textAlign: 'right' }}>
                  <Button type="primary" htmlType="submit">Search</Button>
                  <Button style={{ marginLeft: 8 }} onClick={this.handleReset}>
                    Clear
                  </Button>
                </Col>
              </Row>
            </Form>
        </div>
        <div className="total-panel">
          <span>用户总数：<span className="count">{count.totalCount}</span> 人</span>
          {/**<span>　有效付费用户：<span className="count">0</span>人</span>**/}
          <span>　有效筛选：<span className="count">{count.filterCount}</span>人</span>
        </div>
        <div className="data-panel">
          <Table 
            dataSource={originData}
            columns={this.renderColumn()} 
            loading={loading} 
            onChange={this.handleTableChange}
            pagination={{
              total: count.filterCount
            }}/>
        </div>
        <Modal
          visible={visible}
          title="分配节点"
          onOk={this.handleModalOk}
          onCancel={this.handleModalCancel}
          footer={[
            <Button key="back" size="large" onClick={this.handleModalCancel}>Return</Button>,
            <Button key="submit" type="primary" size="large" loading={modalLoading} onClick={this.handleModalOk}>
              Submit
            </Button>,
          ]}
        >
          <div className="modalItem">当前节点：{currentNodeName ? currentNodeName : <span className="errName">暂未分配节点</span>}</div>
          <div className="modalItem">可选节点：{this.renderNodeSelect()}</div>
        </Modal>
        <Modal
          visible={timeModalVisible}
          title="重新分配有效时间"
          onOk={this.handleMTimeOk}
          onCancel={this.handleMTimeCancel}
          footer={[
            <Button key="" size="large" onClick={this.handleMTimeCancel}>Return</Button>,
            <Button key="timeSubmit" type="primary" size="large"  onClick={this.handleMTimeOk}>Submit</Button>
          ]}>
          <div className="modalItem">当前用户　　：{currentTimeInfo.phone}</div>
          <div className="modalItem">当前有效时间：{checkTime(currentTimeInfo.time)}</div>
          <div className="modalItem">新的有效时间：{this.renderDatePicker()}</div>
        </Modal>
      </div>
    )
  }
}
export default UserListNew