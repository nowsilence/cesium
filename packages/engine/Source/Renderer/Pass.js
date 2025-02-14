/**
 * The render pass for a command.
 *
 * @private
 */
const Pass = {
  // If you add/modify/remove Pass constants, also change the automatic GLSL constants
  // that start with 'czm_pass'
  //
  // Commands are executed in order by pass up to the translucent pass.
  // Translucent geometry needs special handling (sorting/OIT). The compute pass
  // is executed first and the overlay pass is executed last. Both are not sorted
  // by frustum.
  ENVIRONMENT: 0,
  COMPUTE: 1,
  GLOBE: 2,
  TERRAIN_CLASSIFICATION: 3,
  CESIUM_3D_TILE: 4,
  CESIUM_3D_TILE_CLASSIFICATION: 5,
  CESIUM_3D_TILE_CLASSIFICATION_IGNORE_SHOW: 6,
  OPAQUE: 7,
  TRANSLUCENT: 8,
  VOXELS: 9, // 专门用于处理体素数据或体积数据的渲染。体素数据通常用于表示三维体积（如医学影像、地质数据等），而 Pass.VOXELS 负责将这些数据渲染到场景中。
  OVERLAY: 10,
  NUMBER_OF_PASSES: 11,
};
export default Object.freeze(Pass);
