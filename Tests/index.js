import * as Cesium from "../Build/CesiumUnminified/index.js"

Cesium.Ion.defaultAccessToken='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwYjZkZTViOC0xN2E5LTRlMDctOTcxOS04YjU1N2NjMjljOTkiLCJpZCI6MTM0NzcsInNjb3BlcyI6WyJhc3IiLCJnYyJdLCJpYXQiOjE1NjMzNTM5ODB9.RGY9YEPoZFxqKWq-mUb5Yu8QWnRBlnqsvpC-eEKxGDc';

let viewer;

async function getViewer() {
    if (viewer) { return viewer; }

    return createView();
}

async function createView() {

    const skyBox = new Cesium.SkyBox({
      sources : {
        positiveX : './skybox/px.jpg',
        negativeX : './skybox/nx.jpg',
        positiveY : './skybox/py.jpg',
        negativeY : './skybox/ny.jpg',
        positiveZ : './skybox/pz.jpg',
        negativeZ : './skybox/nz.jpg'
      }
    });

    const terrainProvider = await Cesium.createWorldTerrainAsync();

    viewer = new Cesium.Viewer('cesiumContainer', {
        // sceneMode: Cesium.SceneMode.SCENE3D,  // 初始场景 默认 Cesium.SceneMode.SCENE3D
        // scene3DOnly: true, // 默认为false，场景仅渲染 3D 模式，可提供渲染性能
        // shouldAnimate: false, // 默认false false clock时间是静止的 true 时间在设定的范围走动
        
        // skyAtmosphere: false, // 如果未明确设置为false，则会显示天空大气
        // skyBox, // 默认false 或者 viewer.scene.skyBox = skybox
        
        // baseLayer: Cesium.ImageryLayer.fromWorldImagery(), // 最底下的图层，一个图层对应一个ImageryProvider，默认使用bingMap
        terrain: Cesium.Terrain.fromWorldTerrain(), // terrainProvider的生成器
        // terrainProvider: terrainProvider, // 地形Provider，默认EllipsoidTerrainProvider

        // 右上角UI
        // geocoder: false, // 默认IonGeocodeProviderType.DEFAULT 搜索按钮，false则不显示搜索按钮
        // homeButton: false, // 默认true 主页按钮，点击回到星球视口
        // sceneModePicker: false, // 默认true 场景选择器 3d 2d 2.5d
        // projectionPicker: true, // 默认false 投影选择器, 正交或者透视
        // baseLayerPicker: false, // 默认true 右上角选择影像、地形
        // navigationHelpButton: false, // 默认true 帮助按钮
        // navigationInstructionsInitiallyVisible: true, // 默认true navigationHelpButton为true的时候，才起作用，页面初始状态是否打开地图操作面板（列出了 3D 地球的基本交互方式（如鼠标拖拽旋转、滚轮缩放等））
        
        // 底部UI
        // creditContainer: document.createElement('div'), // 版权信息容器，隐藏的话可以设置一个不在dom树里的容器
        // animation: false, // 默认true 左下角控件 控制动画向前播放、后退播放、暂停、加速/减慢播放
        // timeline: false, // 默认true 是否显示时间控件，负责时间范围的可视化、精准拖拽定位
        // fullscreenButton: false, // 默认true 全屏显示按钮 右下角全屏按钮
        // vrButton: true, // 默认false

        // selectionIndicator: false, // 默认 true 选中的entity是否显示瞄准器
        // infoBox: false, // 默认true 选择entity是否显示相关信息
        
        // mapProjection: new Cesium.GeographicProjection(options.ellipsoid), // 2d/2.5D地图时使用的投影
        mapMode2D: Cesium.MapMode2D.ROTATE, // 只能选择旋转或者移动 二维地图是否可以旋转，或者在水平方向上无限移动
        // automaticallyTrackDataSourceClocks: true, // 默认true 控制Viewer的主Clock（全局时间核心）是否自动同步/跟随加载的 DataSource（如 KML、CZML）自身的时间配置，当加载带时间属性的 KML 轨迹（内含 <when>/<gx:Track> 时间戳）时，Viewer会提取KML数据源的时间范围（比如轨迹的 8:00-8:10），并将Viewer主Clock的 startTime/stopTime替换为该范围
        
        // shadows: false, // 灯光源是否进行投影
        // terrainShadows: Cesium.ShadowMode.RECEIVE_ONLY, // 地形的投影模式，默认只接受投影
        
        // useDefaultRenderLoop: true, // 默认true，是否使用默认渲染循环
        // targetFrameRate: undefined, // 默认udefined 表示尽快渲染，即下次屏幕重绘即调用
        // showRenderLoopErrors: true, // 默认true 是否显示错误
        // requestRenderMode: false, // 默认false，请求渲染模式，只有在有变化（数据，视口等）的时候进行渲染
        // orderIndependentTranslucency: true, // 默认true，是否使用与顺序无关的半透明渲染策略
        // useBrowserRecommendedResolution: false, // 默认 true pixelRatio=1， false pixelRatio=window.devicePixelRatio
        
        // 以下参数基本上无需修改
        // contextOptions: undefined, // 构建webgl context参数
        // clockViewModel: undefined, // 默认 new ClockViewModel(clock)
        // fullscreenElement: document.body, // 全屏默认节点
        // blurActiveElementOnCanvasFocus: true, // 默认true 当焦点在其他元素（比如输入框），点击地图的时候这个元素是否失去焦点，默认会失去，防止误操作
        // maximumRenderTimeChange: 0, // 最大渲染时间间隔，若requestRenderMode为true，地图无任何变化，也会在maximumRenderTimeChange时间后渲染一次
        // msaaSamples: 4, // 默认4 多重采样抗锯齿， 数值为2/4/8，数值越大越耗性能
        // dataSources: new Cesium.DataSourceCollection(),
        // selectedImageryProviderViewModel: undefined, // baseLayerPicker为true才有效，用来控制imageryProvider选择的
        // imageryProviderViewModels: Cesium.createDefaultImageryProviderViewModels(), // baseLayerPicker为true才有效 createDefaultImageryProviderViewModels里面创建了一些默认的ImageryProvider
        // selectedTerrainProviderViewModel: undefined, // 作用同上
        // terrainProviderViewModels: Cesium.createDefaultTerrainProviderViewModels(), // 作用同上
    });

    // surface瓦片展示三角面边框
    // viewer.scene.globe._surface.tileProvider._debug.wireframe = true;
    // viewer.scene.globe.fillHighlightColor = new Cesium.Color(1.0, 0.0, 0, 1);
    // viewer.camera.constrainedAxis = Cesium.Cartesian3.UNIT_Y;

    viewer.scene.screenSpaceCameraController.enableCollisionDetection = false;
    viewer.scene.globe.depthTestAgainstTerrain = false;
    // viewer.scene.screenSpaceCameraController.enableLook = false;
    // viewer.scene.screenSpaceCameraController.enableRotate = true; // 禁用拖拽旋转（避免干扰 Free Look）
    // viewer.scene.screenSpaceCameraController.enableZoom = false;
    // viewer.scene.screenSpaceCameraController.enableTranslate = false;
    // viewer.scene.screenSpaceCameraController.enableTilt = false;

    const center = Cesium.Cartesian3.fromDegrees(116.4038, 39.9151, 100);

    // 设置相机为第一人称视角（指向轨迹方向）
// viewer.camera.lookAt(
//   center, // 相机位置（贴近轨迹）
//   new Cesium.Cartesian3(0, -1000, 50) // 相机朝向（向后1000米、向上50米，指向轨迹）
// );
// 切换到第一人称控制器模式（关键）
// viewer.camera.mode = Cesium.CameraMode.LOCAL;
    /**
     * 设置TerrainProvider的4种方式。
     * 1、在构建Viewer的时候输入参数：terrain: Cesium.Terrain.fromWorldTerrain()
     * 2、在构建Viewer的时候输入参数：terrainProvider: terrainProvider
     * 3、viewer.terrainProvider = terrainProvider; // await Cesium.createWorldTerrainAsync();
     * 4、viewer.scene.setTerrain(Cesium.Terrain.fromWorldTerrain({
     *       requestWaterMask: true,
     *       requestVertexNormals: true
     *   }));
     * 
     * Terrain和TerrainProvider相比，Terrain可以使用异步的方式，不必等待Provider创建完成
     */

    /**
     * 设置ImageryProvider的方式2种
     * 1、在构建Viewer的时候输入参数：baseLayer: Cesium.ImageryLayer.fromWorldImagery()构建一个layer
     * 2、viewer.imageryLayers.addImageryProvider(new Cesium.TileCoordinatesImageryProvider());
     */
   
    // viewer.imageryLayers.removeAll();
    // viewer.scene.camera.switchToOrthographicFrustum()
    // viewer.scene.fog.enabled = false;

    return viewer;
}

export {
    Cesium,
    getViewer,
    createView
}