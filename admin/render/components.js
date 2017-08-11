import Row from 'antd/lib/row'
import 'antd/lib/row/style'
import Col from 'antd/lib/col'
import 'antd/lib/col/style'

import RouteView from '../components/common/RouteView'
import Layout from '../components/common/Layout'
import Menu from '../components/common/Menu'
import SubMenu from '../components/common/SubMenu'
import MenuItem from '../components/common/MenuItem'

import Query from '../components/Query'
import QueryItem from '../components/Query/Item'
import Mutation from '../components/Mutation'
import MutationItem from '../components/Mutation/Item'
import Details from '../components/Details'

const components = {
	Row,
	Col,
	RouteView,
	Layout,
	Sider : Layout.Sider,
	Content : Layout.Content,
	Footer : Layout.Footer,
	Header : Layout.Header,
	Menu,
	SubMenu,
	MenuItem,
	Query,
	QueryItem,
	Mutation,
	MutationItem,
	Details
}

export default components