import { Cesium, getViewer } from "./index.js";
import './box.js';

const viewer = await getViewer();

/**
 * 添加事件有两种方式：
 * 1、实例化一个新的ScreenSpaceEventHandler对象，在此对象上添加事件监听
 * 2、直接用viewer.screenSpaceEventHandler
 * 
 * 区别：
 * 若使用第二种，需要注意，Viewer内部使用screenSpaceEventHandler已经监听了LEFT_CLICK和LEFT_DOUBLE_CLICK
 * LEFT_CLICK用来选择对象（对应selectedEntity）；LEFT_DOUBLE_CLICK用来track对象（对应trackedEntity）
 * 如果覆盖了LEFT_CLICK和LEFT_DOUBLE_CLICK事件，选择对象、跟踪对象不再起作用，
 * 但可以手动设置selectedEntity、trackedEntity
 */
let handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
handler = viewer.screenSpaceEventHandler;

// 描一个轮廓
const silhouette = Cesium.PostProcessStageLibrary.createSilhouetteStage();
silhouette.uniforms.color = Cesium.Color.YELLOW;
silhouette.enabled = false;
viewer.scene.postProcessStages.add(silhouette)

/**
 * 单点事件: { position: Cartesian2 }
 * 移动: { startPosition: Cartesian2, endPosition: Cartesian2 }
 * 其他请参考文档
 * @param {*} event 
 */
handler.setInputAction(e => {
    
    const point = e.position;

    pickPosition(point);

    // 返回的是context.createPickId(object)传进去的参数，即PickId对象中的object属性
    const picked = viewer.scene.pick(point);
    
    /**
     * 待选择的对象，如果有多个instance，每个instance必须设置id，否则无法区分
     * 若无id，picked属性里就只有primitive
     */
    silhouette.enabled = false;
    let pickId; // PickId对象，在context中定义的
    if (picked) {
        if (picked.id) {
            /**
             * 在构建GeometryInstance的时候设置了id（任何类型），则可以这么获取
             * 设置id分两种：
             * 一种是自己创建GeometryInstance设置id；
             * 一种是使用Entity的时候内部updater里程序创建的，id: entity
             * 
             */
            pickId = picked.primitive?.getGeometryInstanceAttributes('box_1'); // 返回的是PickId对象
        }
        
        // 若在构建GeometryInstance的时未设置id，只能这么做，不建议，
        if (picked.primitive?._pickIds?.length) {
            // 需要根据object找到对应的PickId对象
            pickId = picked.primitive._pickIds.find(it => it.object == picked);
        }

        if (pickId) {
            /**
             * 参数必须是PickId对象，在Context定义
             */
            silhouette.selected = [{ pickId }];
            silhouette.enabled = true;

            if (picked.id instanceof Cesium.Entity) {
                viewer.selectedEntity = picked.id;
                viewer.trackedEntity = picked.id;
            }
        }
    }
}, Cesium.ScreenSpaceEventType.LEFT_CLICK);

function pickPosition(point) {
    // 从深度缓存里拿到的原始世界坐标
    // 2D/2.5D和pickPositionWorldCoordinates相差很大
    let worldPos = viewer.scene.pickPosition(point);
    console.log(worldPos);

    // 从深度缓存拿到坐标后会转成基于椭球的ECEF世界坐标
    worldPos = viewer.scene.pickPositionWorldCoordinates(point);
    console.log(worldPos);

    // 拿到椭球上的点，在2D和2.5D模式下，会先拿到世界坐标，再转到椭球上
    const result = viewer.camera.pickEllipsoid(point);
    console.log(result);
}