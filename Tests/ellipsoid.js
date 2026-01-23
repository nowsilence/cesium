import { Cesium, getViewer } from "./index.js";
const viewer = await getViewer();
const type = 0;

const position = Cesium.Cartesian3.fromDegrees(19.0, 47);

const radii = new Cesium.Cartesian3(1000000.0, 500000.0, 500000.0);
const innerRadii = radii; // 默认等于radii
const minimumClock = 0;
const maximumClock = 2 * Math.PI;
const minimumCone = Math.PI / 6;
const stackPartitions = 64; // 不能小于3
const slicePartitions = 64; // 不能小于3

if (type == 0) {
    // 相比EllipsoidPrimitive，可以批量渲染，但顶点数据量大，且三角面少的话会不平滑
    const ellipsoid = new Cesium.EllipsoidGeometry({
    //   vertexFormat : Cesium.VertexFormat.POSITION_ONLY,
      radii,
      innerRadii,
      minimumClock,
      maximumClock,
      minimumCone,
      stackPartitions,
      slicePartitions
    });
    const geometryInstance = new Cesium.GeometryInstance({
        geometry: ellipsoid,
        modelMatrix: Cesium.Transfoms.eastNorthUpToFixedFrame(position),
        attributes: {
            color: Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.RED)
        }
    });

    viewer.scene.primitives.add(new Cesium.Primitive({
        geometryInstances: geometryInstance,
        appearance: new Cesium.PerInstanceColorAppearance({
            material: Cesium.Material.fromType('Color')
        })
    }))
}

if (type == 1) {
    // 一般单个球体的渲染使用此方法。且球面法线更精确，因为是在shader实时计算的，不需要把球体进行三角化
    // 缺点是不能批量渲染
    viewer.scene.primitives.add(new Cesium.EllipsoidPrimitive({
        center: position,
        radii,
        material: Cesium.Material.fromType(Cesium.Material.ColorType)
    }))
}

if (type == 2) {
    viewer.entities.add({
        position,
        // orientation: ,// 默认东北天姿态,类型为Quaternion而不是Matrix4
        ellipsoid: {
            dimensions: new Cesium.Cartesian3(500000, 500000, 500000),
            material: Cesium.Color.WHITE,
            fill: true,
            show: true,
            radii,
            innerRadii,
            minimumClock,
            maximumClock,
            minimumCone,
            stackPartitions,
            slicePartitions,
            subdivisions: 128, 
            outline: false,
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 10,
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, // NONE CLAMP_TO_GROUND CLAMP_TO_TERRAIN CLAMP_TO_3D_TILE RELATIVE_TO_GROUND
            // distanceDisplayCondition: new Cesium.DistanceDisplayCondition(1, 10000000), //0.0
            // shadows: Cesium.ShadowMode.ENABLED
        }
    })
}