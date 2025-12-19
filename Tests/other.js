import { Cesium } from "./index.js";

var viewer = new Cesium.Viewer('cesiumContainer', {
    atmosphere: false,
    // skyAtmosphere: false
    // terrainProviderViewModels: [
    //     {
    //     name: 'World Terrain',
    //     tooltip: 'Global terrain data',
    //         creationFunction: function() {
    //             return new Cesium.CesiumTerrainProvider({
    //                 url: 'https://assets.cesium.com/assets/terrain/world'
    //             });
    //         }
    //     }
    // ],
    // animation: false,
        // baseLayerPicker: false,
    //     fullscreenButton: false,
    //     geocoder: false,
        // homeButton: false,
        // scene3DOnly: true, // 默认为false，场景仅渲染 3D 模式，可提供渲染性能
    //     sceneModePicker: true,
    //     selectionIndicator: false,
        // timeline: false,
        // navigationHelpButton: false,
        // infoBox: false,
        // navigationInstructionsInitiallyVisible: false,
        // imageryProviderViewModels: [googleMap]
    //     terrain: Cesium.Terrain.fromWorldTerrain({
    // requestWaterMask: true,
    // requestVertexNormals: true
    // })
})

viewer.scene.atmosphere = false;

// viewer.scene.skyBox = new Cesium.SkyBox({
//   sources : {
//     positiveX : './skybox/px.jpg',
//     negativeX : './skybox/nx.jpg',
//     positiveY : './skybox/py.jpg',
//     negativeY : './skybox/ny.jpg',
//     positiveZ : './skybox/pz.jpg',
//     negativeZ : './skybox/nz.jpg'
//   }
// });

viewer.scene.screenSpaceCameraController.enableCollisionDetection = false;

viewer.scene.globe.depthTestAgainstTerrain = false;
// viewer.scene.globe._surface.tileProvider._debug.wireframe = true;
// viewer.scene.globe.fillHighlightColor = new Cesium.Color(1.0, 0.0, 0, 1);
// viewer.camera.constrainedAxis = Cesium.Cartesian3.UNIT_Y;

viewer.terrainProvider = await Cesium.createWorldTerrainAsync();
    // viewer.scene.setTerrain(Cesium.Terrain.fromWorldTerrain({
    //     requestWaterMask: true,
    //     requestVertexNormals: true
    // }));

// viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider()
// viewer.imageryLayers.removeAll();
// viewer.scene.camera.switchToOrthographicFrustum()
// viewer.scene.fog.enabled = false;
// viewer.imageryLayers.addImageryProvider(new Cesium.TileCoordinatesImageryProvider());

// 添加mapbox自定义地图实例-
// var layer=new Cesium.MapboxStyleImageryProvider({
//     url:'https://api.mapbox.com/styles/v1',
//     username:'nowsilence',
//     styleId: 'cjyxrkx3g361d1cqozci0c6hy',
//     accessToken: 'pk.eyJ1Ijoibm93c2lsZW5jZSIsImEiOiJjanh2ZXFkZ2YwNDc4M2NvYzNwdWc2cGRiIn0.VbsFYhiH15bbdI9IW1-VbQ',
//     scaleFactor:true
// });

// const layer1 = new Cesium.WebMapServiceImageryProvider({ 
//             url: 'http://192.168.15.123:7090/rest/wms?VERSION=1.1.1', 
//             layers: 'cesium:taile', 
//             parameters: { 
//                 service : 'WMS', 
//                 format: 'image/png', 
//                 transparent: true, 
//             } 
//       }); 
// viewer.imageryLayers.addImageryProvider(new Cesium.TileCoordinatesImageryProvider())
// viewer.imageryLayers.addImageryProvider(layer);
// viewer.imageryLayers.addImageryProvider(layer1);

// for (let i = 0; i < 33; i++) {
//     var l=new Cesium.MapboxStyleImageryProvider({
//     url:'https://api.mapbox.com/styles/v1',
//     username:'nowsilence',
//     styleId: 'cjyxrkx3g361d1cqozci0c6hy',
//     accessToken: 'pk.eyJ1Ijoibm93c2lsZW5jZSIsImEiOiJjanh2ZXFkZ2YwNDc4M2NvYzNwdWc2cGRiIn0.VbsFYhiH15bbdI9IW1-VbQ',
//     scaleFactor:true
// });
//       viewer.imageryLayers.addImageryProvider(l);

