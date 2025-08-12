const bluePlane = viewer.entities.add({
    name: "Blue plane",
    position: Cesium.Cartesian3.fromDegrees(-114.0, 40.0, 300000.0),
    plane: {
        plane: new Cesium.Plane(Cesium.Cartesian3.UNIT_X, 0.0),
        dimensions: new Cesium.Cartesian2(400000.0, 300000.0), // 用来缩放面
        material: Cesium.Color.BLUE,
    },
});


// PlaneGeometry默认构建的是一个大小为1x1的面，如果需要改变大小需要通过modelMatrix进行缩放
const instance = new Cesium.GeometryInstance({
    geometry: new Cesium.PlaneGeometry({
        vertexFormat: Cesium.PerInstanceColorAppearance.FLAT_VERTEX_FORMAT,
    }),
    modelMatrix: Cesium.Matrix4.multiplyByTranslation(
        Cesium.Transforms.eastNorthUpToFixedFrame(
            Cartesian3.fromDegrees(-75.59777, 40.03883)
        ),
        new Cesium.Cartesian3(0.0, 0.0, 100000.0),
        new Cesium.Matrix4()
    ),
    id: "plane",
    attributes: {
        color: new Cesium.ColorGeometryInstanceAttribute(1.0, 1.0, 0.0, 1.0),
    },
});

scene.primitives.add(
    new Cesium.Primitive({
        geometryInstances: instance,
        appearance: new Cesium.PerInstanceColorAppearance({
            
        }),
    })
);