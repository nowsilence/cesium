/**
 * ArcType defines the path that should be taken connecting vertices.
 *
 * @enum {number}
 */
const ArcType = {
  /**
   * Straight line that does not conform to the surface of the ellipsoid.
   * 3D 空间直线
   * @type {number}
   * @constant
   */
  NONE: 0,

  /**
   * Follow geodesic path.
   * 测地线  是一种能够紧贴地球表面（或椭球体）的曲线，通常用于表示地表路径（如车辆轨迹、航线、道路等）
   * 测地线是曲面上两点之间的最短路径，在地球上表现为大圆航线
   * @type {number}
   * @constant
   */
  GEODESIC: 1,

  /**
   * Follow rhumb or loxodrome path.
   * RHUMB（恒向线） 是一种特殊的贴地线类型
   * 它保持恒定的方位角（即与经线的夹角不变），常用于航海导航等场景
   * @type {number}
   * @constant
   */
  RHUMB: 2,
};
export default Object.freeze(ArcType);
