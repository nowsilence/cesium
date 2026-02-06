import { Cesium, getViewer } from "./index.js";
const viewer = await getViewer();

const czmlPath = "./Apps/SampleData/Cesium3DTiles/Tilesets/TilesetWithViewerRequestVolume/tileset.json";

const tileset = await Cesium.Cesium3DTileset.fromUrl(czmlPath, {
    cacheBytes: 536870912, // 默认加载最大大小，单位字节，536870912B=512M
    maximumScreenSpaceError: 16, // 最大屏幕误差 单位：像素/米 用来控制根节点是否渲染，通过根节点的几何误差计算根节点的实时屏幕误差
});
viewer.scene.primitives.add(tileset);


viewer.scene.camera.flyTo({
    destination: Cesium.Cartesian3.fromRadians(-1.3197209591796106,0.6988424218, 100)
})


