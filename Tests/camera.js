import { Cesium, getViewer } from "./index.js";
const viewer = await getViewer();

// 相机看向的点，以此点为原点创建坐标系
const target = Cesium.Cartesian3.fromDegrees(116, 39, 0);
const transform = Cesium.Transforms.eastNorthUpToFixedFrame(target);
// 相机相对于原点的偏移量，这个偏移量是在transform坐标下的值
const offset = new Cesium.Cartesian3(0, 0, 1000)

/**
 * 将相机始终看向target，只能绕点旋转 和缩放
 * 若要恢复地图拖拽，则需要viewer.camera.setView({ endTransform: Cesium.Matrix4.IDENTITY });
 */
viewer.camera.lookAt(target, offset);
// lookAt里面就是调用的lookAtTransform方法，lookAt默认使用ENU坐标系
viewer.camera.lookAtTransform(transform, offset);

{

}

//## setView
{
    let options = getOptions(0);
    /**
     * @param {Cartesian3|Rectangle} [options.destination] 点或者矩形，相机的位置，若为矩形，则调整相机位置使其能完整看到矩形范围，世界坐标系的位置
     * @param {HeadingPitchRollValues|DirectionUp} [options.orientation] HeadingPitchRollValues：{ heading, pitch, roll } 直接赋值或HeadingPitchRoll构建，
     * DirectionUp：{ direction, up }，通过direction、up计算出HeadingPitchRollValues：
     * @param {Matrix4} [options.endTransform] 相机所在的坐标系 Transform matrix representing the reference frame of the camera.
     * @param {boolean} [options.convert = true]  默认destination为ECEF坐标，当地图为2D或者2.5D会转到对应坐标系下，若在2D、2.5D模式下，设置的坐标就是对应坐标系下的坐标则需要设置为false
     * 
     * 如果说之前已经设置了orientation，然后去修改transform则重新定位的视口相机俯仰旋转不变，也就是在局部坐标系下的相机姿态不变，变的只是在世界坐标下的矩阵
     */
    viewer.camera.setView(options); // 一般经过lookAt之后要把transform置为Identity，否则会出现意想不到的效果
}

//## flyTo
{
    const destination = Cesium.Cartesian3.fromDegrees(116, 39, 1000);
    const orientation = Cesium.HeadingPitchRoll.fromDegrees(0, -90, 0);

    const ops = {
        destination, // 必选 和setView相同
        orientation, // 可选 与setView相同
        endTransform: transform, // 可选 跟setView相同
        convert: undefined, // 默认true 和setView相同
        /**
         * 若值<=0，则内部会调用setView来定位，
         * 若未定义，会根据相机到目标点的距离计算时间：Math.ceil(Cartesian3.distance(camera.position, destination) / 1000000.0) + 2.0
         * 最多为3秒：duration = Math.min(duration, 3.0);  
         * 可选 
         **/ 
        duration: undefined, 
        complete: () => { // 可选
            console.log('动画结束');
        },
        cancel: () => { // 可选
            console.log('动画取消');
        },
        /**
         * 可选 缓动函数
         * 根据相机到地面的高度不同有不同的默认函数
         * if (startHeight > endHeight && startHeight > 11500.0) {
         *     easingFunction = EasingFunction.CUBIC_OUT;
         * } else {
         *     easingFunction = EasingFunction.QUINTIC_IN_OUT;
         * }
         */
        easingFunction: undefined,
        /**
         * 可选 
         * 3D、2.5D场景有使用到，
         * 未设置内部会自动计算，相机会先缩放到maximumHeight这个高度然后再缩放到终点高度
         */
        maximumHeight: undefined,
        /**
         * 可选 
         * 相机必须飞越的经度线
         * 场景：实现 “从北京飞纽约，强制飞经 180° 经线，且飞行过程中先抬升高度再缓慢下降，俯仰角随高度调整” 的定制化飞行；
         */
        flyOverLongitude: undefined,
        /**
         * 可选 
         * 一个权重，内部会判断短路径的距离 < 长路径的距离 * 权重
         * 若经过飞越经度的路径更短（按权重）且飞越经度不在区间内，绕远路
         */
        flyOverLongitudeWeight: undefined,
        /**
         * 可选 
         * 若未设置，起点和终点的pitch就直接线性差值
         * 若设置了pitch插值要结合实时高度
         */
        pitchAdjustHeight: undefined,
    }

    viewer.camera.flyTo(ops);

    // 取消fly动画，相机就停在当前位置
    // viewer.camera.cancelFlight();
    // 取消fly动画，相机停在destination位置
    // viewer.camera.completeFlight();
}

