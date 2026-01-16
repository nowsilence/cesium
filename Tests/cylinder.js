import { Cesium, getViewer } from "./index.js";
const viewer = await getViewer();
const type = 1;

const position = Cesium.Cartesian3.fromDegrees(19.0, 47);
let transform = Cesium.Transforms.eastNorthUpToFixedFrame(position);
const slices = 128; // 横向分成多少片 默认128
const length = 200000 // 圆柱的高度
const topRadius = 80000; // 圆柱上底面半径
const bottomRadius = 200000; // 圆柱下底面半径
if (type == 0) {
    const cylinder = new Cesium.CylinderGeometry({
        slices,
        length,
        topRadius,
        bottomRadius,
    });

    const geometryInstance = new Cesium.GeometryInstance({
        geometry: cylinder,
        modelMatrix: transform,
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
        position,
        cylinder: {
            slices,
            length,
            topRadius,
            bottomRadius,
            material: Cesium.Color.RED,
            fill: true,
            show: true,
            outline: false,
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 10,
            numberOfVerticalLines: 16,
            // 指定position相对谁的高度，参见box
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, // NONE CLAMP_TO_GROUND CLAMP_TO_TERRAIN CLAMP_TO_3D_TILE RELATIVE_TO_GROUND
            // distanceDisplayCondition: new Cesium.DistanceDisplayCondition(1, 10000000), //0.0
            // shadows: Cesium.ShadowMode.ENABLED
        }
    });
}