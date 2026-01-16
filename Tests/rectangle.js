import { Cesium, getViewer } from "./index.js";
const viewer = await getViewer();
const type = 1;

// west south east north
const rectangle = Cesium.Rectangle.fromDegrees(19.0, 47.0, 20, 48.0);

if (type == 0) {
    const rectangleGeometry = new Cesium.RectangleGeometry({
        rectangle,
        granularity: Cesium.Math.RADIANS_PER_DEGREE,
        height: 10000, // 矩形到椭球面的高度
        extrudedHeight: 0, // 矩形拉伸后的面与椭球面的高度
        rotation: 0,
        stRotation: 0,
    });

    const geometryInstance = new Cesium.GeometryInstance({
        geometry: rectangleGeometry,
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
    viewer.entities.add({
        rectangle: {
            coordinates: rectangle,
            material: Cesium.Color.WHITE,
            fill: true,
            show: true,
            outline: false,
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 10,
            rotation: 0,
            stRotation: 0,
            // height: 40000, // 若heightReference为NONE，则相对于椭球面的高度，若为CLAMP_**，则值无效，若为RELATIVE_*，则低相对于对应地形高度
            // heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND, // NONE CLAMP_TO_GROUND CLAMP_TO_TERRAIN CLAMP_TO_3D_TILE RELATIVE_TO_GROUND
            // extrudedHeight: 50000, // 若heightReference为NONE，则为拉伸面与椭球面的之间的距离，若为CLAMP_**，则值无效，拉伸面会贴着对应的地形，若为RELATIVE_*，则低相对于对应地形之间的距离
            // extrudedHeightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
            // zIndex: 0,
            // granularity: Cesium.Math.RADIANS_PER_DEGREE, // 粒度
            // classificationType: ClassificationType.BOTH,
            // distanceDisplayCondition: new Cesium.DistanceDisplayCondition(1, 10000000), //0.0
            // shadows: Cesium.ShadowMode.ENABLED
        }
    })
}