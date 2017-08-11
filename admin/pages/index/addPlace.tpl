<Row>
    <Col span={12} offset={6}>
        <Mutation style={{'margin-top' : '20px'}} model="place" url="/admin/addPlace" dividerHeight="20px">
            <Row>
                <Col span={24}><MutationItem label="名称" column="name" /></Col>
                <Col span={24}><MutationItem type="image" label="图片" column="picture" /></Col>
            </Row>
        </Mutation>
    </Col>
</Row>