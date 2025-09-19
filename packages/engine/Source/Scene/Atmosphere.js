import Cartesian3 from "../Core/Cartesian3.js";
import CesiumMath from "../Core/Math.js";
import DynamicAtmosphereLightingType from "./DynamicAtmosphereLightingType.js";

/**
 * Common atmosphere settings used by 3D Tiles and models for rendering sky atmosphere, ground atmosphere, and fog.
 * skyAtmosphere 渲染天空用的
 * globe渲染地形用的
 * atmosphere是渲染3dtile和模型的
 * atmosphere相关参数会赋值到uniformState
 * skyAtmosphere参数是自己处理的
 * Globle参数是在GlobeTileProvider里赋值的
 * <p>
 * This class is not to be confused with {@link SkyAtmosphere}, which is responsible for rendering the sky.
 * </p>
 * <p>
 * While the atmosphere settings affect the color of fog, see {@link Fog} to control how fog is rendered.
 * </p>
 *
 * @alias Atmosphere
 * @constructor
 *
 * @example
 * // Turn on dynamic atmosphere lighting using the sun direction
 * scene.atmosphere.dynamicLighting = Cesium.DynamicAtmosphereLightingType.SUNLIGHT;
 *
 * @example
 * // Turn on dynamic lighting using whatever light source is in the scene
 * scene.light = new Cesium.DirectionalLight({
 *   direction: new Cesium.Cartesian3(1, 0, 0)
 * });
 * scene.atmosphere.dynamicLighting = Cesium.DynamicAtmosphereLightingType.SCENE_LIGHT;
 *
 * @example
 * // Adjust the color of the atmosphere effects.
 * scene.atmosphere.hueShift = 0.4; // Cycle 40% around the color wheel
 * scene.atmosphere.brightnessShift = 0.25; // Increase the brightness
 * scene.atmosphere.saturationShift = -0.1; // Desaturate the colors
 *
 * @see SkyAtmosphere
 * @see Globe
 * @see Fog
 */
function Atmosphere() {
  /**
   * The intensity of the light that is used for computing the ground atmosphere color.
   *
   * @type {number}
   * @default 10.0
   */
  this.lightIntensity = 10.0;

  /**
   * The Rayleigh scattering coefficient used in the atmospheric scattering equations for the ground atmosphere.
   * 瑞利散射系数，是根据 瑞利散射定律公式计算出来的
   * βR(λ)=32π³n²(n²−1)²/3Nλ⁴f(λ)
   * 瑞利散射系数: 单位：\(m^{-1}\) 或 \(km^{-1}\)，表示单位距离内光被散射的概率
   * λ: 入射光的波长（核心变量！散射系数与 \(\lambda^4\) 成反比，波长越短散射越强）
   * n: 大气分子的折射率（对空气而言，可见光波段 \(n \approx 1.00029\)，近似为常数）
   * N: 大气分子数密度（标准状态下约 \(2.55 \times 10^{25} m^{-3}\)，可视为定值
   * f(λ):分子极化率修正项（与波长略相关，但在可见光波段影响极小，常简化为 1）
   * 从公式可见：波长越短，瑞利散射系数越大—— 这也是 “天空呈蓝色”（蓝光波长短，散射强）、“日出日落呈红色”（阳光穿过厚大气，短波长光被散射殆尽）的物理原因。
   * 红色光（波长约 620-750 nm，波长最长）→ 散射系数最小（5.5e-6）；
   * 绿色光（波长约 495-570 nm，波长中等）→ 散射系数中等（13.0e-6）；
   * 蓝色光（波长约 450-495 nm，波长最短）散射系数最大（28.4e-6）；
   * 波长代入上述公式可算得
   * @type {Cartesian3}
   * @default Cartesian3(5.5e-6, 13.0e-6, 28.4e-6)
   */
  this.rayleighCoefficient = new Cartesian3(5.5e-6, 13.0e-6, 28.4e-6);

  /**
   * The Mie scattering coefficient used in the atmospheric scattering equations for the ground atmosphere.
   * 对波长依赖性弱 对可见光范围内的红、绿、蓝波长散射强度差异较
   * 21e-6 是对 “标准大气” 状态的典型取值。
   * @type {Cartesian3}
   * @default Cartesian3(21e-6, 21e-6, 21e-6)
   */
  this.mieCoefficient = new Cartesian3(21e-6, 21e-6, 21e-6);

  /**
   * The Rayleigh scale height used in the atmospheric scattering equations for the ground atmosphere, in meters.
   * 瑞利散射尺度高度（通常用H_R表示）的物理意义是：当高度上升H_R时，大气分子数密度会衰减到原来的1/e
   * @type {number}
   * @default 10000.0
   */
  this.rayleighScaleHeight = 10000.0;

  /**
   * The Mie scale height used in the atmospheric scattering equations for the ground atmosphere, in meters.
   *
   * @type {number}
   * @default 3200.0
   */
  this.mieScaleHeight = 3200.0;

  /**
   * The anisotropy（各向异性） of the medium to consider for Mie scattering.
   * <p>
   * Valid values are between -1.0 and 1.0.
   * </p>
   * 米氏散射的本质是大气中较大颗粒（如尘埃、气溶胶）对光的散射，与瑞利散射（各向同性，散射在所有方向均匀分布）不同，米氏散射具有强烈的方向性：
   * 大部分散射光集中在入射光方向（前向散射）
   * 少部分散射光分布在入射光的反方向（后向散射）
   * 取值范围[-1, 1]，1：完全前向散射（所有光都沿入射方向散射）-1：完全后向散射（所有光都沿入射反方向散射 0：各向同性散射（光在所有方向均匀分布，类似瑞利散射）
   * @type {number}
   * @default 0.9
   */
  this.mieAnisotropy = 0.9;

  /**
   * The hue shift to apply to the atmosphere. Defaults to 0.0 (no shift).
   * A hue shift of 1.0 indicates a complete rotation of the hues available.
   *
   * @type {number}
   * @default 0.0
   */
  this.hueShift = 0.0;

  /**
   * The saturation shift to apply to the atmosphere. Defaults to 0.0 (no shift).
   * A saturation shift of -1.0 is monochrome.
   *
   * @type {number}
   * @default 0.0
   */
  this.saturationShift = 0.0;

  /**
   * The brightness shift to apply to the atmosphere. Defaults to 0.0 (no shift).
   * A brightness shift of -1.0 is complete darkness, which will let space show through.
   *
   * @type {number}
   * @default 0.0
   */
  this.brightnessShift = 0.0;

  /**
   * When not DynamicAtmosphereLightingType.NONE, the selected light source will
   * be used for dynamically lighting all atmosphere-related rendering effects.
   *
   * @type {DynamicAtmosphereLightingType}
   * @default DynamicAtmosphereLightingType.NONE
   */
  this.dynamicLighting = DynamicAtmosphereLightingType.NONE;
}

/**
 * Returns <code>true</code> if the atmosphere shader requires a color correct step.
 * @param {Atmosphere} atmosphere The atmosphere instance to check
 * @returns {boolean} true if the atmosphere shader requires a color correct step
 */
Atmosphere.requiresColorCorrect = function (atmosphere) {
  return !(
    CesiumMath.equalsEpsilon(atmosphere.hueShift, 0.0, CesiumMath.EPSILON7) &&
    CesiumMath.equalsEpsilon(
      atmosphere.saturationShift,
      0.0,
      CesiumMath.EPSILON7,
    ) &&
    CesiumMath.equalsEpsilon(
      atmosphere.brightnessShift,
      0.0,
      CesiumMath.EPSILON7,
    )
  );
};

export default Atmosphere;