// }

// let a = Cesium.Cartesian3.fromDegrees(116.445663,39.984186) 
// let b = Cesium.Cartesian3.fromDegrees(116.611238,40.001875) 
// let c = Cesium.Cartesian3.fromDegreesArray([116.445663,39.984186,0,0])
// const cart = Cesium.Cartographic.fromDegrees(116.445663,39.984186, 0);
// setTimeout(() => {
//     viewer.scene.globe.getHeight(cart)
// }, 10000);
// var polylines = viewer.scene.primitives.add(new Cesium.PolylineCollection());

// var loopPolyline = polylines.add({
//     positions : Cesium.PolylinePipeline.generateCartesianArc({
//         positions : Cesium.Cartesian3.fromDegreesArray([-105.0, 30.0,
//                                                         -105.0, 25.0,
//                                                         -100.0, 22.0,
//                                                         -100.0, 28.0])
//     }),
//     width : 3.0,
//     // material : new Cesium.PolylineArrowMaterialProperty(Cesium.Color.PURPLE)

//     // loop : true
// });

{
    // const positions = [
    //     Cesium.Cartesian3.fromDegrees(116, 40.03883, 50),
    //     Cesium.Cartesian3.fromDegrees(116  + 1.01, 40.03883 - 1.01, 50)
    // ] 
    // const polyline = viewer.entities.add({
    //     polyline: {
    //         positions: positions,
    //         // width: 5,
    //         // material: new Cesium.PolylineDashMaterialProperty({
    //         //     color: Cesium.Color.RED,
    //         //     dashLength: 100
    //         // })
    //         width: 50,
    //         arcType: Cesium.ArcType.NONE,
    //         material: new Cesium.PolylineArrowMaterialProperty(Cesium.Color.PURPLE)
    //     }
    // });
}

{
    // const positionProperty = new Cesium.SampledPositionProperty();

    // // 添加时间-位置样本点（使用JulianDate表示时间）
    const startTime = Cesium.JulianDate.now();// Cesium.JulianDate.fromIso8601('2025-06-17T00:00:00Z');
    // positionProperty.addSample(startTime, Cesium.Cartesian3.fromDegrees(0, 40, 1000));

    const endTime = Cesium.JulianDate.addSeconds(startTime, 10, new Cesium.JulianDate());// Cesium.JulianDate.addHours(startTime, 1, new Cesium.JulianDate());
    // positionProperty.addSample(endTime, Cesium.Cartesian3.fromDegrees(116, 41, 2000));

    // const entity = viewer.entities.add({
    //     position:  positionProperty,//Cesium.Cartesian3.fromDegrees(116.0, 40.0),
    //     point: {
    //         pixelSize: 15,
    //     color: Cesium.Color.BLUE.withAlpha(0.7), // 带透明度的颜色
    //     // heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, // 贴地
    //     // disableDepthTestDistance: Number.POSITIVE_INFINITY, // 永远可见（不被地形遮挡）
    //     // scaleByDistance: new Cesium.NearFarScalar(1.0e3, 1.0, 4.0e3, 0.2), // 根据距离缩放
    //     // translucencyByDistance: new Cesium.NearFarScalar(1.0e3, 1.0, 2.0e3, 0.1), // 根据距离改变透明度
    //     // distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 10000) //
    //     }
    // });

    // viewer.clock.startTime = startTime;
    // viewer.clock.stopTime = endTime;

    const clock = viewer.clock;

    // 设置时钟范围与样本点匹配
    clock.startTime = startTime.clone();
    clock.stopTime = endTime.clone();//Cesium.JulianDate.addSeconds(startTime, 120, new Cesium.JulianDate());
    clock.currentTime = startTime.clone();

    // 设置时钟行为
    // clock.clockRange = Cesium.ClockRange.LOOP_STOP; // 循环播放
    clock.multiplier = 1; // 时间流速（1=实时，负值=倒流）
    // clock.shouldAnimate = true; // 自动播放

    // Property.getValueOrUndefined调用，基本上在visualizer或者updater里的update函数里调用
    /**
     * 每一种Property都需要有一个getValue方法 
     **/
    // entity.position = new Cesium.CallbackProperty(function(time) {
    //     const angle = time.secondsOfDay * 0.1;
    //     const x = 116.4 + 0.1 * Math.cos(angle);
    //     const y = 39.9 + 0.1 * Math.sin(angle);
    //     return Cesium.Cartesian3.fromDegrees(x, y);
    // }, false);

}
// viewer.dataSourceDisplay.defaultDataSource.clustering.show = false;
console.log(viewer.dataSourceDisplay.defaultDataSource.clustering)
console.log(viewer.scene.maximumAliasedLineWidth)
// var purpleArrow = viewer.entities.add({
//     // name : '空中紫色直箭头',
//     polyline : {
//         positions : Cesium.Cartesian3.fromDegreesArrayHeights([
//             0, 0, 5550,
//             40, 0, 5550,
//             // -124, 43, 500000,
//             40, 40, 5550
//         ]),
//         width : 10,
//         // 不符合椭球面的直线。
//         // arcType : Cesium.ArcType.GEODESIC,
//         // color: Cesium.Color.RED,
//         // material: new Cesium.PolylineGlowMaterialProperty({
//         //     color: Cesium.Color.fromCssColorString('#67ADDF'),
//         //     glowPower: 0.25,
//         //     taperPower: 1,
//         // })
        
