<Query
    model="action"
    url="/admin/actionList"
    columns={[{
        title : "id",
        column : "actionId"
    }, {
        title : "url",
        column : "url"
    }, {
        title : "角色",
        column : "role.name"
    }]}
/>