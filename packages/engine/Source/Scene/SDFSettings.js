/**
 * Settings for the generation of signed distance field glyphs
 *
 * @private
 */
const SDFSettings = {
  /**
   * The font size in pixels
   *
   * @type {number}
   * @constant
   */
  FONT_SIZE: 48.0,

  /**
   * Whitespace padding around glyphs.
   *
   * @type {number}
   * @constant
   */
  PADDING: 10.0,

  /**
   * How many pixels around the glyph shape to use for encoding distance
   * 距离场半径指的是在计算每个点到形状边界的距离时所考虑的范围。
   * 从数值角度来看，它是一个以像素为单位的长度值。
   * 这个半径定义了一个围绕每个像素的圆形区域，在计算该像素的距离值时，仅会考虑该圆形区域内的形状边界信息。
   * @type {number}
   * @constant
   */
  RADIUS: 8.0,

  /**
   * How much of the radius (relative) is used for the inside part the glyph.
   * radius多少被划定为内部边界
   * @type {number}
   * @constant
   */
  CUTOFF: 0.25,
};
export default Object.freeze(SDFSettings);
