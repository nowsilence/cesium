import { Cesium, getViewer } from "./index.js";
const viewer = await getViewer();
const type = 0;

// 椭圆中心点，会忽略center的高程，贴在椭球面上，如果需要高程需使用height设置
const center = Cesium.Cartesian3.fromDegrees(-75.59777, 40.03883); 
const semiMajorAxis = 500000; // 椭圆长轴长
const semiMinorAxis = 300000; // 椭圆短轴长
const rotation = Cesium.Math.toRadians(60.0); // 椭圆旋转角度
const stRotation = 0;
const height = 1;
const heightReference = Cesium.HeightReference.NONE;
const extrudedHeight = 0;
const extrudedHeightReference = Cesium.HeightReference.NONE;
// 这个粒度跟椭圆的大小没有关系，不像polygon、polyline根据粒度进行插点
// Math.PI / granularity，计算横向/垂直方向上分多少个切片
// 三角形顶点数据计算好传入shader，和Ellipsoid不一样
const granularity = Cesium.Math.RADIANS_PER_DEGREE; 

if (type == 0) {

    const ellipse = new Cesium.EllipseGeometry({
        center,
        semiMajorAxis, 
        semiMinorAxis,
        // rotation,
        // stRotation,
        // height,
        // heightReference,
        // extrudedHeight,
        // extrudedHeightReference,
        // granularity
    });
    
    const geometryInstance = new Cesium.GeometryInstance({
        geometry: ellipse,
        attributes: {
            color: Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.RED)
        }
    });

    // const primitive = viewer.scene.primitives.add(new Cesium.Primitive({
    //     geometryInstances: geometryInstance,
    //     asynchronous: false,
    //     appearance: new Cesium.MaterialAppearance({
    //         material: Cesium.Material.fromType('Color')
    //     })
    // }));
    const geometry = Cesium.EllipseGeometry.createGeometry(ellipse)
    var wireframeGeometry = Cesium.GeometryPipeline.toWireframe(geometry);
    const showAttr = new Cesium.ShowGeometryInstanceAttribute(true);
    
    // 将线框几何体添加到场景中进行显示
    viewer.scene.primitives.add(new Cesium.Primitive({
        geometryInstances: new Cesium.GeometryInstance({
            geometry: wireframeGeometry,
            attributes: {
                color: Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.WHITE),
                show: showAttr
            }
        }),
        asynchronous: false,
        appearance: new Cesium.PerInstanceColorAppearance({
            flat: true,
            // material: Cesium.Material.fromType('Color', {
            //     color: Cesium.Color.WHITE.withAlpha(0.8)
            // })
        })
    }));
    setTimeout(() => {
                showAttr.value = new Uint8Array([0])

    }, 0);
    Promise.resolve().then(() => {
        // showAttr.value = new Uint8Array([0])
    })

    
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
            granularity,
            numberOfVerticalLines: 16,
            // distanceDisplayCondition: new Cesium.DistanceDisplayCondition(1, 10000000), //0.0
            // shadows: Cesium.ShadowMode.ENABLED,
            // classificationType: Cesium.ClassificationType.BOTH,
            // zIndex: 0,
        }
    })
}