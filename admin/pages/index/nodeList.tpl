<Query model="node" url="/admin/nodeList" page={false} >
    <QueryItem label="id" column="nodeId" />
    <QueryItem label="地区" column="place.name" />
    <QueryItem label="ip地址" column="ip" />
    <QueryItem label="权重" column="weight" />
    <QueryItem label="操作" type="action" isDelete={true} isUpdate={true} updatePage="/updateNode" />
</Query>