import { Cesium, getViewer } from "./index.js";
const viewer = await getViewer();
const type = 10;
/**
 * 0 UrlTemplateImageryProvider 基础瓦片数据源
 * 1 TileMapServiceImageryProvider tms数据源
 * 2 WebMapServiceImageryProvider wms数据源
 * 3 WebMapTileServiceImageryProvider wmts数据源 功能和tms类型，都是预切好的瓦片
 * 4 SingleTileImageryProvider 在椭球上渲染一张图片
 * 5 GridImageryProvider 在瓦片上渲染网格
 * 6 MapboxStyleImageryProvider Mapbox使用styleId渲染
 * 7 MapboxImageryProvider Mapbox地图使用mapId渲染
 * 8 BingMapsImageryProvider 必应影像渲染
 * 9 OpenStreetMapImageryProvider openStreet渲染
 * 10 TileCoordinatesImageryProvider 用来再瓦片上渲染瓦片编号
 * 11 ArcGisMapServerImageryProvider arcGis 地图渲染
 * 12 GoogleEarthEnterpriseMetadata 谷歌地图渲染
 * 13 IonImageryProvider 如果构建viewer的时候未设置baseLayer，baseLayer会被赋值为ImageryLayer.fromWorldImagery()，IonImageryProvider
 */




if (type == 0) {

    const options = {
        url: '', // Resource对象或者url字符串
        urlSchemeZeroPadding: { '{x}' : '0000'}, // 补0对齐，如x:12, 会转成0012
        subdomains: ['01', '02'], // 字符串或数组 子域名模板，
        credit: '', // 字符串或者Credit对象 版权或来源声明
        minimumLevel: 0, // lod最小级别
        maximumLevel: undefined, // lod最大级别
        rectangle: Cesium.Rectangle.MAX_VALUE, // 影响覆盖的最大范围 单位是弧度
        tilingScheme: Cesium.WebMercatorTilingScheme, // 切片方案
        ellipsoid: undefined, // 默认wgs84椭球
        tileWidth: 256, // 瓦片宽度 
        tileHeight: 256, // 瓦片高度
        hasAlphaChannel: true, // 是否透明
        /**
         * 捕捉要素需要下面三个参数都配置
         * 数组  GetFeatureInfoFormat对象
         * new GetFeatureInfoFormat(
         *  'json', // type 服务返回数据类型
         *  'json', // format 若不传，会根据type生成， 发送请求的MIME type
         *   callback, // 回调函数，若不传会根据type生成
         * )
         */
        getFeatureInfoFormats: undefined, 
        pickFeaturesUrl: '', // 选择要素请求url
        enablePickFeatures: true, // 是否启用捕捉要素
        tileDiscardPolicy: undefined, // TileDiscardPolicy对象，瓦片丢弃策略
        customTags: undefined, // 数组，自定义模板替换属性
    };
    // 瓦片地图服务，服务端按固定规则（如 256x256 像素 / 瓦片），把地图按不同缩放层级（Level）切割成瓦片，按 “层级 / 行 / 列” 的目录结构存储；
    // 
    const provider = new Cesium.UrlTemplateImageryProvider({
        // 必选：TMS瓦片服务的根地址（本地目录/远程URL）
        // 瓦片目录结构需符合TMS标准：{url}/{z}/{x}/{y}.{fileExtension}
        url: 'https://smap.navinfo.com/gateway/g1n2/smap-raster-map/raster/basemap/tile?specId=902101&ak=083bf01729d43c181ad173a06&layer=navinfo_world&z={z}&x={x}&y={y}', 
        // 必选：瓦片图片的格式（如png/jpg）
        fileExtension: 'png',
        // 可选：瓦片集的最大缩放层级（需和服务端瓦片层级匹配）
        maximumLevel: 10,
        // 可选：瓦片集的最小缩放层级
        minimumLevel: 0,
        // 可选：瓦片覆盖的地理范围（默认全球）
        rectangle: Cesium.Rectangle.fromDegrees(-180, -90, 180, 90),
        // 可选：瓦片的投影坐标系（默认EPSG:4326）
        tilingScheme: new Cesium.GeographicTilingScheme(),
    });

    /**
     * 需要配置以下三个参数才可用
     * getFeatureInfoFormats/enablePickFeatures/pickFeaturesUrl
     */
    // provider.pickFeatures(0, 0, 0, 50, 70)

    // 将TMS图层添加到Cesium视图
    viewer.imageryLayers.addImageryProvider(provider);
}

