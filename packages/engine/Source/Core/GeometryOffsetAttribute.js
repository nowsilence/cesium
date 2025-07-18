/**
 * Represents which vertices should have a value of `true` for the `applyOffset` attribute
 * @private
 */
const GeometryOffsetAttribute = {
  NONE: 0, // 不偏移，相当于offset为0
  TOP: 1, // 顶部的顶点偏移,可以实现extrudedHeight的功能（如果偏移方向垂直向上的话）
  ALL: 2, // 所有的点进行偏移
};
export default Object.freeze(GeometryOffsetAttribute);