//         // material : new Cesium.PolylineArrowMaterialProperty(Cesium.Color.PURPLE)
//         material: new Cesium.PolylineDashMaterialProperty({
//             dashLength: 100,
//             dashPattern: parseInt('11011', 2),
//             color: Cesium.Color.CYAN,
//         }),
//     }
// });


// var redLine = viewer.entities.add({
//     name: "Red line on terrain",
//     position:a,
//     testName: 'ddd',
//     // polyline: {
//     //     positions: c,
//     //     show:true,
//     //     // pixelSize: 20,
//     //     width: 51,
//     //     material: Cesium.Color.RED,
//     //     // clampToGround: true,
//     // },
//     label:{
//         text:"测试"
//     }
// });

// var bluePlane = viewer.entities.add({
//   name: "Blue plane",
//   position: Cesium.Cartesian3.fromDegrees(116.0, 39.0, 300000.0),
//   plane: {
//     show: true,
    
//     plane: new Cesium.Plane(Cesium.Cartesian3.UNIT_X, 0.0),
//     dimensions: new Cesium.Cartesian2(400000.0, 300000.0), 
//     fill: true,
//     material: Cesium.Color.BLUE,
//     outline: false,
//     outlineColor: Cesium.Color.BLACK,
//     outlineWidth: 1.0,
//     shadows: Cesium.ShadowMode.ENABLED,
//   },
// });
//     const rectangle = viewer.scene.primitives.add(
//     new Cesium.Primitive({
//       geometryInstances: new Cesium.GeometryInstance({
//         geometry: new Cesium.RectangleGeometry({
//           rectangle: Cesium.Rectangle.fromDegrees(
//             -120.0,
//             20.0,
//             -60.0,
//             40.0
//           ),
//           vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT,
//         }),
//       }),
//       appearance: new Cesium.EllipsoidSurfaceAppearance({
//         aboveGround: false,
//       }),
//     })
//   );

    // console.log(Cesium.Cartesian3.dot(new Cesium.Cartesian3(0.5, 2, 0), new Cesium.Cartesian3(1, 0, 0)));
{
    // 如果属性为非Constant那么则为动态更新，每一帧都会获取新的属性
    // 直接修改属性，entity会触发definitionChanged事件，很多地方都监听了这个事件，比如entityCollection、GeometryUpdaterSet
    // var entity = viewer.entities.add({
    //     name: "cylinder",
    //     position: Cesium.Cartesian3.fromDegrees(-105.0, 40.0, 200000.0),
    //     cylinder: {
    //         length: 400000.0, 
    //         topRadius: 
    //         200000,
    //         // new Cesium.CallbackProperty(function(time) {
    //         //     return Date.now() % 5 * 100000
    //         // }, false), 
    //         bottomRadius: 200000.0, 
    //         heightReference: Cesium.HeightReference.NONE,
    //         fill: true,
    //         material: Cesium.Color.GREEN.withAlpha(0.5),
    //         outline: true,
    //         outlineColor: Cesium.Color.DARK_GREEN,
    //         outlineWidth: 1.0,
    //         numberOfVerticalLines: 16, 
    //         shadows: Cesium.ShadowMode.DISABLED,
    //         slices: 128, 
    //         clampToGround: true
    //     },
    // });

    // console.log(entity.position)

    // setTimeout(() => {
    //     entity.position =  Cesium.Cartesian3.fromDegrees(-18.0, 40.0, 200000.0)
    // }, 10000);
}