if (type == 1) {
    const url = 'https://smap.navinfo.com/gateway/g1n2/smap-raster-map/raster/basemap/tile?specId=902101&ak=083bf01729d43c181ad173a06&layer=navinfo_world';
    const options = {
        // 必选：瓦片图片的格式（如png/jpg）
        fileExtension: 'png',
        // 可选：瓦片集的最大缩放层级（需和服务端瓦片层级匹配）
        maximumLevel: 10,
        // 可选：瓦片集的最小缩放层级
        minimumLevel: 0,
        // 可选：瓦片覆盖的地理范围（默认全球）
        rectangle: Cesium.Rectangle.fromDegrees(-180, -90, 180, 90),
        // 可选：瓦片的投影坐标系（默认EPSG:4326）
        tilingScheme: new Cesium.GeographicTilingScheme(),
        // 可选：是否使用高清瓦片（Retina屏适配）
        enablePickFeatures: false
    };
    // 瓦片地图服务，服务端按固定规则（如 256x256 像素 / 瓦片），把地图按不同缩放层级（Level）切割成瓦片，按 “层级 / 行 / 列” 的目录结构存储；
    // 这种方式跟UrlTemplateImageryProvider没有区别，
    // TileMapServiceImageryProvider继承自UrlTemplateImageryProvider
    const tmsProvider = new Cesium.TileMapServiceImageryProvider({
        // 必选：TMS瓦片服务的根地址（本地目录/远程URL）
        // 瓦片目录结构需符合TMS标准：{url}/{z}/{x}/{y}.{fileExtension}
        url: url + '&z={z}&x={x}&y={y}', 
        ...options
    });
    // 这种方式，url需要设置为tilemapresource.xml的地址
    /**
     * 这种方式，url需要设置为tilemapresource.xml的地址
     * tilemapresource.xml是OGC TMS 1.0.0 标准中明确规定的核心元数据文件
     *  <?xml version="1.0" encoding="UTF-8"?>
        <TileMap version="1.0.0" tilemapservice="http://tms.osgeo.org/1.0.0">
        <!-- 瓦片集唯一标识 -->
        <Title>自定义TMS瓦片集（中国区域）</Title>
        <!-- 瓦片集覆盖的地理范围（经纬度） -->
        <BoundingBox minx="70" miny="10" maxx="140" maxy="55"/>
        <!-- 瓦片投影坐标系（TMS标准常用EPSG:4326或EPSG:3857） -->
        <SRS>EPSG:4326</SRS>
        <!-- 单张瓦片的像素尺寸（TMS标准默认256x256） -->
        <TileFormat width="256" height="256" mime-type="image/png" extension="png"/>
        <!-- 瓦片缩放层级范围 -->
        <TileSets profile="global-geodetic">
        <!-- href: 该层级的瓦片目录名（相对路径,{TMS根目录}/0/{x}/{y}.png）units-per-pixel: 该层级1像素对应的地理单（度/米）order: 层级排序 -->
            <TileSet href="0" units-per-pixel="0.703125" order="0"/>
            <TileSet href="1" units-per-pixel="0.3515625" order="1"/>
            <TileSet href="10" units-per-pixel="0.0006866455078125" order="10"/>
        </TileSets>
        </TileMap>
     */
    // const tmsProvider = Cesium.TileMapServiceImageryProvider.fromUrl(url, options);
    // 将TMS图层添加到Cesium视图
    viewer.imageryLayers.addImageryProvider(tmsProvider);
}

