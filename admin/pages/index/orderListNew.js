import React, { Component, PropTypes } from 'react'
import fetch from '../../util/reql-api.js'
import {message, Table, Form, Input, Select, Button, Row, Col, Icon, DatePicker,Modal} from 'antd'
const FormItem = Form.Item
const Option = Select.Option
const {RangePicker} = DatePicker
import './orderList.css'

import man_avatar from '../../img/man_avatar.png'
import man_avatar_two from '../../img/man_avatar_two.png'
import man_avatar_three from '../../img/man_avatar_three.png'
import man_avatar_four from '../../img/man_avatar_four.png'

import woman_avatar from '../../img/woman_avatar.png'
import woman_avatar_two from '../../img/woman_avatar_two.png'
import woman_avatar_three from '../../img/woman_avatar_three.png'
import woman_avatar_four from '../../img/woman_avatar_four.png'
const avatar_ary = [man_avatar,
man_avatar_two,
man_avatar_three,
man_avatar_four,
woman_avatar,
woman_avatar_two,
woman_avatar_three,
woman_avatar_four
]

import moment from 'moment'
import forMatTargetTime from '../../util/time.js'
const FORMAT = 'YYYY-MM-DD HH:mm:ss'
const checkValue = (value) => value ? moment(value).format(FORMAT) : '❌未记录'
const momentFormat = (time) => moment(time).format(FORMAT)
const status = ['未支付','已经支付','已经取消']
class OrderListNew extends Component{

  state = {
    isMount: true,
    originDate : [],
    loading: true,
    count: {
      filterCount: 0,
      totalCount: 0
    },
    pageSize: 10,
    page: 1,
    status: '',
    userName: '',
    packages: [], // 获取套餐类型
    packageItem: '', // 筛选选取的套餐value
    payTime: {
      startTime: '',
      endTime: ''
    }, // 筛选用户支付套餐时间
  }

  renderColumns = () =>{
    return [{
      title: 'id',
      dataIndex: 'orderId',
      key: 'orderId',
    }, {
      title: '套餐',
      dataIndex: 'package.name',
      key: 'package.name',
    }, {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
    }, {
      title: '天数',
      dataIndex: 'day',
      key: 'day',
    }, {
      title: '下单时间',
      dataIndex: 'createTime',
      key: 'createTime',
      render: (text) => {
        return momentFormat(text)
      }
    }, {
      title: '支付时间',
      dataIndex: 'payTime',
      key: 'payTime',
      render: (text) => {
        return text ? momentFormat(text) : '❌'
      }
    }, {
      title: '用户',
      dataIndex: 'user.phone',
      key: 'user.phone',
      render: (text) => {
        return <a href="javascript:" onClick={()=>this.fetchUserInfo(text)}>{text}</a>
      }
    }, {
      title: '状态',
      dataIndex: 'status',
      key: 'status'
    }];
  }

  fetchUserInfo = (phone) => {
    this.setState(this.setLoading({},{loading: true}))
      fetch(`/admin/getUser?phone=${phone}`,{},(data,err)=>{
      
        Modal.info({
          title: '用户信息',
          content: (
            <div>
              <div className="userAvatar">
                {/**预留用户头像**/}
                <img src={avatar_ary[Math.floor(Math.random()*8)]} alt=""/>
              </div>
              <div className="userInfo">
                <p className="userItem">手机号　　　：　{data.phone}</p>
                <p className="userItem">注册时间　　：　{checkValue(data.registerTime)}</p>
                <p className="userItem">上一次登录　：　{checkValue(data.lastLoginTime)} {forMatTargetTime(data.lastLoginTime)}</p>
                <p className="userItem">会员到期时间：　{data.balance.expire < new Date() ? '已过期': checkValue(data.balance.expire)}</p>
              </div>
            </div>
          ),
          onOk() {},
        });
      this.setState(this.setLoading({},{loading: false}))
    })
  }

  componentDidMount () {
    this.getTableData(true)

    fetch('/admin/packageList',{}, (data, err)=>{
      if(err){message.error('出错了请稍后再试！')}

      this.setState({
        packages: data
      })
    })
  }

  setLoading = (state, props) => {
    return {
      loading: props.loading
    }
  }

