/**
 * 针对体的偏移：
 * 
 * a) 通过entity的方式：
 * 体不支持设置height，那设置heightReference的作用是什么？会影响生成geometry的modelMatrix，
 * 如果设置heightReference的值为Clamp_**, modelMatrix的最终高程为dimensions.z/2，也就是底面贴在椭球体上
 * 如果设置heightReference的值为Relative_**,modelMatrix的最终高程为entity.position的高程+dimensions.z/2。
 * 如果设置heightReference的值为NONE,modelMatrix的最终高程为entity.position的高程
 * 
 *
 * 如果设置了heightRefernece，还会影响到GeometryInstance.attributes.offset;
 * 偏移方向为所在位置椭球面的发线方向乘以地形或者3dtile或者二者的最高高程
 * 体只支持整体偏移，不支持仅顶偏移
 * 
 * b) 通过geometry的方式：
 * 需要通过示例属性实现，构建***Geometry的时候设置：offsetAttribute；
 * 构建GeometryInstance的时候设置attributes.offset
 * 
 * BoxGeometry/CylinderGeometry 不支持GeometryOffsetAttribute.TOP，也就是说只支持整体偏移
 * EllipsoidGeometry 设置的值只要不是NONE，就整体偏移
 */
{
    // entity
    viewer.entities.add({
        name: "Blue box",
        position: Cesium.Cartesian3.fromDegrees(115.005, 39.005, 0),
        box: {
            dimensions: new Cesium.Cartesian3(40.0, 30.0, 1.0),
            material: Cesium.Color.BLUE,
            // height: 1000, // 虽然有参考高程，但是没有height这个字段，高程控制需要通过position来控制
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, // 若为NONE，使用position的位置，若为RELATIVE,则用postion+地形高度，若为CLAMP则重置为地形的高度
        },
    });

    // 如果设置heightReference为RELATIVE_TO_GROUND，按道理来说高程无效，box中心点会在中心点位置地形的高程处
    // 如果设置scene.scene3DOnly= true，box渲染的位置会偏移，不知道为什么,采用下面的方式也是一样的


    // BoxGeometry
    const dimensions = new Cesium.Cartesian3(400000.0, 300000.0, 500000.0);
    const positionOnEllipsoid = Cesium.Cartesian3.fromDegrees(-105.0, 45.0);
    const boxModelMatrix = Cesium.Matrix4.multiplyByTranslation(
        Cesium.Transforms.eastNorthUpToFixedFrame(positionOnEllipsoid),
        new Cesium.Cartesian3(0.0, 0.0, dimensions.z * 0.5),
        new Cesium.Matrix4()
    );
        
    const boxGeometry = Cesium.BoxGeometry.fromDimensions({
        vertexFormat: Cesium.PerInstanceColorAppearance.VERTEX_FORMAT,
        dimensions: dimensions,
        offsetAttribute: Cesium.HeightReference.ALL
    });
    
    const offset = Cesium.Cartesian3.multiplyByScalar(
        ellipsoid.geodeticSurfaceNormal(positionOnEllipsoid),
        60000,
        new Cesium.Cartesian3()
    );

    const boxGeometryInstance = new Cesium.GeometryInstance({
        geometry: boxGeometry,
        modelMatrix: boxModelMatrix, // 设置位置姿态信息
        attributes: {
            color: Cesium.ColorGeometryInstanceAttribute.fromColor(
                new Cesium.Color(1.0, 0.0, 0.0, 0.5)
            ),
            offset
        },
    });
      
    scene.primitives.add(
        new Cesium.Primitive({
            geometryInstances: boxGeometryInstance,
            appearance: new Cesium.PerInstanceColorAppearance({
                closed: true, // 用于背景面剔除
            }),
        })
    );
}

/**
 * 针对面的偏移：
 * a）通过Entity的方式：有两对参数：height和heightReference、extrudeHeight和extrudeReference
 * 1）如果没有设置height和extrudeHeight，走的是贴弟的渲染流程（会贴地渲染），
 *   不会设置RectangleGeometry的offsetAttrite，offsetAttribute未设置就不会设置offset属性
 *   heightReference和extrudeReference又主要作用到offset上
 * 2）如果只设置了height和heightReference, 
 *    若heightReference为Clamp_**，则认为height为0，offset为矩形中心点的地形高度（不一定是这个歌矩形最高的地方）。
 *    若heightReference为Relative_**，offset为矩形中心点的地形高度+height
 * 3）只设置了extrudeHeight和extrudeReference
 *    若extrudeReference为Clamp_**, offsetAttribute为undifined，也就是不偏移，extrudeHeight被重置为矩形范围内瓦片的最低点（存放到瓦片0-6级近似值）
 *    若extrudeReference为Relative_**, offset取的是中心点地面高程（不管取何值，都是相对于地面，因为这个是由heightReference决定的，如果heightReference为NONE，还是拾取地面高程），上顶面会进行偏移，下底面不偏移且切椭球面，若extrudeHeight为0，不会进行拉伸，还是一个面也会偏移
 * 4）两者都设置了
 *    extrudeReference为HeightReference.RELATIVE_TO_GROUND，offset整体偏移，否则只偏移顶面.
 *    extrudeRefernce为CLAMP_**, extrudeHeight重置为矩形范围内瓦片的最低点（存放到瓦片0-6级近似值）,
 *    heightReference一个作用是用来拾取地形上的高度，NONE、**Ground都是拾取的ground，
 *                   另一个作用是如果为CLAMP_***，那么会重置height为0
 * ※ height和extrude谁大谁做为上顶面
 * 支持的面有：Rect，Corridor，Ellipse，Polygon
 * PlaneGeometry不支持height和extrudeHeight,
 */

{
    // entity
    const greenRectangle = viewer.entities.add({
        name:
        "Green translucent, rotated, and extruded rectangle at height with outline",
        rectangle: {
            coordinates: Cesium.Rectangle.fromDegrees(
                115, 39,
                115.01, 39.01
            ),
            material: Cesium.Color.GREEN.withAlpha(0.5),
            rotation: Cesium.Math.toRadians(45),
            extrudedHeight: .1,
            // height: 1000.0,
            // heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, // 不设置和设置为NONE、CLAMP_TO_GROUND/CLAMP_TO_TERRAIN/
            extrudedHeightReference: Cesium.HeightReference.CLAMP_TO_GROUND //
        },
    });

    // geometry

    const offset = Cesium.Cartesian3.multiplyByScalar(
        ellipsoid.geodeticSurfaceNormal(positionOnEllipsoid),
        60000,
        new Cesium.Cartesian3()
    );

    const greenRectangleInstance = new Cesium.GeometryInstance({
        geometry: new Cesium.RectangleGeometry({
          rectangle: Cesium.Rectangle.fromDegrees(115, 39, 115.01, 39.01),
          rotation: Cesium.Math.toRadians(45),
          extrudedHeight: 300000.0,
          height: 100000.0,
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
          geometryInstances: [redRectangleInstance, greenRectangleInstance],
          appearance: new Cesium.PerInstanceColorAppearance({
            closed: true,
          }),
        })
      );
}

/**
 * Wall/Plane 不支持offset/height,extrudeHeight, heightReference,extrudeReference
 */