if (type == 2) {
    const ops = {
        url: '',
        // 图层名称，以逗号隔开
        layers: 'OSM-WS',
        // GetMap参数
        parameters: {
            format: 'image/png', // 默认 ‘image/jpeg
            request: 'GetMap', // 默认 GetMap
            transparent: true,
            style: '', // 默认 ’‘
            version: '1.1.1' // 默认1.1.1
        },
        // GetFeatureInfo 参数
        getFeatureInfoParameters: {
            service: "WMS",
            version: "1.1.1",
            request: "GetFeatureInfo",
        },
        getFeatureInfoUrl: '',
        enablePickFeatures: true, // 默认 true
        // GetFeatureInfo设置请求以及返回数据格式
        getFeatureInfoFormats: Cesium.WebMapServiceImageryProvider.DefaultGetFeatureInfoFormats,
        rectangle: Cesium.Rectangle.MAX_VALUE,
        tilingScheme: new Cesium.GeographicTilingScheme(),
        srs: '', // wms1.1.1/1.1.0 若未设置，且tilingScheme.projection 为WebMercatorProjection，值为EPSG:3857，否则为EPSG:4326
        crs: '', // wms1.3.0 若未设置，且tilingScheme.projection 为WebMercatorProjection，值为EPSG:3857，否则为CRS:84
        tileWidth: 256, // 瓦片宽度 
        tileHeight: 256, // 瓦片高度
        subdomains: ['01', '02'], // 字符串或数组 子域名模板，
        credit: '', // 字符串或者Credit对象 版权或来源声明
        minimumLevel: 0, // lod最小级别
        maximumLevel: undefined, // lod最大级别
        times: undefined, // TimeIntervalCollection对象 用于对接支持时间维度的 WMS 服务（WMS-T，Web Map Service-Time，向WMS服务端传递时间筛选条件，让服务端返回指定时间/时间区间的动态地理影像（而非静态影像），实现 “按时间播放 / 切换地图影像” 的效果
        clock: undefined, // Clock对象，times设置时，必须设置
    }
    /**
     * WMS没有预先生成的瓦片文件，而是客户端（如 Cesium）发送包含 “地理范围、投影、图层名、图片格式” 等参数的请求后，
     * 服务端动态计算并生成一张对应范围的影像图片返回；
     * wms 1.1.1 坐标系参数名用srs，轴序：经度 纬度 bbox:minx, miny, maxx, maxy（最小经度、最小纬度、最大经度、最大纬度）
     * wms 1.3.0 坐标系参数名用crs 轴序：纬度 经度 bbox:miny, minx, maxy, maxx（最小纬度、最小经度、最大纬度、最大经度）
     * CRS（Coordinate Reference System）
     * SRS（Spatial Reference System）
     * 
     * 内部也是实例化了一个UrlTemplateImageryProvider对象负责请求
     */
    const wmsImageryProvider = new Cesium.WebMapServiceImageryProvider({
        // WMS服务的基础地址（公开测试服务，可直接访问）
        url: 'https://ows.terrestris.de/osm/service',
        // 必选：要请求的WMS图层名（需和服务端配置一致）
        layers: 'OSM-WMS',
        // 可选：WMS请求参数（遵循WMS 1.3.0标准）
        parameters: {
            format: 'image/png', // 返回的影像格式（png/jpeg等）
            transparent: true, // 是否透明（叠加底图时常用）
            version: '1.1.1' // WMS协议版本（建议指定，避免兼容问题）
        },
        srs: 'EPSG:4326', // 坐标系（WMS 1.3.0用crs，1.1.1/1.1.0用srs）
        // 可选：图层覆盖的地理范围（默认全球）
        // rectangle: Cesium.Rectangle.fromDegrees(-180, -90, 180, 90),
        // 可选：最大/最小缩放级别
        maximumLevel: 18,
        minimumLevel: 0
    });

    // 将WMS图层添加到Cesium视图中
    viewer.imageryLayers.addImageryProvider(wmsImageryProvider);

}

