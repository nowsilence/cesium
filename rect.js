viewer.entities.add({
    name:
    "Green translucent, rotated, and extruded rectangle at height with outline",
    rectangle: {
        show: true, // 默认true
        coordinates: Cesium.Rectangle.fromDegrees(
            115, 39,
            115.01, 39.01
        ),
        material: Cesium.Color.Color.WHITE, // 默认白色
        extrudedHeight: .1,
        height: 1000.0,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, // 不设置和设置为NONE、CLAMP_TO_GROUND/CLAMP_TO_TERRAIN/
        extrudedHeightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        classificationType: ClassificationType.BOTH, // 默认BOTH，只有在height和ExtrudedHeight未设置的情况下才起作用
        zIndex: 0, // 贴地渲染的primitive排序, 只有在height和ExtrudedHeight未设置的情况下才起作用
        distanceDisplayCondition: undefined,
        shadows: ShadowMode.DISABLED, // 默认disabled
        outline: false, // 默认false，是否绘制边框
        outlineColor: Cesium.Color.Black, // 外边框颜色 默认黑色
        fill: true, // 默认true 是否填充颜色
        granularity: Cesium.Math.RADIANS_PER_DEGREE, // 粒度 用来插点, 默认一度一个点
        stRotation: 0, // 纹理旋转，逆时针
        rotation: Cesium.Math.toRadians(45), // 顺时针旋转 默认0
    },
});

const positionOnEllipsoid = Cesium.Cartesian3.fromDegrees(115, 39);
const offset = Cesium.Cartesian3.multiplyByScalar(
    ellipsoid.geodeticSurfaceNormal(positionOnEllipsoid),
    60000,
    new Cesium.Cartesian3()
);

const instance = new Cesium.GeometryInstance({
    geometry: new Cesium.RectangleGeometry({
      rectangle: Cesium.Rectangle.fromDegrees(115, 39, 115.01, 39.01),
      rotation: Cesium.Math.toRadians(45),
      stRotation: 0,
      extrudedHeight: 300000.0,
      height: 100000.0,
      granularity: CesiumMath.RADIANS_PER_DEGREE,
      vertexFormat: Cesium.PerInstanceColorAppearance.VERTEX_FORMAT,
      offsetAttribute: Cesium.HeightReference.ALL
    }),
    attributes: {
      color: Cesium.ColorGeometryInstanceAttribute.fromColor(
        new Cesium.Color(0.0, 1.0, 0.0, 0.5)
      ),
      offset: offset
    },
  });

  scene.primitives.add(
    new Cesium.Primitive({
      geometryInstances: instance,
      appearance: new Cesium.PerInstanceColorAppearance({
        closed: true,
      }),
    })
  );

  // 贴地
  scene.groundPrimitives.add(
    new Cesium.GroundPrimitive({
      geometryInstances: new Cesium.GeometryInstance({
        geometry: new Cesium.RectangleGeometry({
          rectangle: Cesium.Rectangle.fromDegrees(
            -100.0,
            30.0,
            -90.0,
            40.0
          ),
          rotation: Cesium.Math.toRadians(45),
        }),
        attributes: {
          color: Cesium.ColorGeometryInstanceAttribute.fromColor(
            new Cesium.Color(0.0, 1.0, 0.0, 0.5)
          ),
        },
        id: "rectangle",
      }),
      classificationType: Cesium.ClassificationType.TERRAIN,
    })
  );