// var modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(
// Cesium.Cartesian3.fromDegrees(-75.62898254394531, 40.02804946899414, 200000.0));

// viewer.scene.primitives.add(
//   new Cesium.ClassificationPrimitive({
//     geometryInstances: new Cesium.GeometryInstance({
//       geometry: Cesium.BoxGeometry.fromDimensions({
//         vertexFormat: Cesium.PerInstanceColorAppearance.VERTEX_FORMAT,
//         dimensions: new Cesium.Cartesian3(400000.0, 300000.0, 1500000.0)
//       }),
//       modelMatrix: modelMatrix,
//       attributes: {
//         color: Cesium.ColorGeometryInstanceAttribute.fromColor(
//           new Cesium.Color(1.0, 0.0, 0.0, 0.5)
//         ),
//         show: new Cesium.ShowGeometryInstanceAttribute(true),
//       },
//       id: "volume",
//     }),
//     classificationType: Cesium.ClassificationType.TERRAIN,
//   })
// );

//     const positions1 = [];
// const colors = [];
// for (let j = 0; j <= 50; j += 5) {
//     positions1.push(
//         Cesium.Cartesian3.fromDegrees(-124.0 + j, 40, 50000.0 * (j % 10))
//     );
//     colors.push(Cesium.Color.fromRandom({ alpha: 1.0 }));
// }
// // //设置线段的位置和颜色，一一对应，arcType为ArcType.NONE
// const perSegmentPolyline = new Cesium.GeometryInstance({
//      geometry: new Cesium.SimplePolylineGeometry({
//          positions: positions1,
//          colors: colors,
//          arcType: Cesium.ArcType.NONE,
//      }),
//  });
//使用逐顶点着色绘制多段线
//对于逐顶点着色，将colorsPerVertex选项设置为true，并为colors选项提供长度等于位置数的颜色数组
// const perVertexPolyline = new Cesium.GeometryInstance({
// 	geometry: new Cesium.SimplePolylineGeometry({
// 	    positions: Cesium.Cartesian3.fromDegreesArray([-100, 40, -80, 30]),
// 	    colors: [Cesium.Color.RED, Cesium.Color.BLUE],
// 	    colorsPerVertex: true,
// 	}),
// });
//添加多段线instances到primitives
// viewer.scene.primitives.add(
//     new Cesium.Primitive({
//         geometryInstances: perSegmentPolyline,//[perSegmentPolyline],
//         appearance: new Cesium.PolylineColorAppearance({
//             // flat: true,
//             // renderState: {
//             //     lineWidth: Math.min(2.0, viewer.scene.maximumAliasedLineWidth),
//             // },
//         }),
//     })
// );

// const r = Cesium.OrientedBoundingBox.fromPoints([new Cesium.Cartesian3(-2177865.921106488, 4387848.421003733, 4070949.1142915394), new Cesium.Cartesian3(-2177844.4921231125, 4387805.247027799, 4071006.7241713805), new Cesium.Cartesian3(-2177888.7172238596, 4387807.158791821, 4070981.1766222217)]);
// const r = Cesium.OrientedBoundingBox.fromPoints([new Cesium.Cartesian3(-1000, -1000, 0), new Cesium.Cartesian3(1000, -1000, 0), new Cesium.Cartesian3(1000, 1000, 0), new Cesium.Cartesian3(-1000, 1000, 0),

// new Cesium.Cartesian3(-1000, -1000, 1000), new Cesium.Cartesian3(1000, -1000, 1000), new Cesium.Cartesian3(1000, 1000, 1000), new Cesium.Cartesian3(-1000, 1000, 1000)

// window.viewer = viewer;
// window.Cesium = Cesium;
// setTimeout(() => {
    // const center = Cesium.Cartesian3.fromDegrees(116.39,39.91, 199)
    // // 设置一个水平旋转方向的角度
    // const heading = Cesium.Math.toRadians(50)
    // // 设置一个垂直旋转视口的角度
    
    // const pitch =  Cesium.Math.toRadians(-90)
    // // 设置相机距离目标点的高度
    // const range = 2500 
    // viewer.camera.lookAt(center,new Cesium.HeadingPitchRange(heading,pitch,range))
    // viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY); // 取消lookAt
