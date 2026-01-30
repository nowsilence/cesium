import { Cesium, getViewer } from "./index.js";
const viewer = await getViewer();

const controller = viewer.scene.screenSpaceCameraController


controller.enableInputs = true; // 默认 true 是否接收鼠标或者触摸或者键盘事件输入
controller.enableCollisionDetection = true; // 默认true 是否开启相机碰撞检测（避免相机钻入地形 / 模型内部）
controller.enableLook = true; // 默认 true 按住shift键，可以调整相机的方向，仅只对3D、2.5D（2D无效）
controller.enableRotate = true; // 默认true 只针对3D/2D 控制是否可以绕球运动（移动地图） 2.5D无效, 2D: 要想起作用，scene.mapMode2D必须为MapMode.ROTATE
controller.enableZoom = true; // 默认 true 是否启用地图缩放
controller.enableTranslate = true; // 默认 true 地图是否可以平移 只对2D、2.5D有效
controller.enableTilt = true; // 默认 true 3D 控制是否可以旋转、俯仰 2.5D 控制地图是否可以旋转（2D无效）

// inertia
/**
 * 惯性
 * 范围[0, 1) 0 表示没有惯性，越接近1惯性越大
 */
controller.inertiaSpin = 0.9;
controller.inertiaTranslate = 0.9;
controller.inertiaZoom = 0.8;

/**
 * 范围[0, 1)
 * 限制单帧相机运动幅度,通过移动的距离与宽或高的百分比约束用户输入（平移、旋转、缩放、倾斜等）触发的相机行为，
 * 避免低帧率场景下相机失控（地图瞬间移动一大段距离）。
 */
controller.maximumMovementRatio = 0.1;
/**
 * 回弹动画时间设置，单位：秒
 * 在2.5D模式下，当地图一半以上除以屏幕外，松手会回弹回来
 */
controller.bounceAnimationTime = 3.0

/**
 * enableCollisionDetection为true时，设置有效
 * 相机缩放时，其位置相对于椭球的幅值（距离）不能小于该值
 * 限制相机最小缩放距离，同时结合地形 / 模型碰撞检测，避免相机钻入地表；
 */
controller.minimumZoomDistance = 1.0;
controller.maximumZoomDistance = Number.POSITIVE_INFINITY;
/**
 * 缩放速度的一个乘数，用来控制缩放速度
 */
controller.zoomFactor = 5.0;

/**
 * 拾取目标切换
 * 当相机高度高于该值时，拾取（pick）操作优先匹配「椭球理论表面」；
 * 当相机高度低于该值时，拾取操作切换为优先匹配「实际地形 / 3D 模型等场景内容」，核心目的是平衡拾取精度与性能
 */
controller.minimumPickingTerrainHeight = Ellipsoid.WGS84.equals(ellipsoid)
    ? 150000.0
    : ellipsoid.minimumRadius * 0.025;
/**
 * 带惯性的缩放操作的地形拾取/碰撞检测最小距离阈值（单位：米），
 * 仅在缩放松手后相机因inertiaZoom继续缩放的过程中生效，
 * 核心目的是避免惯性缩放导致相机钻入地形，平衡缩放流畅性与地形碰撞防护。
 */
controller.minimumPickingTerrainDistanceWithInertia = Ellipsoid.WGS84.equals(ellipsoid)
    ? 4000.0
    : ellipsoid.minimumRadius * 0.00063;
/**
 * 仅当相机相对椭球的高度高于该值时，相机的俯仰等操作会基于椭球面
 * 低于该值时，碰撞检测基于地形
 */
controller.minimumCollisionTerrainHeight = Ellipsoid.WGS84.equals(ellipsoid)
    ? 15000.0
    : ellipsoid.minimumRadius * 0.0025;
/**
 * 当相机相对椭球的高度高于该值时，点击/拖拽「天空/太空区域」（无地形/模型的区域）会从「轨迹球旋转模式」切换为「自由视角模式」；
 * 低于该值时则保持轨迹球模式，核心目的是适配不同高度下的相机操作逻辑（低空绕球旋转、高空自由视角）。
 * TackBall，并非自身旋转，而是绕一个点旋转
 */
controller.minimumTrackBallHeight = Ellipsoid.WGS84.equals(ellipsoid)
    ? 7500000.0
    : ellipsoid.minimumRadius * 1.175;