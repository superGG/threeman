<Mutation
    model="role"
    addUrl="/admin/addRole"
    type="add"
    items={[{
        label : "角色名称",
        column : "name"
    }, {
        label : "属性",
        column : "attr",
        type : "select",
        props : {
            value : "普通",
            values : [{value : "普通", text : "普通"}, {value : "公有", text : "公有"}, {value : "超级管理员", text : "超级管理员"}]
        }
    }]}
/>