// }, 10000);

// function findParent(x, y, z) {
//     for (let i = 0; i < z; i++) {
//         const px = Math.floor(x / (2 >> (i + 1)));
//         const py = Math.floor(y / (2 >> (i + 1)));
//         const pz = z - (i + 1);
//         console.log(px, py, pz);

//         // findParent(px, py, pz)
//     }
// }

// 创建折线几何体实例
// const positions = Cesium.Cartesian3.fromDegreesArray([
//     -75.59777, 40.03883, 100,
//     -75.60106, 40.03324, 100
// ]);
// const geometryInstances = new Cesium.GeometryInstance({
//     geometry: new Cesium.PolylineGeometry({
//         positions: positions,
//         width: 15,
//         vertexFormat: Cesium.PolylineColorAppearance.VERTEX_FORMAT
//     }),
//     attributes : {
//        color : Cesium.ColorGeometryInstanceAttribute.fromColor(new Cesium.Color(1.0, 0.0, 0.0, 1.0))
//      },
// });

// 创建图元
// const primis

const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
handler.setInputAction(function (movement) {
const pos = viewer.scene.pickPosition(movement.position);

console.log(Cesium.Ellipsoid.WGS84.cartesianToCartographic(pos)    )
const pickedObject = viewer.scene.pick(movement.position);
if (Cesium.defined(pickedObject)) {
    // 当点击到折线实体时，改变其材质颜色
    // polylineEntity.polyline.material.color = Cesium.Color.BLUE;
    console.log('jjjj')
}
}, Cesium.ScreenSpaceEventType.LEFT_CLICK);

// const entity = viewer.entities.add({
//     position: Cesium.Cartesian3.fromDegrees(-103.0, 40.0),
//     ellipse: {
//         semiMinorAxis: 250000.0,
//         semiMajorAxis: 400000.0,
//         material: new Cesium.ImageMaterialProperty('yourImageUrl.jpg')
//     }
// });


// 创建多段线和每段颜色
// var positions11 = Cesium.Cartesian3.fromDegreesArray([
//     0.0, 0.0, 5.0, 
//     0.0, 5.0, 5.0]);
// var colors = [
// Cesium.Color.fromRandom({ alpha: 1.0 }),
// Cesium.Color.fromRandom({ alpha: 1.0 }),
// Cesium.Color.fromRandom({ alpha: 1.0 })
// ];
// var polyline = new Cesium.PolylineGeometry({
//   positions: positions11,
//   width: 5,
//   colors: colors,
//   colorsPerVertex: true,
//   arcType: Cesium.ArcType.NONE
// });
// var geometryInstance = new Cesium.GeometryInstance({
//   geometry: polyline,
//   attributes: {
//     // 可以添加其他属性，如id等
//   }
// });
// viewer.scene.primitives.add(new Cesium.Primitive({
//     geometryInstances: [geometryInstance],
//     appearance: new Cesium.PerInstanceColorAppearance({
//         flat: true,
//         // renderState: { lineWidth: 5 } // 设置线宽为5
//     })
//     }));


// {
//     // 创建多个线段的顶点数据
// const positions = Cesium.Cartesian3.fromDegreesArray([
//     -75.1641667, 39.9522222,  // 费城起点
//     -77.036667, 38.895,       // 华盛顿终点

//     -122.4194, 37.7749,       // 旧金山起点
//     -123.1207, 49.2827,       // 温哥华终点

//     -74.006, 40.7128,         // 纽约起点
//     -71.0589, 42.3601         // 波士顿终点
// ]);

// // 创建SimplePolylineGeometry实例
// const geometry = new Cesium.SimplePolylineGeometry({
//     positions: positions,
//     colors: [
//         Cesium.Color.fromBytes(255, 0, 0, 255),
//         Cesium.Color.fromBytes(255, 0, 0, 255),

//         Cesium.Color.fromBytes(0, 255, 0, 255),
//         Cesium.Color.fromBytes(0, 255, 0, 255),

//         Cesium.Color.fromBytes(0, 0, 255, 255),
//         Cesium.Color.fromBytes(0, 0, 255, 255)
//     ],
//     colorsPerVertex: false // 每条线段使用相同颜色
// });

