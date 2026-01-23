import { Cesium, getViewer } from "./index.js";

const viewer = await getViewer();
//## 有三种方式渲染polyline：
// 1）直接用PolylineGeometry和Primitive，PolylineColorAppearance
//    顶点着色代码, 默认用的是`${PolylineCommon}\n${PolylineColorAppearanceVS}`
//    片段：PerInstanceFlatColorAppearanceFS
// 2) 直接用PolylineGeometry和Primitive，PolylineMaterialAppearance
//    顶点着色代码, 默认用的是`${PolylineCommon}\n${PolylineMaterialAppearanceVS}`
//    片段：PolylineFS
// 3）使用Entity.polyline
//    顶点着色代码, 默认用的是`${PolylineCommon}\n${PolylineVS}` 
//    片段：PolylineVS
// 1和2： depthFailMaterial 通过primitive.depthFailAppearance来设置
//       distanceDisplayCondition通过GeometryInstance.attribute.distanceDisplayCondition来设置，会再Primitive添加代码逻辑
//       clampToGround和classificationType通过创建GroundPolylinePrimitive和GroundPolylineGeometry来设置达到目的
const type = 5;
let positions;
let geometryInstance, geometry;
let dashPattern, dashLength;
{
    positions = Cesium.Cartesian3.fromDegreesArray([-115.0, 37.0, -60.0, 10.0, -55.0, 60.0]);
    /**
     * @param {object} options Object with the following properties:
     * @param {Cartesian3[]} options.positions 点
     * @param {number} [options.width=1.0] 宽度 像素
     * @param {Color[]} [options.colors] 点颜色
     * @param {boolean} [options.colorsPerVertex=false] 如果设置false，则一个线段一个颜色，若为true，一个线段的颜色由线段两端点颜色进行插值
     * @param {ArcType} [options.arcType=ArcType.GEODESIC] 线段是测地线（GEODESIC，最短路径）还是恒向线（RHUMB,恒定方位角，暂时不支持，可能是cesiumbug），或者是NONE（空间直线）
     * @param {number} [options.granularity=CesiumMath.RADIANS_PER_DEGREE] 粒度 弧度 当线段对
     * @param {VertexFormat} [options.vertexFormat=VertexFormat.DEFAULT] 顶点格式， DEFAULT（POSITION_NORMAL_AND_ST），主要是看里面有没有st，如果有st则添加st，没有的话只添加position，不管如何设置不提供normal数据
     * @param {Ellipsoid} [options.ellipsoid=Ellipsoid.default] 椭球
     *
     */
    geometry = new Cesium.PolylineGeometry({
        arcType: Cesium.ArcType.NONE,
        colors: [new Cesium.Color(1, 0, 0, 1), new Cesium.Color(0, 1, 0, 1), new Cesium.Color(0, 0, 1, 1)],
        positions,
        colorsPerVertex: false,
        width: 10
    });

    geometryInstance = new Cesium.GeometryInstance({
        geometry: geometry,
        id: 'sid',
        attributes: {
            // 在primitive里追加distanceDisplayCondition代码逻辑
            // distanceDisplayCondition: new Cesium.DistanceDisplayConditionGeometryInstanceAttribute(100.0, 10000.0),
            // 对应shader里的 in vec4 color; 会覆盖PolylineGeometry.colors
            // color : Cesium.ColorGeometryInstanceAttribute.fromColor(new Cesium.Color(1.0, 0.0, 0.0, 1.0))
        }
    });

    // [{ length: 5, isGap: true}, ……]
    const getDash = data => {
        const dashLength = data.reduce((a, b) => {
            return a + b.length;
        }, 0);
        
        let fromSt = 0;
        let dashPattern = 0;

        for (const it of data) {
            const bits = Math.floor(it.length / dashLength * 16);
            if (!it.isGap) {
                for (let i = 0; i < bits; ++i) {
                    dashPattern = dashPattern | (1 << (i + fromSt));
                }
            }

            fromSt += bits;
        }

        return [dashPattern, dashLength];
    };

    [dashPattern, dashLength] = getDash([{ length: 7, isGap: true }, {length: 5, isGap: false }, {length: 3, isGap: true }, {length: 1, isGap: false }]);
}

// 第一种
if (type == 1) {
    /**
     * 不支持设置材质material
     * distanceDisplayCondition 通过GeometryInstance.attribute.distanceDisplayCondition来设置
     * @param {object} [options] Object with the following properties:
     * @param {boolean} [options.translucent=true] 半透明
     * @param {string} [options.vertexShaderSource] 顶点着色代码, 默认用的是`${PolylineCommon}\n${PolylineColorAppearanceVS}`，一般不要覆盖，顶点只有POSITION
     * @param {string} [options.fragmentShaderSource] 片段着色代码 默认用的是 PerInstanceFlatColorAppearanceFS
     * @param {object} [options.renderState] 
     */
    const appearance = new Cesium.PolylineColorAppearance();
    setTimeout(() => {
        viewer.scene.primitives.add(new Cesium.Primitive({
            asynchronous: false,
            geometryInstances: [geometryInstance],
            appearance
        }));
    }, 10000);
    
}