//## viewBoundingSphere  flyToBoundingSphere
{
    /**
     * 查看包围球，内部是用的东北天坐标系，所以是轨迹球操作模式
     */
    const destination = Cesium.Cartesian3.fromDegrees(116, 39, 1000);
    const sphere = new Cesium.BoundingSphere(destination, 1000);
    const orientation = Cesium.HeadingPitchRoll.fromDegrees(0, -90, 0);
    // pitch/heading在在东北天坐标系下的值
    const offset = new Cesium.HeadingPitchRange(orientation.heading, orientation.pitch, 1000);

    /**
     * offset 若未定义，pitch = PI/4, heading = 0， 距离自动计算，
     * 若offset定义了，offset.range未定义或者是0，则自定计算距离
     */
    viewer.camera.viewBoundingSphere(sphere, offset);

    viewer.camera.flyToBoundingSphere(sphere, {
        offset,
        /**
         * 若值<=0，则内部会调用setView来定位，
         * 若未定义，会根据相机到目标点的距离计算时间：Math.ceil(Cartesian3.distance(camera.position, destination) / 1000000.0) + 2.0
         * 最多为3秒：duration = Math.min(duration, 3.0);  
         * 可选 
         **/ 
        duration: undefined, 
        complete: () => { // 可选
            console.log('动画结束');
        },
        cancel: () => { // 可选
            console.log('动画取消');
        },
        /**
         * 可选 缓动函数
         * 根据相机到地面的高度不同有不同的默认函数
         * if (startHeight > endHeight && startHeight > 11500.0) {
         *     easingFunction = EasingFunction.CUBIC_OUT;
         * } else {
         *     easingFunction = EasingFunction.QUINTIC_IN_OUT;
         * }
         */
        easingFunction: undefined,
        /**
         * 可选 
         * 3D、2.5D场景有使用到，
         * 未设置内部会自动计算，相机会先缩放到maximumHeight这个高度然后再缩放到终点高度
         */
        maximumHeight: undefined,
        /**
         * 可选 
         * 相机必须飞越的经度线
         * 场景：实现 “从北京飞纽约，强制飞经 180° 经线，且飞行过程中先抬升高度再缓慢下降，俯仰角随高度调整” 的定制化飞行；
         */
        flyOverLongitude: undefined,
        /**
         * 可选 
         * 一个权重，内部会判断短路径的距离 < 长路径的距离 * 权重
         * 若经过飞越经度的路径更短（按权重）且飞越经度不在区间内，绕远路
         */
        flyOverLongitudeWeight: undefined,
        /**
         * 可选 
         * 若未设置，起点和终点的pitch就直接线性差值
         * 若设置了pitch插值要结合实时高度
         */
        pitchAdjustHeight: undefined,
    })
}