// // 创建几何实例
// const geometryInstance = new Cesium.GeometryInstance({
//     geometry: geometry,
//     attributes : {
//         color : Cesium.ColorGeometryInstanceAttribute.fromColor(new Cesium.Color(1.0, 1.0, 1.0, 1.0))
//       },
//     id: 'multi-colored-lines'
// });

// // 添加Primitive到场景
// const primitive = viewer.scene.primitives.add(new Cesium.Primitive({
//     geometryInstances: geometryInstance,
//     appearance: new Cesium.PerInstanceColorAppearance({
//         flat: false,
//         translucent: false
//     }),
//     asynchronous: false
// }));


// }

/**
 * 如果未设置height、extrudeHeight(一旦设置，哪怕是0，也不会贴地), 渲染的就是贴地的
 * */
// const greenRectangle = viewer.entities.add({
//     name:
//     "Green translucent, rotated, and extruded rectangle at height with outline",
//     rectangle: {
//         coordinates: Cesium.Rectangle.fromDegrees(
//             115, 39,
//             115.01, 39.01
//         ),
//         material: Cesium.Color.GREEN.withAlpha(0.5),
//         rotation: Cesium.Math.toRadians(45),
//         extrudedHeight: .1,
//         // height: 1000.0,
//         // heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, // 不设置和设置为NONE、CLAMP_TO_GROUND/CLAMP_TO_TERRAIN/
//         extrudedHeightReference: Cesium.HeightReference.CLAMP_TO_GROUND //
//     },
// });

// Cesium渲染的问题：已知坐标[115.005, 39.005]处的地形高程为376，为什么下面两种方式渲染的box不在同一个高度。

// viewer.entities.add({
//     name: "Blue box",
//     position: Cesium.Cartesian3.fromDegrees(115.005, 39.005, 376),
//     box: {
//         dimensions: new Cesium.Cartesian3(400.0, 300.0, 1.0),
//         material: Cesium.Color.BLUE,
//     },
// });

viewer.entities.add({
name: "Blue box",
position: Cesium.Cartesian3.fromDegrees(115.005, 39.005, 0),
box: {
    dimensions: new Cesium.Cartesian3(40.0, 30.0, 1.0),
    material: Cesium.Color.BLUE,
    
    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
},
});

// const pos = Cesium.Cartesian3.fromDegrees(115.005, 39.005,0);
// // -131.7163028188954, 282.4021787816203, 252.38112891816533
// pos.x += -131.7163028188954;
// pos.y += 282.4021787816203;
// pos.z += 252.38112891816533;

// viewer.entities.add({
// position:  Cesium.Cartesian3.fromDegrees(115.005, 39.005,376),
// point: {
//     pixelSize: 25,
// color: Cesium.Color.RED.withAlpha(0.7), // 带透明度的颜色
// // heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, // 贴地
// // disableDepthTestDistance: Number.POSITIVE_INFINITY, // 永远可见（不被地形遮挡）
// // scaleByDistance: new Cesium.NearFarScalar(1.0e3, 1.0, 4.0e3, 0.2), // 根据距离缩放
// // translucencyByDistance: new Cesium.NearFarScalar(1.0e3, 1.0, 2.0e3, 0.1), // 根据距离改变透明度
// // distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 10000) //
// }
// });



{
const dimensions = new Cesium.Cartesian3(40.0, 30.0, 1.0);
const positionOnEllipsoid = Cesium.Cartesian3.fromDegrees(115.005, 39.005);
const boxModelMatrix = Cesium.Matrix4.multiplyByTranslation(
    Cesium.Transforms.eastNorthUpToFixedFrame(positionOnEllipsoid),
    new Cesium.Cartesian3(0.0, 0.0, dimensions.z * 0.5),
    new Cesium.Matrix4()
);
    
const boxGeometry = Cesium.BoxGeometry.fromDimensions({
    vertexFormat: Cesium.PerInstanceColorAppearance.VERTEX_FORMAT,
    dimensions: dimensions,
    offsetAttribute: Cesium.GeometryOffsetAttribute.ALL
});

// const offset = Cesium.Cartesian3.multiplyByScalar(
//     ellipsoid.geodeticSurfaceNormal(positionOnEllipsoid),
//     60000,
//     new Cesium.Cartesian3()
// );
// const offset = new Cesium.OffsetGeometryInstanceAttribute(-131.7163028188954, 282.4021787816203, 252.38112891816533)


// const boxGeometryInstance = new Cesium.GeometryInstance({
//     geometry: boxGeometry,
//     modelMatrix: boxModelMatrix, // 设置位置姿态信息
//     attributes: {
//         color: Cesium.ColorGeometryInstanceAttribute.fromColor(
//             new Cesium.Color(1.0, 0.0, 0.0, 0.5)
//         ),
//         offset
//     },
// });
    
// viewer.scene.primitives.add(
//     new Cesium.Primitive({
//         geometryInstances: boxGeometryInstance,
//         appearance: new Cesium.PerInstanceColorAppearance({
//             closed: true, // 用于背景面剔除
//         }),
//     })
// );
}

