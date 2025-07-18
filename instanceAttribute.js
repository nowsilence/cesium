{
    let rectangle = Cesium.Rectangle.fromDegrees(-100.0, 30.0, -99.0, 31.0);
    let center1 = Cesium.Rectangle.center(rectangle);
    center1 = ellipsoid.cartographicToCartesian(center1);
    let offset = Cesium.Cartesian3.multiplyByScalar(
        ellipsoid.geodeticSurfaceNormal(center1),
        100000,
        new Cesium.Cartesian3(),
    );

    const i1 = new Cesium.GeometryInstance({
        geometry: new Cesium.RectangleGeometry({
            rectangle: rectangle,
            extrudedHeight: 30000.0,
            height: 10000.0,
            vertexFormat: Cesium.PerInstanceColorAppearance.VERTEX_FORMAT,
            offsetAttribute: Cesium.GeometryOffsetAttribute.TOP,
        }),
        attributes: {
        color: Cesium.ColorGeometryInstanceAttribute.fromColor(
            new Cesium.Color(1.0, 0.0, 0.0, 0.5),
        ),
        offset: Cesium.OffsetGeometryInstanceAttribute.fromCartesian3(offset),
        },
    });

    rectangle = Cesium.Rectangle.fromDegrees(-99.0, 30.0, -98.0, 31.0);
    let center2 = Cesium.Rectangle.center(rectangle);
    center2 = ellipsoid.cartographicToCartesian(center2);

    const i2 = new Cesium.GeometryInstance({
        geometry: new Cesium.RectangleGeometry({
            rectangle: rectangle,
            extrudedHeight: 30000.0,
            height: 10000.0,
            vertexFormat: Cesium.PerInstanceColorAppearance.VERTEX_FORMAT,
            offsetAttribute: Cesium.GeometryOffsetAttribute.TOP,
        }),
        attributes: {
        color: Cesium.ColorGeometryInstanceAttribute.fromColor(
            new Cesium.Color(0.0, 1.0, 0.0, 0.5),
        ),
        offset: Cesium.OffsetGeometryInstanceAttribute.fromCartesian3(
            Cesium.Cartesian3.ZERO,
        ),
        },
    });

    const p = scene.primitives.add(
        new Cesium.Primitive({
          geometryInstances: [i1, i2],
          appearance: new Cesium.PerInstanceColorAppearance({
            closed: true,
          }),
          asynchronous: false,
        }),
    );
}