if (type == 3) {
    const shadedRelief1 = new Cesium.WebMapTileServiceImageryProvider({
        url : 'https://basemap.nationalmap.gov/arcgis/rest/services/USGSShadedReliefOnly/MapServer/WMTS',
        layer : 'USGSShadedReliefOnly',
        style : 'default',
        format : 'image/jpeg',
        tileMatrixSetID : 'default028mm',
        // tileMatrixLabels : ['default028mm:0', 'default028mm:1', 'default028mm:2' ...],
        maximumLevel: 19,
        credit : new Cesium.Credit('U. S. Geological Survey')
    });
    viewer.imageryLayers.addImageryProvider(shadedRelief1);
}

if (type == 4) {
    // 加载一张完整的单张图片作为整个地理范围的影像图层，而非由多个分块瓦片（tile）拼接而成的影像。
    const provider = new Cesium.SingleTileImageryProvider({
        url: './Tests/images/WechatIMG2504.jpg',
        tileWidth: 256, // 必填 没提供默认值
        tileHeight: 256, // 必填 没提供默认值
        rectangle: Cesium.Rectangle.fromDegrees(
            70, 10,
            140, 55
        )
    });
    
    viewer.imageryLayers.addImageryProvider(provider);
   
}

if (type == 5) {
    /**
     * 给瓦片渲染边框，边框渲染使用的canvas
     */
    const gridProvider = new Cesium.GridImageryProvider({
        // tilingScheme: new Cesium.GeographicTilingScheme(),
        // ellipsoid: Cesium.Ellipsoid.default,
        cells: 8, // 一个瓦片有几个格子
        color: new Cesium.Color(1.0, 1.0, 1.0, 0.4),
        glowColor: new Cesium.Color(0.0, 1.0, 0.0, 0.05),
        glowWidth: 6,
        backgroundColor: new Cesium.Color(0.0, 0.5, 0.0, 0.2),
        tileWidth: 256,
        tileHeight: 256,
        canvasSize: 256,
    });

    viewer.imageryLayers.addImageryProvider(gridProvider);
}

if (type == 6) {
    /**
     * Mapbox Style
     * 内部也是实例化了一个UrlTemplateImageryProvider对象
     */
    var layer = new Cesium.MapboxStyleImageryProvider({
        url:'https://api.mapbox.com/styles/v1',
        username:'nowsilence',
        styleId: 'cjyxrkx3g361d1cqozci0c6hy', // "streets-v11","outdoors-v11", "light-v10", "dark-v10", "satellite-v9", "msatellite-streets-v11",
        accessToken: 'pk.eyJ1Ijoibm93c2lsZW5jZSIsImEiOiJjanh2ZXFkZ2YwNDc4M2NvYzNwdWc2cGRiIn0.VbsFYhiH15bbdI9IW1-VbQ',
        scaleFactor:true,
        tilesize: 512, // 默认是512
        // credit: '', // 字符串或者Credit对象 版权或来源声明
        // minimumLevel: 0, // lod最小级别
        // maximumLevel: undefined, // lod最大级别
        // rectangle: Cesium.Rectangle.MAX_VALUE, // 影响覆盖的最大范围 单位是弧度
    });

    viewer.imageryLayers.addImageryProvider(layer);
}

