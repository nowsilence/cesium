import { Cesium, getViewer } from "./index.js";
const viewer = await getViewer();
// 如果不置为true，如果两点时间跨度较大，看不到效果
viewer.clock.shouldAnimate = true;

/**
 * Entity的 position 必须是时间动态位置, 
 * Cesium.SampledPositionProperty:采样位置属性，
 * Cesium.CallbackProperty回调属性
 */


// 定义轨迹的时间范围（轨迹只在该时间段内生效）
const startTime = Cesium.JulianDate.fromIso8601("2026-01-14T00:00:00Z");
const stopTime = Cesium.JulianDate.fromIso8601("2026-01-14T00:05:10Z");
const timeInterval = new Cesium.TimeInterval({ start: startTime, stop: stopTime });
viewer.clock.startTime = startTime.clone();
viewer.clock.stopTime = stopTime.clone();
viewer.clock.currentTime = startTime.clone();
viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP; // 播放到结束时间后停止
viewer.clock.multiplier = 10; // 播放速度倍率（1=实时速度，越大越快）


// 创建【采样动态位置】- 核心：带时间的位置集合
const positionProperty = new Cesium.SampledPositionProperty();
// 添加多个「时间+位置」采样点，实体将按时间顺序移动，轨迹自动连接这些点
positionProperty.addSample(startTime, Cesium.Cartesian3.fromDegrees(116.40, 39.90, 1000)); // 北京，1000米高
positionProperty.addSample(Cesium.JulianDate.addSeconds(startTime, 200, new Cesium.JulianDate()), Cesium.Cartesian3.fromDegrees(31.47, 31.23, 1000)); // 上海，1000米高
positionProperty.addSample(stopTime, Cesium.Cartesian3.fromDegrees(14.05, 22.54, 1000)); // 深圳，1000米高


viewer.entities.add({
    availability: new Cesium.TimeIntervalCollection([timeInterval]), // 控制可用时间范围
    position: positionProperty, // 必须：动态位置
    // position: new Cesium.CallbackProperty(function (time) {
    //     // 自定义运动逻辑：比如绕北京做圆周运动
    //     const lng = 116.40 + Math.sin(Cesium.JulianDate.secondsDifference(time, startTime)/100) * 2;
    //     const lat = 39.90 + Math.cos(Cesium.JulianDate.secondsDifference(time, startTime)/100) * 2;
    //     return Cesium.Cartesian3.fromDegrees(lng, lat, 2000);
    // }, false),
    orientation: new Cesium.VelocityOrientationProperty(positionProperty), // 可选：让实体朝向运动方向
    // 实体样式：比如飞点/飞机模型
    point: {
        pixelSize: 28,
        color: Cesium.Color.BLUE,
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 2
    },
    path: {
        resolution: 1, //  轨迹精度：单位 秒，值越小轨迹越平滑，默认1，一般不用改
        // material: new Cesium.PolylineGlowMaterialProperty({ // 轨迹样式：发光线
        //     glowPower: 0.1, // 发光强度，0~1
        //     color: Cesium.Color.YELLOW.withAlpha(0.8) // 轨迹颜色+透明度
        // }),
        width: 5, // 轨迹线宽度
        // 超前绘制：实体还没走到的位置，提前绘制轨迹，单位秒，默认0
        leadTime: 0,
        // 轨迹留存时间【核心】：单位 秒
        //trailTime: 0, // → 只显示当前实体位置，无轨迹
        trailTime: 60, // → 保留实体过去60秒走过的轨迹
        //trailTime: Infinity; // → 永久保留全部轨迹（历史路径永不消失，最常用）
        // distanceDisplayCondition: new Cesium.DistanceDisplayCondition(1, 10000000), //0.0
    }
});


viewer.zoomTo(viewer.entities);