function getOptions() {
    /**
     * pitch是相机方向与xz平面的夹角，正则看向xy平面上方，负数看下下方，相当于相机在destination的位置上下抬头低头
     */
    // const orientation = Cesium.HeadingPitchRoll.fromDegrees(0, -90, 0);
    const destination = Cesium.Cartesian3.fromDegrees(116, 39, 1000);
    const endTransform = Cesium.Matrix4.IDENTITY;
    const rectangle = Cesium.Rectangle.fromDegrees(114, 38, 116, 40);

    // 这个只是个例子，计算的是相机的朝向和上方向，当然这个地方计算的是相机向下，
    const surfacePos = Cesium.Ellipsoid.WGS84.scaleToGeodeticSurface(destination);
    const direction = Cesium.Ellipsoid.WGS84.geodeticSurfaceNormal(surfacePos);
    Cesium.Cartesian3.negate(direction, direction);
    const up = Cesium.Cartesian3.cross(direction, Cesium.Cartesian3.UNIT_Z, new Cesium.Cartesian3())
    Cesium.Cartesian3.cross(up, direction, up);
    const orientation = {
        direction,
        up
    };
    return {
        endTransform,
        orientation,
        destination,
        // destination: rectangle
    };
}

//## 坐标转换
{
    const pos = new Cesium.Cartesian3.fromDegrees(116, 39, 0);
    const v4 = new Cesium.Cartesian4(pos.x, pos.y, pos.z, 1);
    const result = new Cesium.Cartesian3();
    const result4 = new Cesium.Cartesian4();

    // 点：代表空间中的一个具体位置
    // 向量：只有大小和方向，没有位置

    // ## 世界坐标转局部坐标系（camera.transform所代表的坐标系，通常为某一点的东北天坐标系）
    // 点 从世界坐标转到局部坐标系
    camera.worldToCameraCoordinatesPoint(pos, result);
    // 点或向量 从世界坐标转到局部坐标系，传入/传出参数类型是Cartesian4，若v4.w=1,则和worldToCameraCoordinatesPoint结果一样
    camera.worldToCameraCoordinates(v4, result4);
    // 向量 由世界坐标系转到本地坐标系，比如将方向、法线转到局部坐标系，向量没有位置只有方向和大小
    camera.worldToCameraCoordinatesVector(pos, result);

    // ## 局部坐标系转世界坐标系
    // 点 从局部坐标系转到世界坐标系
    camera.cameraToWorldCoordinatesPoint(result, pos);
    // 点或向量 从局部坐标系转到世界坐标系
    camera.worldToCameraCoordinates(result4, v4);
    // 向量 参考worldToCameraCoordinatesVector
    camera.cameraToWorldCoordinatesVector(result, pos);
}

// ## 视图转换
{
    viewer.camera.switchToPerspectiveFrustum();
    viewer.camera.switchToOrthographicFrustum();
}

//## 其他
{
    // 计算视口范围内椭球面的显示范围
    viewer.camera.computeViewRectangle();

    // 以下都是在局部坐标系下的相机direction、up、right方向上的移动

    // 放大，参数单位米
    viewer.camera.zoomIn(100);
    // 缩小，延视线方向远离 单位米
    viewer.camera.zoomOut(100);
    // ，延视线方向移动距离 单位米
    viewer.camera.moveForward(100);
    viewer.camera.moveBackward(100);
    viewer.camera.moveLeft(100);
    viewer.camera.moveRight();

    // 以下都是相机本身的旋转，如人的抬头，左右扭头
    // 以下都是在局部坐标系下，绕相机right轴的旋转
    viewer.camera.lookUp(100);
    viewer.camera.lookDown(100);
    // 以下都是在局部坐标系下，绕相机up轴的旋转
    viewer.camera.lookRight(Math.PI / 4);
    viewer.camera.lookLeft(Math.PI / 4);

    // axis为局部坐标系下的方向轴，相机绕轴、绕原点旋转，即相机到原点的距离不变
    viewer.camera.rotate(axis, Math.PI / 4);
    // 绕相机的right轴、绕原点旋转，即相机到原点的距离不变
    viewer.camera.rotateDown(Math.PI / 4);
    viewer.camera.rotateUP(Math.PI / 4);
    // 绕相机的up轴、绕原点旋转，即相机到原点的距离不变
    viewer.camera.rotateLeft(Math.PI / 4);
    viewer.camera.rotateRight(Math.PI / 4);

}