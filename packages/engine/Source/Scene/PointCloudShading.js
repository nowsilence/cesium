import PointCloudEyeDomeLighting from "./PointCloudEyeDomeLighting.js";

/**
 * Options for performing point attenuation based on geometric error when rendering
 * point clouds using 3D Tiles.
 *
 * @param {object} [options] Object with the following properties:
 * @param {boolean} [options.attenuation=false] 是否启用基于几何误差的衰减 Perform point attenuation based on geometric error.
 * @param {number} [options.geometricErrorScale=1.0] 几何误差的缩放因子 可以放大/缩小衰减效果 Scale to be applied to each tile's geometric error.
 * @param {number} [options.maximumAttenuation] Maximum attenuation in pixels. Defaults to the Cesium3DTileset's maximumScreenSpaceError.
 * @param {number} [options.baseResolution] Average base resolution for the dataset in meters. Substitute for Geometric Error when not available.
 * @param {boolean} [options.eyeDomeLighting=true] When true, use eye dome lighting when drawing with point attenuation.
 * @param {number} [options.eyeDomeLightingStrength=1.0] Increasing this value increases contrast on slopes and edges.
 * @param {number} [options.eyeDomeLightingRadius=1.0] Increase the thickness of contours from eye dome lighting.
 * @param {boolean} [options.backFaceCulling=false] Determines whether back-facing points are hidden. This option works only if data has normals included.
 * @param {boolean} [options.normalShading=true] Determines whether a point cloud that contains normals is shaded by the scene's light source.
 *
 * @alias PointCloudShading
 * @constructor
 */
function PointCloudShading(options) {
  const pointCloudShading = options ?? {};

  /**
   * Perform point attenuation based on geometric error.
   * @type {boolean}
   * @default false
   */
  this.attenuation = pointCloudShading.attenuation ?? false;

  /**
   * Scale to be applied to the geometric error before computing attenuation.
   * @type {number}
   * @default 1.0
   */
  this.geometricErrorScale = pointCloudShading.geometricErrorScale ?? 1.0;

  /**
   * Maximum point attenuation in pixels. If undefined, the Cesium3DTileset's maximumScreenSpaceError will be used.
   * @type {number}
   */
  this.maximumAttenuation = pointCloudShading.maximumAttenuation;

  /**
   * Average base resolution for the dataset in meters.
   * Used in place of geometric error when geometric error is 0.
   * If undefined, an approximation will be computed for each tile that has geometric error of 0.
   * @type {number}
   */
  this.baseResolution = pointCloudShading.baseResolution;

  /**
   * Use eye dome lighting when drawing with point attenuation
   * Requires support for EXT_frag_depth, OES_texture_float, and WEBGL_draw_buffers extensions in WebGL 1.0,
   * otherwise eye dome lighting is ignored.
   * 是否开启眼穹照明（EDL）
   * @type {boolean}
   * @default true
   */
  this.eyeDomeLighting = pointCloudShading.eyeDomeLighting ?? true;

  /**
   * EDL 强度：
   * - 数值越大，点云边缘/斜坡的对比度越高，深度感越强（过大会导致画面刺眼）。
   * Eye dome lighting strength (apparent contrast)
   * @type {number}
   * @default 1.0
   */
  this.eyeDomeLightingStrength =
    pointCloudShading.eyeDomeLightingStrength ?? 1.0;

  /**
   * EDL 轮廓厚度：
   * - 数值越大，EDL 生成的轮廓越厚，点云的 “立体感边界” 越明显
   * Thickness of contours from eye dome lighting
   * @type {number}
   * @default 1.0
   */
  this.eyeDomeLightingRadius = pointCloudShading.eyeDomeLightingRadius ?? 1.0;

  /**
   * Determines whether back-facing points are hidden.
   * This option works only if data has normals included.
   * 是否开启背面剔除：
   * - 隐藏背向相机的点（仅当点云包含法线数据时生效）；
   * - 开启后可减少无效点的渲染，提升性能，但会丢失背向视角的点云细节。
   * @type {boolean}
   * @default false
   */
  this.backFaceCulling = pointCloudShading.backFaceCulling ?? false;

  /**
   * Determines whether a point cloud that contains normals is shaded by the scene's light source.
   * 是否开启法线着色：
   * - 若点云包含法线数据，开启后会根据场景光源（如太阳）和法线方向计算点的明暗，让点云有 “光影效果”；
   * - 关闭后点云所有点颜色一致，无光影层次。
   * @type {boolean}
   * @default true
   */
  this.normalShading = pointCloudShading.normalShading ?? true;
}

/**
 * Determines if point cloud shading is supported.
 *
 * @param {Scene} scene The scene.
 * @returns {boolean} <code>true</code> if point cloud shading is supported; otherwise, returns <code>false</code>
 */
PointCloudShading.isSupported = function (scene) {
  return PointCloudEyeDomeLighting.isSupported(scene.context);
};
export default PointCloudShading;
