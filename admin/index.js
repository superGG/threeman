import 'babel-polyfill'
import React from 'react'
import { render } from 'react-dom'
import {Router, hashHistory} from 'react-router'

import scanRoutes from './render/scan-routes'

const auth = require('./auth.json')
const context = require.context('./pages', true, /\.(tpl|js)?$/)
const routes = scanRoutes(context, auth)

render(
	<Router routes={routes} history={hashHistory} />,
	document.getElementById('root')
)