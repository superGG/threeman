<Query model="package" url="/admin/packageList" page={false} >
    <QueryItem label="id" column="packageId" />
    <QueryItem label="套餐名" column="name" />
    <QueryItem label="价格" column="price" />
    <QueryItem label="天数" column="day" />
    <QueryItem type="action" label="操作" isDelete={true} isUpdate={true} updatePage="/updatePackage" />
</Query>