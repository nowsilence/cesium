import { Cesium, getViewer } from "./index.js";
const viewer = await getViewer();
const type = 0;

const position = Cesium.Cartesian3.fromDegrees(19.0, 47);

const radii = new Cesium.Cartesian3(1000000.0, 500000.0, 500000.0);
const innerRadii = radii; // 默认等于radii
const minimumClock = 0;
const maximumClock = 2 * Math.PI;
const minimumCone = 0;
const stackPartitions = 64; // 不能小于3
const slicePartitions = 64; // 不能小于3

if (type == 0) {
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