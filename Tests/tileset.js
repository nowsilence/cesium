import { Cesium, getViewer } from "./index.js";
const viewer = await getViewer();

const czmlPath = "./Apps/SampleData/Cesium3DTiles/Tilesets/TilesetWithViewerRequestVolume/tileset.json";

const tileset = await Cesium.Cesium3DTileset.fromUrl(czmlPath, {
    cacheBytes: 536870912, // 默认加载最大大小，单位字节，536870912B=512M
    maximumScreenSpaceError: 16, // 默认 16 最大屏幕误差 单位：米/像素 用来控制根节点是否渲染，通过根节点的几何误差计算根节点的实时屏幕误差
    skipLevelOfDetail: false, // 默认 false
    immediatelyLoadDesiredLevelOfDetail: false, // 当skipLevelOfDetail = true时此参数才有效，表示只加载可见的叶子节点
    skipLevels: 1, // 默认 1 当skipLevelOfDetail为true有效，向上查找到一个有内容的ancestor，当前节点tile的深度必须大于ancestor._depth + tileset.skipLevels，若skipLevels=1, ancestor.deep=9,那么tile.depth至少为11, tile._depth > ancestor._depth + tileset.skipLevels
    skipScreenSpaceErrorFactor: 16, // 默认 16 SSE缩放因子，跳过的前提条件是，tile._screenSpaceError < ancestor._screenSpaceError / skipScreenSpaceErrorFactor，所以skipScreenSpaceErrorFactor一般大于1，判断当前瓦片的屏幕误差远小于祖先瓦片的屏幕误差，屏幕误差：瓦片层级越高值越小
    baseScreenSpaceError: 1024, // 默认1024 基础屏幕误差 skipLevelOfDetail为true有效，如果瓦片的SSE大于baseSSE，则走基础的瓦片遍历流程（即相当于skipLevelOfDetail为false）
    cullRequestsWhileMoving: true, // 默认true 相机移动时的瓦片加载节流，避免快速移动时加载临时可见的瓦片；
    cullRequestsWhileMovingMultiplier: 60, // 默认60 移动时剔除请求的乘数，相机移动速度不变的情况下，值越大，被请求被剔除的可能性越大
    foveatedTimeDelay: 0.2, // 默认 0.2 单位秒 注视延迟时间 有些瓦片被定义为低优先级瓦片，当相机停止移动后的时间a，如果a < foveatedTimeDelay,则先不加载该瓦片
    cullWithChildrenBounds: true, // 默认true 瓦片细化策略是REFINE，且包围体是有向包围盒，当前瓦片是否可见，会判断其子瓦片是否可见，若其子瓦片都不可见，则本瓦片不可见，优化瓦片加载策略
    preloadWhenHidden: false, // 默认false show为false的时候，在预加载pass阶段是否要进行预加载瓦片
    preloadFlightDestinations: true, // 默认true 在相机flight的时候，是否要预加载目的地瓦片，若show=false，preloadWhenHidden=true的时候也会加载
    preferLeaves: false, // 默认 false，优化选项 是否优先加载叶子节点
    loadSiblings: false, // 默认 false，从代码来看，貌似为父瓦片可见，就会加载所有的子瓦片（子瓦片的兄弟瓦片）
    clippingPlanes: undefined, // ClippingPlaneCollection
    clippingPolygons: undefined, // ClippingPolygonCollection
    classificationType: undefined, // 
    heightReference: undefined,
    backFaceCulling: true, // 默认 true 若false，则禁止背面剔除，若true，则由gltf材质定义
    projectTo2D: false, // 在切换到2D/CV模式下，是否要投影到2D，会提前生成一份2d/CV顶点数据放到内存，故会增加内存的使用
    enablePick: false, // 默认false webgl2.0无效 在webgl1.0 设置true的话可以拾取（1.0没有深度纹理）
    asynchronouslyLoadImagery: false, // 默认false 若纹理没有加载则瓦片不显示 若为true，则瓦片内容会显示，纹理渲染要到纹理加载完成
    enableCollision: false, // 默认false 若为true，则相机不能穿透
    vectorClassificationOnly: false, // 默认 false 若为true，则classificationType设置对Gltf和B3dm无效
    enableShowOutline: true, // 默认true
    showOutline: true, // 默认true
    outlineColor: Cesium.Color.BLACK,
    splitDirection: Cesium.SplitDirection.NONE, // 配合scene.splitPosition使用，分割屏幕，左右两侧，主要对model有用，
    lightColor: undefined, // 灯光颜色 若未设置，则使用scene.lightColor
    pointCloudShading: undefined, // 点云渲染参数设置
    imageBasedLighting: undefined, // ImageBasedLighting对象 基于图像的光照 需要一张环境贴图 里面预计算了漫反射和高光反射
});
viewer.scene.primitives.add(tileset);


viewer.scene.camera.flyTo({
    destination: Cesium.Cartesian3.fromRadians(-1.3197209591796106,0.6988424218, 100)
})


