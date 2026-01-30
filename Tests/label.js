import { Cesium, getViewer } from "./index.js";
const viewer = await getViewer();

/**
 * 在使用Entity的时候，并没有直接创建LabelCollection、PointCollection、BillboardCollection，
 * 而是在EntityCluster中创建，分别创建了聚合的Collection和非聚合的Collection，进行分别渲染。
 * 通过LabelVisualizer把EntityCollection和EntityCluster进行关联起来
 * 
 * EntityCluster和EntityCollection在CustomDatasource中创建，
 * Visualizer在DataSourceDisplay中创建，创建的时候就把CustomDatasource.entityCluster传给Visualizer，
 * 这样在Visualizer中创建Label、Billboard的时候就可以调用cluster内的方法进行创建。
 * DisplayDatasource里面有个primitives被添加到了scene.primitives，datasource.cluster被添加的primtives里面
 * 更新流程是这样的scene.primtives.update()->displayDatasource.primtives.update()->datasource.cluster.update()->billboardCollection.update()
 * dataSource.update()调用先于scene.render().
 * dataSource.update又调用了visualizer.update();
 * 在DisplayDatasource中，在添加数据源的响应事件中会给被添加的数据源附加：
 * 
 * dataSource._primitives = primitives;
 * dataSource._groundPrimitives = groundPrimitives;
 * 
 * 其他的渲染类型被加入到dataSource._primitives中或者dataSource._groundPrimitives中
 * Path渲染较为特殊，在pathVisualizer中会创建Polylineupdater，Polylineupdater内又创建了PolylineCollection
 */
const position = Cesium.Cartesian3.fromDegrees(19.0, 47);

viewer.entities.add({
    position,
    label: {
        text: '冲向太空',
        font: '30px sans-serif',
        style: Cesium.LabelStyle.FILL, // FILL OUTLINE FILL_AND_OUTLINE
        scale: 1.0,
        showBackground: false,
        backgroundColor: new Cesium.Color(0.165, 0.165, 0.165, 0.8),
        backgroundPadding: new Cesium.Cartesian2(7, 5),
        pixelOffset: new Cesium.Cartesian2(0, 0),
        eyeOffset: new Cesium.Cartesian3(0, 0, 0),
        horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
        verticalOrigin: Cesium.VerticalOrigin.CENTER,
        heightReference: Cesium.HeightReference.NONE,
        fillColor: Cesium.Color.WHITE,
        outlineColor: Cesium.Color.BLACK,
        outlineWidth: 1,
        // translucencyByDistance: new Cesium.NearFarScalar(0.1, 10, 10000, 0.2),
        // scaleByDistance: new Cesium.NearFarScalar(0.1, 10, 10000, 0.2),
        // pixelOffsetScaleByDistance: new Cesium.NearFarScalar(0.1, 10, 10000, 0.2),
        // distanceDisplayCondition: new Cesium.DistanceDisplayCondition(1, 10000000), //0.0
        // disableDepthTestDistance: undefined
    }
});