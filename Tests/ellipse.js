import { Cesium, getViewer } from "./index.js";
const viewer = await getViewer();
const type = 0;

const center = Cesium.Cartesian3.fromDegrees(-75.59777, 40.03883); // 椭圆中心点
const semiMajorAxis = 500000.0; // 椭圆长轴长
const semiMinorAxis = 300000.0; // 椭圆短轴长
const rotation = Cesium.Math.toRadians(60.0); // 椭圆旋转角度
const stRotation = 0;
const height = 0;
const heightReference = Cesium.HeightReference.NONE;
const extrudedHeight = 0;
const extrudedHeightReference = Cesium.HeightReference.NONE;

if (type == 0) {

    const ellipse = new Cesium.EllipseGeometry({
        center,
        semiMajorAxis, 
        semiMinorAxis,
        rotation,
        stRotation,
        height,
        heightReference,
        extrudedHeight,
        extrudedHeightReference,
    });
    
    const geometryInstance = new Cesium.GeometryInstance({
        geometry: ellipse,
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
        position: center,
        ellipse: {
            semiMajorAxis,
            semiMinorAxis,
            height,
            heightReference,
            extrudedHeight,
            extrudedHeightReference,
            material: Cesium.Color.RED,
            fill: true,
            outline: false,
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 10,
            rotation,
            stRotation,
            granularity: Cesium.Math.RADIANS_PER_DEGREE,
            numberOfVerticalLines: 16,
            // distanceDisplayCondition: new Cesium.DistanceDisplayCondition(1, 10000000), //0.0
            // shadows: Cesium.ShadowMode.ENABLED,
            // classificationType: Cesium.ClassificationType.BOTH,
            // zIndex: 0,
        }
    })
}