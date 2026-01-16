import { Cesium, getViewer } from "./index.js";
const viewer = await getViewer();
const type = 0;

const positions = Cesium.Cartesian3.fromDegreesArray([-72.0, 40.0, -70.0, 35.0]);
const width = 100000;
const height = 100000; // 球面到positions点的距离
const extrudedHeight = 0; // 拉伸面到椭球面的距离
const cornerType = Cesium.CornerType.ROUNDED; // 转角类型 ROUNDED, BEVELED, MITERED
if (type == 0) {
    const corridor = new Cesium.CorridorGeometry({
        // vertexFormat : Cesium.VertexFormat.POSITION_ONLY,
        positions,
        width,
        granularity: Cesium.Math.RADIANS_PER_DEGREE,
        height,
        extrudedHeight,
        cornerType,
    });
 
    const geometryInstance = new Cesium.GeometryInstance({
        geometry: corridor,
        attributes: {
            color: Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.RED)
        }
    });

    viewer.scene.primitives.add(new Cesium.Primitive({
        geometryInstances: geometryInstance,
        appearance: new Cesium.PerInstanceColorAppearance({
            material: Cesium.Material.fromType('Color')
        })
    }));
}

if (type == 1) {
    viewer.entities.add({
        corridor: {
            positions,
            width,
            height,
            extrudedHeight,
            cornerType,
            material: Cesium.Color.RED,
            fill: true,
            show: true,
            outline: false,
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 10,
            granularity: Cesium.Math.RADIANS_PER_DEGREE,
            // 指定position相对谁的高度，参见box
            // heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, // NONE CLAMP_TO_GROUND CLAMP_TO_TERRAIN CLAMP_TO_3D_TILE RELATIVE_TO_GROUND
            // extrudedHeightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            // distanceDisplayCondition: new Cesium.DistanceDisplayCondition(1, 10000000), //0.0
            // shadows: Cesium.ShadowMode.ENABLED,
            // classificationType: Cesium.ClassificationType.BOTH,
            // zIndex: 0,
        }
    });

    /**
     * heightReference为CLAMP_**, 则高度重置为0，否则height值不变，
     * extrudedHeightReference为CLAMP_**, 则高度重置当前位置地形的预估最小高程（ApproximateTerrainHeights），否则extrudedHeight值不变，
     * 
     * 如果设置了heightReference或者extrudedHeightReference，
     * 内部在创建GeometryInstance的时候都会设置offset属性，且在创建Geometry的时候设置offsetAttribute参数
     * 
     * offset值设置：若heightReference未设置，且extrudedHeightReference设置的是贴地，则偏移设置为0
     *              否则设置为沿当前椭球面的法线，长度为当前地形搞高度
     * offsetAttribute值设置：
     *      1、同时设置height、heightReference
     *      2、设置了extrudedHeight，且extrudedHeightReference为HeightReference.RELATIVE_TO_GROUND
     * 
     *      若条件1、2只满足了一项则为TOP，都满足为ALL，否则undefined
     */
}