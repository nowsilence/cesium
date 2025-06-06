import defaultValue from "../Core/defaultValue.js";
import defined from "../Core/defined.js";
import FeatureDetection from "../Core/FeatureDetection.js";
import VertexFormat from "../Core/VertexFormat.js";
import PolylineMaterialAppearanceVS from "../Shaders/Appearances/PolylineMaterialAppearanceVS.js";
import PolylineCommon from "../Shaders/PolylineCommon.js";
import PolylineFS from "../Shaders/PolylineFS.js";
import Appearance from "./Appearance.js";
import Material from "./Material.js";

let defaultVertexShaderSource = `${PolylineCommon}\n${PolylineMaterialAppearanceVS}`;
const defaultFragmentShaderSource = PolylineFS;

if (!FeatureDetection.isInternetExplorer()) {
  defaultVertexShaderSource = `#define CLIP_POLYLINE \n${defaultVertexShaderSource}`;
}

/**
 * An appearance for {@link PolylineGeometry} that supports shading with materials.
 * 支持PolylineGeometry设置材质渲染，不支持数据选择
 * @alias PolylineMaterialAppearance
 * @constructor
 *
 * @param {object} [options] Object with the following properties:
 * @param {boolean} [options.translucent=true] When <code>true</code>, the geometry is expected to appear translucent so {@link PolylineMaterialAppearance#renderState} has alpha blending enabled.
 * @param {Material} [options.material=Material.ColorType] The material used to determine the fragment color.
 * @param {string} [options.vertexShaderSource] Optional GLSL vertex shader source to override the default vertex shader.
 * @param {string} [options.fragmentShaderSource] Optional GLSL fragment shader source to override the default fragment shader.
 * @param {object} [options.renderState] Optional render state to override the default render state.
 *
 * @see {@link https://github.com/CesiumGS/cesium/wiki/Fabric|Fabric}
 *
 * @example
 * const primitive = new Cesium.Primitive({
 *   geometryInstances : new Cesium.GeometryInstance({
 *     geometry : new Cesium.PolylineGeometry({
 *       positions : Cesium.Cartesian3.fromDegreesArray([
 *         0.0, 0.0,
 *         5.0, 0.0
 *       ]),
 *       width : 10.0,
 *       vertexFormat : Cesium.PolylineMaterialAppearance.VERTEX_FORMAT
 *     })
 *   }),
 *   appearance : new Cesium.PolylineMaterialAppearance({
 *     material : Cesium.Material.fromType('Color')
 *   })
 * });
 */
function PolylineMaterialAppearance(options) {
  options = defaultValue(options, defaultValue.EMPTY_OBJECT);

  const translucent = defaultValue(options.translucent, true);
  const closed = false;
  const vertexFormat = PolylineMaterialAppearance.VERTEX_FORMAT;

  /**
   * The material used to determine the fragment color.  Unlike other {@link PolylineMaterialAppearance}
   * properties, this is not read-only, so an appearance's material can change on the fly.
   *
   * @type Material
   *
   * @default {@link Material.ColorType}
   *
   * @see {@link https://github.com/CesiumGS/cesium/wiki/Fabric|Fabric}
   */
  this.material = defined(options.material)
    ? options.material
    : Material.fromType(Material.ColorType);

  /**
   * When <code>true</code>, the geometry is expected to appear translucent so
   * {@link PolylineMaterialAppearance#renderState} has alpha blending enabled.
   *
   * @type {boolean}
   *
   * @default true
   */
  this.translucent = translucent;

  this._vertexShaderSource = defaultValue(
    options.vertexShaderSource,
    defaultVertexShaderSource
  );
  this._fragmentShaderSource = defaultValue(
    options.fragmentShaderSource,
    defaultFragmentShaderSource
  );
  this._renderState = Appearance.getDefaultRenderState(
    translucent,
    closed,
    options.renderState
  );
  this._closed = closed;

  // Non-derived members

  this._vertexFormat = vertexFormat;
}