if (type == 7) {
    /**
     * mapId, 个人理解为 用户名.tileset名称
     * "mapbox.satellite",
        "mapbox.streets",
        "mapbox.streets-basic",
        "mapbox.light",
        "mapbox.streets-satellite",
        "mapbox.wheatpaste",
        "mapbox.comic",
        "mapbox.outdoors",
        "mapbox.run-bike-hike",
        "mapbox.pencil",
        "mapbox.pirates",
        "mapbox.emerald",
        "mapbox.high-contrast",
     * tileset名称并不是styleId
     * 内部也是实例化了一个UrlTemplateImageryProvider对象
     */
    const mapbox = new Cesium.MapboxImageryProvider({
        // mapId: 'mapbox.mapbox-terrain-v2', 
        mapId: 'mapbox.mapbox-streets-v8',
        // mapId: 'mapbox.satellite',
        // mapId: 'mapbox.mapbox-bathymetry-v2',
        // mapId: 'mapbox.mapbox-terrain-dem-v1',
        // mapId: 'mapbox.terrain-rgb',
        accessToken: 'pk.eyJ1Ijoibm93c2lsZW5jZSIsImEiOiJjanh2ZXFkZ2YwNDc4M2NvYzNwdWc2cGRiIn0.VbsFYhiH15bbdI9IW1-VbQ',
        // format: 'png',
        // credit: '', // 字符串或者Credit对象 版权或来源声明
        // minimumLevel: 0, // lod最小级别
        // maximumLevel: undefined, // lod最大级别
        // rectangle: Cesium.Rectangle.MAX_VALUE, // 影响覆盖的最大范围 单位是弧度
    });

    viewer.imageryLayers.addImageryProvider(mapbox);
}

if (type == 8) {
    var bingStyle = [
      Cesium.BingMapsStyle.AERIAL_WITH_LABELS,
      Cesium.BingMapsStyle.COLLINS_BART,
      Cesium.BingMapsStyle.CANVAS_GRAY,
      Cesium.BingMapsStyle.CANVAS_LIGHT,
      Cesium.BingMapsStyle.CANVAS_DARK,
      Cesium.BingMapsStyle.ORDNANCE_SURVEY,
      Cesium.BingMapsStyle.ROAD,
      Cesium.BingMapsStyle.AERIAL,
    ];
    var bingMapProvider = new Cesium.BingMapsImageryProvider({
        url: "Bing Maps Documentation - Bing Maps", //’'Bing Maps Documentation - Bing Maps',
        key: "AmXdbd8UeUJtaRSn7yVwyXgQlBBUqliLbHpgn2c76DfuHwAXfRrgS5qwfHU6Rhm8",
        mapStyle: bingStyle[7],
        });
    viewer.imageryLayers.addImageryProvider(bingMapProvider);
}

if (type == 9) {
    var osm = new Cesium.OpenStreetMapImageryProvider({
      url: "https://tile.openstreetmap.org",
      minimumLevel: 0,
      maximumLevel: 18,
      fileExtension: "png",
    });
    viewer.imageryLayers.addImageryProvider(osm);
}

if (type == 10) {
    viewer.imageryLayers.addImageryProvider(new Cesium.TileCoordinatesImageryProvider());
}

if (type == 11) {
    var arcgisProvider = new Cesium.ArcGisMapServerImageryProvider({
        url:"ChinaOnlineStreetPurplishBlue (MapServer)",
    });
    imageryLayers.addImageryProvider(arcgisProvider);
}

if (type == 12) {
    var geeMetadata = new Cesium.GoogleEarthEnterpriseMetadata(
      "http://www.earthenterprise.org/3d"
    );
    var googleEarthProvider = new Cesium.GoogleEarthEnterpriseImageryProvider({
        metadata: geeMetadata,
        });
    imageryLayers.addImageryProvider(googleEarthProvider);
}

if (type == 13) {
    // cesium Ion 在线服务，默认全局基础图像图层（当前为Bing Maps）。
    /**
     * 如果为定义baseLayer，那么会赋默认值：ImageryLayer.fromWorldImagery(); 使用的是IonImageryProvider
     */
    viewer.imageryLayers.addImageryProvider(
      new Cesium.IonImageryProvider({ assetId: 3954 })
    );
}