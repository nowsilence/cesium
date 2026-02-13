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
    
    // 返回的是ECEF坐标系下的世界坐标，如果是2D地图，会先转成经纬度坐标，再转回ECEF
let worldPos = viewer.scene.pickPosition(point);
    console.log(worldPos);

    // 2D/2.5D和pickPositionWorldCoordinates相差很大
    worldPos = viewer.scene.pickPositionWorldCoordinates(point);
    console.log(worldPos);

    // 拿到椭球上的点，在2D和2.5D模式下，会先拿到世界坐标，再转到椭球上
    const result = viewer.camera.pickEllipsoid(point);
    console.log(result);
}

//## scene.pickPositionWorldCoordinates
/**
 * @param {Cartesian2} windowPosition 屏幕坐标
 * @param {Cartesian3} [result] 结果容器
 * @returns {Cartesian3} 返回的是所在场景的世界坐标，2D和3D世界坐标系不同
 */

//## scene.pickPosition
/**
 * @param {Cartesian2} windowPosition 屏幕坐标
 * @param {Cartesian3} [result] 结果容器
 * @returns {Cartesian3} 返回的是ECEF坐标系下的世界坐标，如果是2D地图，会先转成经纬度坐标，再转回ECEF
 */

//## scene.pick
/**
 * @param {Cartesian2} windowPosition 屏幕坐标
 * @param {number} [width=3] 拾取的矩形宽度 单位 像素
 * @param {number} [height=3] Height of the pick rectangle.
 * @returns {Object | undefined} 
 */

//## scene.drillPick
/**
 * 穿透拾取
 * @param {Cartesian2} windowPosition 屏幕坐标
 * @param {number} [limit] 拾取结果上限
 * @param {number} [width=3] 拾取的矩形宽度 单位 像素
 * @param {number} [height=3] 拾取的矩形高度 单位 像素
 * @returns {any[]} Array of objects, each containing 1 picked primitives.
 *
 */

//## scene.pickFromRay
/**
 * @param {Ray} ray 射线
 * @param {Object[]} [objectsToExclude] 排除对象 primitives, entities, or 3D Tiles features
 * @param {number} [width=0.1] 相交体的宽度 单位 米
 * @returns {object | undefined} 
 */

//## scene.drillPickFromRay
/**
 * @param {Ray} ray 射线
 * @param {number} [limit=Number.MAX_VALUE] 拾取的最大结果数
 * @param {Object[]} [objectsToExclude] 排除对象 primitives, entities, or 3D Tiles features
 * @param {number} [width=0.1] 相交体的宽度 单位 米
 * @returns {object | undefined} 
 */

//## scene.pickFromRayMostDetailed
/**
 * MostDetailed主要是针对3DTileset，会加载最细节程度最高的瓦片
 * 异步方法，无穿透
 * @param {Ray} ray 射线
 * @param {Object[]} [objectsToExclude] 排除对象 primitives, entities, or 3D Tiles features
 * @param {number} [width=0.1] 相交体的宽度 单位 米
 * @returns {Promise<object>}
 */

//## scene.drillPickFromRayMostDetailed
/**
 * MostDetailed主要是针对3DTileset，会加载最细节程度最高的瓦片
 * 异步方法，无穿透
 * @param {Ray} ray 射线
 * @param {number} [limit=Number.MAX_VALUE] 拾取的最大结果数
 * @param {Object[]} [objectsToExclude] 排除对象 primitives, entities, or 3D Tiles features
 * @param {number} [width=0.1] 相交体的宽度 单位 米
 * @returns {Promise<Object[]>} 
 */

//## scene.getHeight
/**
 * 获取已经加载的地形或者3DTile的高度
 * 私有方法
 * @param {Cartographic} cartographic 位置
 * @param {HeightReference} [heightReference=CLAMP_TO_GROUND]
 */

//## scene.sampleHeight
/**
 * 只采样当前渲染了的globe tiles and 3D Tiles，其他的primitive，不管是否可见都会采样
 * @param {Cartographic} position 采样位置
 * @param {Object[]} [objectsToExclude] 排除对象
 * @param {number} [width=0.1] 采样范围宽度 单位米
 * @returns {number | undefined}
 */

//## scene.clampToHeight
/**
 * 与sampleHeight类似
 * 吸附到已经渲染了的globe tiles and 3D Tiles，其他的primitive，不管是否可见都会吸附
 * @param {Cartographic} position 采样位置
 * @param {Object[]} [objectsToExclude] 排除对象
 * @param {number} [width=0.1] 采样范围宽度 单位米
 * @returns {Cartesian3 | undefined} 
 */

//## scene.sampleHeightMostDetailed
/**
 * 与sampleHeight类似，只不过会等待3DTile加载到细节程度最高，返回值是个数组
 * 只采样当前渲染了的globe tiles and 3D Tiles，其他的primitive，不管是否可见都会采样
 * @param {Cartographic} position 采样位置
 * @param {Object[]} [objectsToExclude] 排除对象
 * @param {number} [width=0.1] 采样范围宽度 单位米
 * @returns {Promise<Array<Cartographic | undefined>>}
 */

//## scene.clampToHeightMostDetailed
/**
 * 与clampToHeight类似，只不过会等待3DTile加载到细节程度最高，返回值是个数组
 * 吸附到已经渲染了的globe tiles and 3D Tiles，其他的primitive，不管是否可见都会吸附
 * @param {Cartographic} position 采样位置
 * @param {Object[]} [objectsToExclude] 排除对象
 * @param {number} [width=0.1] 采样范围宽度 单位米
 * @returns {Promise<Array<Cartographic | undefined>>}
 */