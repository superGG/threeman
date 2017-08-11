<Mutation
    model="action"
    addUrl="/admin/addAction"
    type="add"
    items={[{
        label : "角色",
        type : "object",
        column : "role",
        props : {
            items : [{
                type : "select",
                column : "roleId",
                props : {
                    url : "/admin/roleList",
                    options : {value : "roleId", text : "name"}
                }
            }]
        }
    }, {
        label : "action",
        column : "url"
    }]}
/>