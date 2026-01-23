import { Cesium, getViewer } from "./index.js";
const viewer = await getViewer();

/**
 * outline只能使用simpleLine方式进行渲染，顶点只有position数据，
 * 且使用的是PrimitiveType.LINES类型
 */

const position = Cesium.Cartesian3.fromDegrees(19.0, 47);
let transform = Cesium.Transforms.eastNorthUpToFixedFrame(position);

const box = new Cesium.BoxOutlineGeometry({
  maximum : new Cesium.Cartesian3(250000.0, 250000.0, 250000.0),
  minimum : new Cesium.Cartesian3(-250000.0, -250000.0, -250000.0)
});
const geometry = Cesium.BoxOutlineGeometry.createGeometry(box);

viewer.scene.primitives.add(new Cesium.Primitive({
    modelMatrix: transform,
    geometryInstances: new Cesium.GeometryInstance({
        geometry,
        attributes: {
            color: Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.RED)
        }
    }),
    asynchronous: false,
    appearance: new Cesium.PerInstanceColorAppearance({
        transparent: false,
        flat: true,
    })
}));