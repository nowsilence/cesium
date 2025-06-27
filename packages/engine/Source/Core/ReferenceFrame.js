/**
 * Constants for identifying well-known reference frames.
 *
 * @enum {number}
 */
const ReferenceFrame = {
  /**
   * The fixed frame.
   * 固定参考系
   * 随地球旋转的坐标系，与地球上的地理位置直接关联。例如，建筑物、车辆等地面物体通常使用固定参考系。
   * @type {number}
   * @constant
   */
  FIXED: 0,

  /**
   * The inertial frame.
   * 惯性参考系
   * 不随地球旋转的坐标系，通常用于天文或太空场景。例如，卫星在太空中的轨迹计算通常使用惯性参考系
   * 设置惯性坐标系参考通常设置entity的一下参数 
   * position: new Cesium.SampledPositionProperty(),
   * orientation: new Cesium.VelocityOrientationProperty(new Cesium.SampledPositionProperty()),
   * @type {number}
   * @constant
   */
  INERTIAL: 1,
};
export default Object.freeze(ReferenceFrame);
