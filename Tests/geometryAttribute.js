import { Cesium, getViewer } from "./index.js";
const viewer = await getViewer();
const type = 0;
/**
 * 总共三类：
 * GeometryInstanceAttribute：
 * 可以自定义示例属性，一般需要配合自定义shader使用，用法可以参考customShader
 * ColorGeometryInstanceAttribute：
 * 渲染颜色，适合所有渲染对象
 * ShowGeometryInstanceAttribute：
 * 是否渲染，适合所有渲染对象
 * OffsetGeometryInstanceAttribute
 * 是否渲染，仅Polygon/PolygonOutline、Rectangle/RectangleOutline、
 *           Ellipsoid/EllipsoidOutline、Ellipse/EllipseOutline、
 *           Cylinder/CylinderOutline、Corridor/CorridorOutline、Box/BoxOutline
 * DistanceDisplayConditionGeometryInstanceAttribute
 * 是否渲染，适合所有渲染对象
 */
const position = Cesium.Cartesian3.fromDegrees(19.0, 47);
let transform = Cesium.Transforms.eastNorthUpToFixedFrame(position);
    
// 大小为1
const planeGeometry = new Cesium.PlaneGeometry();

transform = Cesium.Matrix4.multiplyByUniformScale(transform, 1111500, transform);

const showAttr = new Cesium.ShowGeometryInstanceAttribute(true);
const geometryInstance = new Cesium.GeometryInstance({
    geometry: planeGeometry,
    modelMatrix: transform,
    attributes: {
        show: showAttr,
        color: Cesium.ColorGeometryInstanceAttribute.fromColor(new Cesium.Color(1.0, 0.0, 0.0, 1.0))
    }
});
// 最好是不要去修改attribute.value，一旦primitive在渲染后或者说primitive.update被调用后，再修改就不再起作用
// showAttr.value = new Uint8Array([0]);

viewer.scene.primitives.add(new Cesium.Primitive({
    geometryInstances: geometryInstance,
    appearance: new Cesium.PerInstanceColorAppearance({

    })
}));
