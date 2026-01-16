import { Cesium, getViewer } from "./index.js";
const viewer = await getViewer();
const type = 1;

const position = Cesium.Cartesian3.fromDegrees(19.0, 47);
let transform = Cesium.Transforms.eastNorthUpToFixedFrame(position);

if (type == 0) {
    const box = new Cesium.BoxGeometry({
        vertexFormat : Cesium.VertexFormat.POSITION_AND_NORMAL,
        maximum : new Cesium.Cartesian3(250000.0, 250000.0, 250000.0), // xyz最大值
        minimum : new Cesium.Cartesian3(-250000.0, -250000.0, -250000.0), // xyz 最小值
        offsetAttribute: Cesium.GeometryOffsetAttribute.ALL, // 默认NONE, 配合OffsetGeometryInstanceAttribute使用
    });

    // const box = Cesium.BoxGeometry.fromDimensions({
    //     offsetAttribute: Cesium.GeometryOffsetAttribute.ALL,
    //     vertexFormat : Cesium.VertexFormat.POSITION_AND_NORMAL,
    //     dimensions : new Cesium.Cartesian3(500000.0, 500000.0, 500000.0)
    // });

    const geometryInstance = new Cesium.GeometryInstance({
        geometry: box,
        attributes: {
            color: Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.RED),
            // offset: new Cesium.OffsetGeometryInstanceAttribute(10, 10, 10), // 必须配合 geometry.offsetAttribute使用
        }
    });

    viewer.scene.primitives.add(new Cesium.Primitive({
        modelMatrix: transform,
        geometryInstances: geometryInstance,
        // appearance: new Cesium.PerInstanceColorAppearance({

        // }),
        appearance: new Cesium.MaterialAppearance({
            material: Cesium.Material.fromType('Color', {
                color: Cesium.Color.RED
            }),
            materialSupport: Cesium.MaterialAppearance.MaterialSupport.BASIC
        })
    }));

    /**
     * 参数materialSupport只需要实现以下三个参数即可：
     *      vertexFormat: VertexFormat.POSITION_AND_NORMAL,
     *      vertexShaderSource: BasicMaterialAppearanceVS,
     *      fragmentShaderSource: BasicMaterialAppearanceFS,
     * Cesium内置了三种类型：
     * Basic：
     *      vertexFormat: VertexFormat.POSITION_AND_NORMAL,
     *      vertexShaderSource: BasicMaterialAppearanceVS,
     *      fragmentShaderSource: BasicMaterialAppearanceFS, 
     * TEXTURED: // 默认值
     *    vertexFormat: VertexFormat.POSITION_NORMAL_AND_ST,
     *    vertexShaderSource: TexturedMaterialAppearanceVS,
     *    fragmentShaderSource: TexturedMaterialAppearanceFS,
     * ALL: 
     *    vertexFormat: VertexFormat.ALL,
     *    vertexShaderSource: AllMaterialAppearanceVS,
     *    fragmentShaderSource: AllMaterialAppearanceFS,
     * geometry创建的时候要注意vertexFormat格式要一样
     */
}

if (type == 1) {
    /**
     * 默认orientation使用的position位置的东北天姿态
     * 1. 若设置了position且heightReference为NONE，那么box的中心点即为position
     * 2. 若设置了heightReference为CLAMP_***, 则立方体的中心点到椭球面的距离为0.5*z，也就是底面刚好贴到椭球面上
     *    若设置了heightReference为RELATIVE_***, 则立方体的中心点到椭球面的距离为0.5*z + position到椭球面的高度，也就是底面刚好在position所在的平面
     *    后面还会根据地形偏移
     * ※ heightReferenc指定position中的高程值是相对椭球面还是相对地形，当然，如果是CLAMP则position中的高程值无效
     */
    viewer.entities.add({
        position,
        // orientation: ,// 默认东北天姿态,类型为Quaternion而不是Matrix4
        box: {
            dimensions: new Cesium.Cartesian3(500000, 500000, 500000),
            material: Cesium.Color.WHITE,
            fill: true,
            show: true,
            outline: false,
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 10,
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, // NONE CLAMP_TO_GROUND CLAMP_TO_TERRAIN CLAMP_TO_3D_TILE RELATIVE_TO_GROUND
            // distanceDisplayCondition: new Cesium.DistanceDisplayCondition(1, 10000000), //0.0
            // shadows: Cesium.ShadowMode.ENABLED
        }
    })

    /**
     * 
     * 如果position不在球面上，而且与椭球面为height。
     * 若heightReference为NONE，那对象会贴到椭球面上
     * 若heightReference为CLAMP_**, 会抹掉position的高程信息，内部会对象进行偏移，偏移距离为当前点的地形高程，会实时获取更新
     * 若heightReference为RELATIVE_**，会保留position的高程信息，但是高程不再是到椭球面的距离，而是到当前点地形的距离，会实时获取
     * 
     * 只要heightReference不在NONE，内部在创建GeometryInstance的时候添加offset，
     * 在创建Geometry的时候会添加offsetAttribute，偏移距离为当前地形点的高程，方向为球面的法方向
     * 
     * 以上是与直接使用BoxGeometry的不同，采用entity的方式，能自动地、更好的控制贴地或者到地形的距离
     */
}