// (-131.7163028188954, 282.4021787816203, 252.38112891816533)

console.log(Cesium.Cartesian3.fromDegrees(115.005, 39.005, 0))
const terrainProvider = viewer.terrainProvider;
const positions = [Cesium.Cartographic.fromDegrees(115.005, 39.005)];
console.log(Cesium.Ellipsoid.WGS84.geodeticSurfaceNormalCartographic(positions[0])    )
Cesium.sampleTerrain(terrainProvider, 13, positions).then(function(updatedPositions) {
const terrainHeight = updatedPositions[0].height; // 地形的椭球面高度
console.log(terrainHeight)

setTimeout(() => {
    const nn = viewer.scene.getHeight(updatedPositions[0], Cesium.HeightReference.CLAMP_TO_GROUND);
console.log(nn)
}, 3000);
});

// 相对地形还是相对3dtile主要取决于heightReference，extrudedHeightReference并没有卵用
// extrudedHeightReference值为RELATIVE_TO_**的时候有离地高度，其他值则是贴到地面（不是完全贴合），取的是所在区域近似的最低点

// const scene = viewer.scene;
// const ellipsoid = scene.globe.ellipsoid;

// const id1 = "1";
// const id2 = "2";
// const id3 = "3";

// let rectangle = Cesium.Rectangle.fromDegrees(-100.0, 30.0, -99.0, 31.0);
// let center1 = Cesium.Rectangle.center(rectangle);
// center1 = ellipsoid.cartographicToCartesian(center1);
// let offset = Cesium.Cartesian3.multiplyByScalar(
//   ellipsoid.geodeticSurfaceNormal(center1),
//   60000,
//   new Cesium.Cartesian3()
// );

// const i1 = new Cesium.GeometryInstance({
//   id: id1,
//   geometry: new Cesium.RectangleGeometry({
//     rectangle: rectangle,
//     extrudedHeight: 10000.0,

//     vertexFormat: Cesium.PerInstanceColorAppearance.VERTEX_FORMAT,
//     offsetAttribute: Cesium.GeometryOffsetAttribute.ALL,
//   }),
//   attributes: {
//     color: Cesium.ColorGeometryInstanceAttribute.fromColor(
//       new Cesium.Color(1.0, 0.0, 0.0, 0.5)
//     ),
//     offset: Cesium.OffsetGeometryInstanceAttribute.fromCartesian3(
//       offset
//     ),
//   },
// });


// const i2 = new Cesium.GeometryInstance({
//   id: id2,
//   geometry: new Cesium.RectangleGeometry({
//     rectangle: rectangle,
//     extrudedHeight: 30000.0,
//     vertexFormat: Cesium.PerInstanceColorAppearance.VERTEX_FORMAT,
//     offsetAttribute: Cesium.GeometryOffsetAttribute.TOP,
//   }),
//   attributes: {
//     color: Cesium.ColorGeometryInstanceAttribute.fromColor(
//       new Cesium.Color(0.0, 1.0, 0.0, 0.5)
//     ),
//     offset: Cesium.OffsetGeometryInstanceAttribute.fromCartesian3(
//       Cesium.Cartesian3.ZERO
//     ),
//   },
// });

// setTimeout(() => {
//     const p = scene.primitives.add(
//   new Cesium.Primitive({
//     geometryInstances: [i1, i2],
//     appearance: new Cesium.PerInstanceColorAppearance({
//       closed: true,
//     }),
//     asynchronous: false,
//   })
// );
// }, 1000);
createClosure()
function createClosure() { 
// 假设这是一个大型对象（如大量数据、DOM 元素集合）
const bigObject = new Array(1000000).fill('占用内存的数据');

// 闭包捕获了 bigObject 的引用
globalFunc = () => {
console.log(bigObject.length); // 仅使用了 bigObject 的一个属性
};
}

