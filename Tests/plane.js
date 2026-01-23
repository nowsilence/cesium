import { Cesium, getViewer } from "./index.js";
const viewer = await getViewer();
const type = 0;


const position = Cesium.Cartesian3.fromDegrees(19.0, 47);
let transform = Cesium.Transforms.eastNorthUpToFixedFrame(position);

if (type == 0) {

    // 大小为1
    const planeGeometry = new Cesium.PlaneGeometry();

    transform = Cesium.Matrix4.multiplyByUniformScale(transform, 1111500, transform);

    const geometryInstance = new Cesium.GeometryInstance({
        geometry: planeGeometry,
        modelMatrix: transform,
        attributes: {
            color: Cesium.ColorGeometryInstanceAttribute.fromColor(new Cesium.Color(1.0, 0.0, 0.0, 1.0))
        }
    });

    viewer.scene.primitives.add(new Cesium.Primitive({
        geometryInstances: geometryInstance,
        appearance: new Cesium.PerInstanceColorAppearance({

        })
    }));
}

if (type == 1) {
    const position = Cesium.Cartesian3.fromDegrees(-123.0744619, 44.0503706, 0.0);
    const hpr = new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(135), 0.0, 0.0);
    const orientation = Cesium.Transforms.headingPitchRollQuaternion(position, hpr);


    const plane = new Cesium.Plane(Cesium.Cartesian3.UNIT_Z, 0.0);
    viewer.entities.add({
        position,
        orientation,// 类型为Quaternion而不是Matrix4
        plane: {
            plane,
            dimensions: new Cesium.Cartesian2(11111500, 11111500),
            material: Cesium.Color.WHITE,
            fill: true,
            show: true,
            outline: false,
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 10,
            // distanceDisplayCondition: new Cesium.DistanceDisplayCondition(1, 10000000), //0.0
            // shadows: Cesium.ShadowMode.ENABLED
        }
    })
}