import { Cesium, getViewer } from "./index.js";
const viewer = await getViewer();
const type = 0;

const ops = {
    height: 0, // 多边形面到椭球面的距离
    extrudedHeight: 0, // 拉伸面到椭球面的距离
    // vertexFormat: Cesium.VertexFormat.DEFAULT,
    stRotation: 0, // 纹理旋转角度
    // granularity: Cesium.Math.RADIANS_PER_DEGREE, // 粒度
    perPositionHeight: false, // 若为true则使用positions中的z值，false则忽略z值，使用height统一高程
    closeTop: true, // 是否闭合上顶面，
    closeBottom: true, // 是否闭合下底面
    // arcType: Cesium.ArcType.GEODESIC
};

let geometry, polygonGeometry, hierarchy;

{
    // 1. create a polygon from points
    {
        hierarchy = new Cesium.PolygonHierarchy(
            Cesium.Cartesian3.fromDegreesArray([
                -72.0, 40.0,
                -70.0, 35.0,
                -75.0, 30.0,
                -70.0, 30.0,
                -68.0, 40.0
            ])
        );
        polygonGeometry = new Cesium.PolygonGeometry({
            ...ops,
            polygonHierarchy : hierarchy
        });
        geometry = Cesium.PolygonGeometry.createGeometry(polygonGeometry);
    }

    {
        hierarchy = new Cesium.PolygonHierarchy(
            Cesium.Cartesian3.fromDegreesArray([
                -109.0, 30.0,
                -95.0, 30.0,
                -95.0, 40.0,
                -109.0, 40.0
            ]),
            [new Cesium.PolygonHierarchy(
                Cesium.Cartesian3.fromDegreesArray([
                    -107.0, 31.0,
                    -107.0, 39.0,
                    -97.0, 39.0,
                    -97.0, 31.0
                ]),
                [new Cesium.PolygonHierarchy(
                    Cesium.Cartesian3.fromDegreesArray([
                        -105.0, 33.0,
                        -99.0, 33.0,
                        -99.0, 37.0,
                        -105.0, 37.0
                    ]),
                    [new Cesium.PolygonHierarchy(
                        Cesium.Cartesian3.fromDegreesArray([
                            -103.0, 34.0,
                            -101.0, 34.0,
                            -101.0, 36.0,
                            -103.0, 36.0
                        ])
                    )]
                )]
            )]
        );
        // 带洞多边形，可以一直嵌套下去，实现洞中洞
        polygonGeometry = new Cesium.PolygonGeometry({
            ...ops,
            polygonHierarchy: hierarchy 
        });
        geometry = Cesium.PolygonGeometry.createGeometry(polygonGeometry);
    }
    
    // 如果使用asynchronous为true，则geometry必须以createGeometry创建
    // asynchronous为false，则二则都可使用
    const geometryInstance = new Cesium.GeometryInstance({
        geometry: polygonGeometry, 
        attributes: {
            color: Cesium.ColorGeometryInstanceAttribute.fromColor(new Cesium.Color(1.0, 0.0, 0.0, 1.0))
        }
    })
    if (type == 0) {
        viewer.scene.primitives.add(new Cesium.Primitive({
            geometryInstances: geometryInstance,
            asynchronous: true,
            appearance: new Cesium.PerInstanceColorAppearance({

            })
        }));
    }
    
    const center = Cesium.Cartesian3.fromDegrees(-72.0, 40.0)
    const pitch =  Cesium.Math.toRadians(0)
    //         // 设置相机距离目标点的高度
    const range = 2500 
    // viewer.camera.lookAt(center,new Cesium.HeadingPitchRange(0, pitch, range))
    // viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
}

if (type == 1) {
    viewer.entities.add({
        polygon: {
            hierarchy,
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
            // perPositionHeight: false, // 若为true则使用positions中的z值，false则忽略z值，使用height统一高程
            // closeTop: true,
            // closeBottom: true,
            // zIndex: 0,
            // granularity: Cesium.Math.RADIANS_PER_DEGREE, // 粒度
            // classificationType: ClassificationType.BOTH,
            // distanceDisplayCondition: new Cesium.DistanceDisplayCondition(1, 10000000), //0.0
            // shadows: Cesium.ShadowMode.ENABLED
            // textureCoordinates:
        }
    })
}