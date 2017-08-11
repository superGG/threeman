<Layout style={{height : "100%"}}>
    <Sider>
        <Menu mode="inline" theme="dark">
            <MenuItem path="/" title="主页" key="home" icon="home"/>
            <SubMenu title="权限管理" icon="lock">
                <MenuItem path="/roleList" key="roleList" title="角色列表" />
                <MenuItem path="/addRole" key="addRole" title="添加角色" />
                <MenuItem path="/actionList" key="actionList" title="权限列表" />
                <MenuItem path="/addAction" key="addAction" title="添加权限" />
            </SubMenu>
            <SubMenu title="用户管理" icon="user">
                <MenuItem path="/userListNew" key="userListNew" title="用户列表（新）" />                
                <MenuItem path="/userList" key="userList" title="用户列表" />
            </SubMenu>
            <SubMenu title="订单管理" icon="shopping-cart">
                <MenuItem path="/orderListNew" key="orderListNew" title="订单列表（新）" />
                <MenuItem path="/orderList" key="orderList" title="订单列表" />
            </SubMenu>
            <SubMenu title="套餐管理" icon="shopping-cart">
                <MenuItem path="/packageList" key="packageList" title="套餐列表" />
                <MenuItem path="/addPackage" key="addPackage" title="添加套餐" />
            </SubMenu>
            <SubMenu title="节点管理" icon="link">
                <MenuItem path="/nodeListNew" key="nodeListNew" title="节点列表（新）" />   
                <MenuItem path="/nodeList" key="nodeList" title="节点列表" />
                <MenuItem path="/addNodeOne" key="addNodeOne" title="添加节点（新）" />
                <MenuItem path="/addNode" key="addNode" title="添加节点" />
            </SubMenu>
            <MenuItem path="/logout" title="退出登录" key="logout" icon="logout"/>
        </Menu>
    </Sider>
    <Content>
        <RouteView />
    </Content>
</Layout>