const center = Cesium.Cartesian3.fromDegrees(115,39)
const pitch =  Cesium.Math.toRadians(-90)
    // 设置相机距离目标点的高度
const range = 2500 
viewer.camera.lookAt(center,new Cesium.HeadingPitchRange(0, pitch,range))
viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
console.log(Cesium.SceneTransforms.clipToGLWindowCoordinates({x: 0, y:  0, width: 1000, height: 800}, new Cesium.Cartesian4(-1, -1, 0, 1)))


// new Cesium.Material({
//     fabric: {
//     type: "StandardMaterial",
//     uniforms: {
//         emission: Cesium.Color.YELLOW, // 黄色自发光
//         // 用 Expression 实现强度随时间周期性变化（sin 函数实现 0.5~1.5 之间波动）
//         emissionIntensity: new Cesium.Expression(`
//         0.5 + Math.abs(Math.sin(Cesium.JulianDate.now().getTime() / 1000))
//         `)
//     }
//     }
// })

// new Cesium.Material({
//     fabric: {
//     type: "StandardMaterial",
//     uniforms: {
//         // 用 CallbackProperty 动态返回颜色（每 500ms 切换红/绿）
//         emission: new Cesium.CallbackProperty(() => {
//         const time = Date.now() % 1000; // 周期 1000ms
//         return time < 500 ? Cesium.Color.RED : Cesium.Color.GREEN;
//         }, false)
//     }
//     }
// })

// const multiRegionMaterial = new Cesium.Material({
//   fabric: {
//     type: "MultiRegionMaterial",
//     uniforms: {
//       textureAtlas: new Cesium.TextureUniform({ url: "path/to/atlas.png" }), // 纹理图集
//       regionCount: 3 // 3个区域
//     },
//     source: `
//       uniform sampler2D textureAtlas;
//       uniform float regionCount;
//       varying vec4 v_color; // 顶点颜色（标记区域ID）

//       void main() {
//         // 根据顶点颜色的R通道获取区域ID（0~regionCount-1）
//         float regionId = floor(v_color.r * regionCount);
//         // 计算纹理坐标（映射到纹理图集的对应区域，如横向排列）
//         vec2 uv = vec2(
//           (gl_FragCoord.x / resolution.x) / regionCount + regionId / regionCount,
//           gl_FragCoord.y / resolution.y
//         );
//         gl_FragColor = texture2D(textureAtlas, uv);
//       }
//     `
//   }
// });

// new Cesium.Material({
//     fabric: {
//       materials: {
//         diffuseMaterial: {
//           type: "DiffuseMap",
//           uniforms: {
//             image: "../images/Cesium_Logo_Color.jpg",
//           },
//         },
//         emissionMaterial: {
//           type: "EmissionMap",
//           uniforms: {
//             image: "../images/checkerboard.png",
//             repeat: {
//               x: 1,
//               y: 0.5,
//             },
//           },
//         },
//       },
//       components: {
//         diffuse: "diffuseMaterial.diffuse",
//         emission: "emissionMaterial.emission * 0.2",
//       },
//     },
//   });

// new Cesium.Material({
//     fabric: {
//       uniforms: {
//         image: "../images/earthspec1k.jpg",
//         heightField: "../images/earthbump1k.jpg",
//       },
//       materials: {
//         bumpMap: {
//           type: "BumpMap",
//           uniforms: {
//             image: "../images/earthbump1k.jpg",
//           },
//         },
//       },
//       source: `
//                 czm_material czm_getMaterial(czm_materialInput materialInput) {
//                     czm_material material = czm_getDefaultMaterial(materialInput);
//                     vec4 color;
//                     float heightValue = texture(heightField, materialInput.st).r;
//                     color.rgb = mix(vec3(0.2, 0.6, 0.2), vec3(1.0, 0.5, 0.2), heightValue);
//                     color.a = (1.0 - texture(image, materialInput.st).r) * 0.7;
//                     color = czm_gammaCorrect(color);
//                     material.diffuse = color.rgb;
//                     material.alpha = color.a;
//                     material.normal = bumpMap.normal;
//                     material.specular = step(0.1, heightValue);  // Specular mountain tops
//                     material.shininess = 8.0;  // Sharpen highlight
//                     return material;
//                 }
//                 `,
//     },
//   });