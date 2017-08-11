<Mutation model="node" url="/admin/node/update" from="/admin/node" type="update" >
    <MutationItem label="节点ip" column="ip" />
    <MutationItem label="节点" column="place" type="object">
        <MutationItem label="节点位置" column="placeId" type="select" from="/admin/placeList" option={{value : "placeId", text : "name"}}/>
    </MutationItem>
    <MutationItem label="权重" column="weight" />
</Mutation>