<Query model="vpnOrder" url="/admin/orderList">
    <QueryItem label="id" column="orderId" />
    <QueryItem label="套餐" column="package.name" />
    <QueryItem label="价格" column="price" />
    <QueryItem label="天数" column="day" />
    <QueryItem label="用户" column="user.phone" />
    <QueryItem label="状态" column="status" />
</Query>