Object.defineProperties(PolylineMaterialAppearance.prototype, {
  /**
   * The GLSL source code for the vertex shader.
   *
   * @memberof PolylineMaterialAppearance.prototype
   *
   * @type {string}
   * @readonly
   */
  vertexShaderSource: {
    get: function () {
      let vs = this._vertexShaderSource;
      if (
        this.material.shaderSource.search(/in\s+float\s+v_polylineAngle;/g) !==
        -1
      ) {
        vs = `#define POLYLINE_DASH\n${vs}`;
      }
      return vs;
    },
  },

  /**
   * The GLSL source code for the fragment shader.
   *
   * @memberof PolylineMaterialAppearance.prototype
   *
   * @type {string}
   * @readonly
   */
  fragmentShaderSource: {
    get: function () {
      return this._fragmentShaderSource;
    },
  },

  /**
   * The WebGL fixed-function state to use when rendering the geometry.
   * <p>
   * The render state can be explicitly defined when constructing a {@link PolylineMaterialAppearance}
   * instance, or it is set implicitly via {@link PolylineMaterialAppearance#translucent}
   * and {@link PolylineMaterialAppearance#closed}.
   * </p>
   *
   * @memberof PolylineMaterialAppearance.prototype
   *
   * @type {object}
   * @readonly
   */
  renderState: {
    get: function () {
      return this._renderState;
    },
  },

  /**
   * When <code>true</code>, the geometry is expected to be closed so
   * {@link PolylineMaterialAppearance#renderState} has backface culling enabled.
   * This is always <code>false</code> for <code>PolylineMaterialAppearance</code>.
   *
   * @memberof PolylineMaterialAppearance.prototype
   *
   * @type {boolean}
   * @readonly
   *
   * @default false
   */
  closed: {
    get: function () {
      return this._closed;
    },
  },

  /**
   * The {@link VertexFormat} that this appearance instance is compatible with.
   * A geometry can have more vertex attributes and still be compatible - at a
   * potential performance cost - but it can't have less.
   *
   * @memberof PolylineMaterialAppearance.prototype
   *
   * @type VertexFormat
   * @readonly
   *
   * @default {@link PolylineMaterialAppearance.VERTEX_FORMAT}
   */
  vertexFormat: {
    get: function () {
      return this._vertexFormat;
    },
  },
});

/**
 * The {@link VertexFormat} that all {@link PolylineMaterialAppearance} instances
 * are compatible with. This requires <code>position</code> and <code>st</code> attributes.
 *
 * @type VertexFormat
 *
 * @constant
 */
PolylineMaterialAppearance.VERTEX_FORMAT = VertexFormat.POSITION_AND_ST;

/**
 * Procedurally creates the full GLSL fragment shader source.  For {@link PolylineMaterialAppearance},
 * this is derived from {@link PolylineMaterialAppearance#fragmentShaderSource} and {@link PolylineMaterialAppearance#material}.
 *
 * @function
 *
 * @returns {string} The full GLSL fragment shader source.
 */
PolylineMaterialAppearance.prototype.getFragmentShaderSource =
  Appearance.prototype.getFragmentShaderSource;

/**
 * Determines if the geometry is translucent based on {@link PolylineMaterialAppearance#translucent} and {@link Material#isTranslucent}.
 *
 * @function
 *
 * @returns {boolean} <code>true</code> if the appearance is translucent.
 */
PolylineMaterialAppearance.prototype.isTranslucent =
  Appearance.prototype.isTranslucent;

/**
 * Creates a render state.  This is not the final render state instance; instead,
 * it can contain a subset of render state properties identical to the render state
 * created in the context.
 *
 * @function
 *
 * @returns {object} The render state.
 */
PolylineMaterialAppearance.prototype.getRenderState =
  Appearance.prototype.getRenderState;
export default PolylineMaterialAppearance;