  getTableData = (isFilter = false, page = 1) => {
    const {userName,status,loading,originDate,dataCount,payTime,pageSize,packageItem,isMount} = this.state

    let dynamic = `${status === '' ? 'status>0' : `status ='${status}'`}
                   ${payTime.startTime ? `&& payTime > '${payTime.startTime}'` : ''}
                   ${payTime.endTime? `&& payTime < '${payTime.endTime}'`: '' }`
    dynamic = dynamic.replace(/\s/g, '').replace(/(payTime)(>|<)(.{11})/g, '$1$2$3 ')
    
    let userDynamic = `${userName === '' ? 'userId>0' : `phone ='${userName}'`}`
    
    let packageDynamic = `${packageItem === '' ? 'packageId>0' : `name ='${packageItem}'`}`

    const param = {
      page,
      pageSize,
      dynamic,
      userDynamic,
      packageDynamic
    }

    this.setState(this.setLoading({},{loading: true}))
    fetch('/admin/orderList', {param}, (data, err)=>{
      if(err) {
        message.error('出错了请稍后再试！')
      }
      this.setState({
        originDate: data,
        loading: false
      })
    })

    isFilter ? fetch('/admin/orderList/count', {param}, (data,err)=>{
      this.setState(()=>{
        return isMount ? {count: Object.assign({},this.state.count, {totalCount: data, filterCount: data}), isMount: false}
              : {count: Object.assign({},this.state.count, {filterCount: data})}
      })
    }) : ''
  }

  getFields = () => {
    const formItemLayout = {
      labelCol: { span: 5 },
      wrapperCol: { span: 19 },
    }

    return (
      <div>
      <Row gutter={40}>
        <Col span={8} key='userName'>
          <FormItem {...formItemLayout} label="用户名">
            <Input placeholder="请输入用户名（手机号）" onChange={(e)=>this.handleOnStatus(e.target.value, 'userName')} value={this.state.userName}/>
          </FormItem>
        </Col>
        <Col span={8} key="status">
          <FormItem {...formItemLayout} label="状态">
            <Select onChange={(val)=>this.handleOnStatus(val, 'status')} value={this.state.status}>
              {status.map((item, index)=>{
                return <Option value={item} key={index}>{item}</Option>  
              })}
            </Select>
          </FormItem>
        </Col>
        <Col span={8} key="packages">
          <FormItem {...formItemLayout} label="套餐类型">
            <Select onChange={(val)=>this.handleOnStatus(val, 'packageItem')} value={this.state.packageItem} >
              {this.state.packages.map((packageItem, index)=>{
                return <Option value={packageItem.name} key={packageItem.packageId}>{packageItem.name}</Option>
              })}
            </Select>
          </FormItem>
        </Col>
      </Row>
      <Row gutter={40}>
        <Col span={8} key="payTime">
          <FormItem {...formItemLayout} label="支付时间">
            <RangePicker 
              onChange={this.onChangePayTime}/>
          </FormItem>
        </Col>
      </Row>
      </div>
    )
  }

  onChangePayTime = (date, dateString) => {
    this.setState({
      payTime: Object.assign({}, this.state.payTime, {startTime: `${dateString[0] ? `${dateString[0]} 00:00:00` : ''}`, 
                                                      endTime:   `${dateString[1] ? `${dateString[1]} 24:00:00` : ''}`})
    })
  }

  handleOnStatus = (value, key) => {
    const {status, packageItem} = this.state
    this.setState({
      [key]: value,
    })
  }

  handleSearch = (e) => {
    e.preventDefault();
    this.getTableData(true)
  }
  
  handleReset = () => {
    this.setState({
      userName: '',
      status: '',
      packageItem: '',
      payTime: {
        startTime:'',
        endTime:''
      }
    })
  }

  handleTableChange = (pagination) => {
    const {current} = pagination
    this.getTableData(false,current)
  }

  render(){

    const {
      originDate,
      loading,
      count
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
          <span>订单总数：<span className="count">{count.totalCount}</span> 条</span>
          <span>　有效筛选订单：<span className="count">{count.filterCount}</span>条</span>
        </div>
        <div className="data-panel">
          <Table 
            dataSource={originDate} 
            columns={this.renderColumns()} 
            loading={loading} 
            onChange={this.handleTableChange}
            pagination={{
              total: count.filterCount
            }}/>
        </div>
      </div>
    )
  }
}

export default OrderListNew