// 第二种
if (type == 2) {
    /**
     * 
     * @param {object} [options] Object with the following properties:
     * @param {boolean} [options.translucent=true] 半透明
     * @param {Material} [options.material=Material.ColorType] 材质
     * @param {string} [options.vertexShaderSource] 顶点着色代码, 默认用的是`${PolylineCommon}\n${PolylineColorAppearanceVS}`，一般不要覆盖，顶点只有POSITION
     * @param {string} [options.fragmentShaderSource] 片段着色代码 默认用的是 PerInstanceFlatColorAppearanceFS
     * @param {object} [options.renderState] 
     */
    const appearance = new Cesium.PolylineMaterialAppearance({
        // material: Cesium.Material.fromType('Color', {
        //     color: Cesium.Color.RED.withAlpha(0.8)
        // }),
        // material: Cesium.Material.fromType('PolylineArrow', {
        //     color: Cesium.Color.RED
        // }),
        // material: Cesium.Material.fromType('PolylineDash', {
        //     color: Cesium.Color.RED, // 默认白色
        //     gapColor: Cesium.Color.GREEN, // 默认tranparent
        //     dashPattern, //: 1, // 模式，16位 0表示gap部分 1 表示color部分
        //     dashLength,//: 100, // 表示一个虚线循环的长度
        // }),
        // material: Cesium.Material.fromType('PolylineGlow', {
        //     color: Cesium.Color.WHITE,
        //     glowPower: 0.25, // 光的强度
        //     taperPower: 1, // 锥形化强度, 大于99999无效果，线条从一端到另一端逐渐变细 / 变粗的锥形效果
        // }),
        // material: Cesium.Material.fromType('PolylineOutline', {
        //     color: Cesium.Color.WHITE,
            // outlineColor: Cesium.Color.BLACK,
            // outlineWidth: 10
        // }),
    });
    viewer.scene.primitives.add(new Cesium.Primitive({
        asynchronous: false,
        geometryInstances: [geometryInstance],
        appearance
    }));
}

// 第三种
if (type == 3) {
    
    /**
     * 如果clampToGround为true，则内部使用的是GroundPolylinePrimitive
     * 内部使用的shader是PolylineVS和PolylineFS，支持材质设置
     * 支持的材质类型有：
     * PolylineArrowMaterial-> PolylineArrowMaterialProperty
     * PolylineGlowMaterial-> PolylineGlowMaterialProperty
     * PolylineDashMeterial-> PolylineDashMaterialProperty
     * PolylineOutlineMaterial-> PolylineOutlineMaterialProperty
     * 
     * 内部使用的Apearance就两种：
     * PolylineMaterialAppearance
     * PolylineColorAppearance
     * 除了point、label、path、billboard外，其他的都是面的渲染，appearance也是两种：
     * MaterialAppearance
     * PerInstanceColorAppearance
     * 
     * PolylineCollection内部没有使用appearance，而是内置了shader，处理了顶点数据，没有构建Primitive
     * 
     * @property {Property | boolean} [show=true] 是否显示
     * @property {Property | Cartesian3[]} [positions] Cartesian3 数组
     * @property {Property | number} [width=1.0] A numeric Property specifying the width in pixels.
     * @property {Property | number} [granularity=Cesium.Math.RADIANS_PER_DEGREE] 细化粒度
     * @property {MaterialProperty | Color} [material=Color.WHITE] 材质
     * @property {MaterialProperty | Color} [depthFailMaterial] 深度检测失败材质
     * @property {Property | ArcType} [arcType=ArcType.GEODESIC] 弧类型
     * @property {Property | boolean} [clampToGround=false] 是否贴地
     * @property {Property | ShadowMode} [shadows=ShadowMode.DISABLED] 是否投影，或者接受投影
     * @property {Property | DistanceDisplayCondition} [distanceDisplayCondition] 距离条件展示
     * @property {Property | ClassificationType} [classificationType=ClassificationType.BOTH] 贴地类型，只有在clampToGround为true设置才有效
     * @property {Property | number} [zIndex=0] A Property specifying the zIndex
     */
    const polyline = viewer.entities.add({
        polyline: {
            positions,
            width: 20,
            arcType: Cesium.ArcType.NONE,
            material: Cesium.Color.RED, // 内部会转成 ColorMaterialProperty
            // material: new Cesium.ColorMaterialProperty(Cesium.Color.RED), //
            // material: new Cesium.PolylineArrowMaterialProperty(Cesium.Color.PURPLE),
            // material: new Cesium.PolylineDashMaterialProperty({
                // color: Cesium.Color.RED, // 默认白色
                // gapColor: Cesium.Color.GREEN, // 默认tranparent
                // dashPattern, //: 1, // 模式，16位 0表示gap部分 1 表示color部分
                // dashLength,//: 100, // 表示一个虚线循环的长度
            // }),
            // material: new Cesium.PolylineGlowMaterialProperty({
                // color: Cesium.Color.WHITE,
                // glowPower: 0.25, // 光的强度
                // taperPower: 1, // 锥形化强度, 大于99999无效果，线条从一端到另一端逐渐变细 / 变粗的锥形效果
            // }),
            // material: new Cesium.PolylineOutlineMaterialProperty({
            //     color: Cesium.Color.WHITE,
            //     outlineColor: Cesium.Color.BLACK,
            //     outlineWidth: 10
            // })
        }
    });
}

// GroundPolylinePrimitive
if (type == 4) {
    geometry = new Cesium.GroundPolylineGeometry({
        positions,
        width: 4,
    })
    geometryInstance = new Cesium.GeometryInstance({
        geometry: geometry,
        id: 'sid',
        attributes: {
            // 颜色必须设置
            color : Cesium.ColorGeometryInstanceAttribute.fromColor(new Cesium.Color(1.0, 0.0, 0.0, 1.0))
        }
    });

    viewer.scene.groundPrimitives.add(new Cesium.GroundPolylinePrimitive({
        geometryInstances : geometryInstance,
        appearance : new Cesium.PolylineColorAppearance({

        })
    }));
}

if (type == 5) {
    const polylineCollection = new Cesium.PolylineCollection();
    viewer.scene.primitives.add(polylineCollection);
    polylineCollection.add({
        positions,
        width: 4,
        material: Cesium.Material.fromType('Color')
    })
}