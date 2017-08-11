<Query model="place" url="/admin/placeList" page={false} >
    <QueryItem label="id" column="placeId" />
    <QueryItem label="地区" column="name" />
    <QueryItem type="image" label="图片" column="picture" />
    <QueryItem label="操作" type="action" isDelete={true} isUpdate={true} updatePage="/updatePlace" />
</Query>