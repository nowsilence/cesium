import { Cesium, getViewer } from "./index.js";
const viewer = await getViewer();

const model = new Cesium.Model({
    minimumPixelSize: 0, // 无论缩放，最小像素大小
    silhouetteColor: Cesium.Color.RED, // 描边颜色 透明度为0也不描边
    silhouetteSize: 0, // 描边大小， 0 不描边
    clippingPlanes: undefined, // ClippingPlaneCollection对象
    clippingPolygons: undefined, // ClippingPolygonCollection
    projectTo2D: false, // 在切换到2D/CV模式下，是否要投影到2D，会提前生成一份2d/CV顶点数据放到内存，故会增加内存的使用
})
