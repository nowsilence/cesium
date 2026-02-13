import defined from "../Core/defined.js";
import DeveloperError from "../Core/DeveloperError.js";
import Intersect from "../Core/Intersect.js";
import Cesium3DTileOptimizationHint from "./Cesium3DTileOptimizationHint.js";
import Cesium3DTileRefine from "./Cesium3DTileRefine.js";

/**
 * Traverses a {@link Cesium3DTileset} to determine which tiles to load and render.
 * This type describes an interface and is not intended to be instantiated directly.
 *
 * @alias Cesium3DTilesetTraversal
 * @constructor
 * @abstract
 *
 * @see Cesium3DTilesetBaseTraversal
 * @see Cesium3DTilesetSkipTraversal
 * @see Cesium3DTilesetMostDetailedTraversal
 *
 * @private
 */
function Cesium3DTilesetTraversal() {}

/**
 * Traverses a {@link Cesium3DTileset} to determine which tiles to load and render.
 *
 * @private
 * @param {Cesium3DTileset} tileset
 * @param {FrameState} frameState
 */
Cesium3DTilesetTraversal.selectTiles = function (tileset, frameState) {
  DeveloperError.throwInstantiationError();
};

/**
 * Sort by farthest child first since this is going on a stack
 *
 * @private
 * @param {Cesium3DTile} a
 * @param {Cesium3DTile} b
 * @returns {number}
 */
Cesium3DTilesetTraversal.sortChildrenByDistanceToCamera = function (a, b) {
  if (b._distanceToCamera === 0 && a._distanceToCamera === 0) {
    return b._centerZDepth - a._centerZDepth;
  }

  return b._distanceToCamera - a._distanceToCamera;
};

/**
 * Determine if a tile can and should be traversed for children tiles that
 * would contribute to rendering the current view
 *
 * @private
 * @param {Cesium3DTile} tile
 * @returns {boolean}
 */
Cesium3DTilesetTraversal.canTraverse = function (tile) {
  if (tile.children.length === 0) {
    return false;
  }
  if (tile.hasTilesetContent || tile.hasImplicitContent) {
    // Traverse external tileset to visit its root tile
    // Don't traverse if the subtree is expired because it will be destroyed
    return !tile.contentExpired;
  }
  return tile._screenSpaceError > tile.tileset.memoryAdjustedScreenSpaceError;
};

/**
 * Mark a tile as selected, and add it to the tileset's list of selected tiles
 *
 * @private
 * @param {Cesium3DTile} tile
 * @param {FrameState} frameState
 */
Cesium3DTilesetTraversal.selectTile = function (tile, frameState) {
  if (tile.contentVisibility(frameState) === Intersect.OUTSIDE) {
    return;
  }

  tile._wasSelectedLastFrame = true;

  const { content, tileset } = tile;
  if (content.featurePropertiesDirty) {
    // A feature's property in this tile changed, the tile needs to be re-styled.
    content.featurePropertiesDirty = false;
    tile.lastStyleTime = 0; // Force applying the style to this tile
    tileset._selectedTilesToStyle.push(tile);
  } else if (tile._selectedFrame < frameState.frameNumber - 1) {
    // Tile is newly selected; it is selected this frame, but was not selected last frame.
    tileset._selectedTilesToStyle.push(tile);
    tile._wasSelectedLastFrame = false;
  }

  tile._selectedFrame = frameState.frameNumber;
  tileset._selectedTiles.push(tile);
};

/**
 * @private
 * @param {Cesium3DTile} tile
 * @param {FrameState} frameState
 */
Cesium3DTilesetTraversal.visitTile = function (tile, frameState) {
  ++tile.tileset._statistics.visited;
  tile._visitedFrame = frameState.frameNumber;
};

/**
 * @private
 * @param {Cesium3DTile} tile
 * @param {FrameState} frameState
 */
Cesium3DTilesetTraversal.touchTile = function (tile, frameState) {
  if (tile._touchedFrame === frameState.frameNumber) {
    // Prevents another pass from touching the frame again
    return;
  }
  tile.tileset._cache.touch(tile);
  tile._touchedFrame = frameState.frameNumber;
};

/**
 * Add a tile to the list of requested tiles, if appropriate
 *
 * @private
 * @param {Cesium3DTile} tile
 * @param {FrameState} frameState
 */
Cesium3DTilesetTraversal.loadTile = function (tile, frameState) {
  const { tileset } = tile;
  if (
    tile._requestedFrame === frameState.frameNumber ||
    (!tile.hasUnloadedRenderableContent && !tile.contentExpired)
  ) { // 1、已经添加到列表了 2、已经加载过且没有过期
    return;
  }
  // 相机移动过快、预测瓦片在屏幕上待的时间不够久
  if (!isOnScreenLongEnough(tile, frameState)) {
    return;
  }
//   frameState.camera.timeSinceMoved 相机从 “最后一次移动” 到现在的时间（毫秒）；值越小，说明相机刚停止移动
  const cameraHasNotStoppedMovingLongEnough =
    frameState.camera.timeSinceMoved < tileset.foveatedTimeDelay;
   // 瓦片是否为 “延迟优先级”（通常是视野边缘 / 低优先级的瓦片）
  if (tile.priorityDeferred && cameraHasNotStoppedMovingLongEnough) {
    return; // 低优先级瓦片，相机停在到现在的时间短（小于设置的foveatedTimeDelay），先不加载
  }

  tile._requestedFrame = frameState.frameNumber;
  tileset._requestedTiles.push(tile);
};

/**
 * Prevent unnecessary loads while camera is moving by getting the ratio of travel distance to tile size.
 * 相机移动时的瓦片加载节流，避免快速移动时加载临时可见的瓦片；
 * @private
 * @param {Cesium3DTile} tile
 * @param {FrameState} frameState
 * @returns {boolean}
 */
function isOnScreenLongEnough(tile, frameState) {
  const { tileset } = tile;
  if (!tileset._cullRequestsWhileMoving) {
    return true;
  }
  // 相机位移
  const { positionWCDeltaMagnitude, positionWCDeltaMagnitudeLastFrame } =
    frameState.camera;
  const deltaMagnitude =
    positionWCDeltaMagnitude !== 0.0
      ? positionWCDeltaMagnitude
      : positionWCDeltaMagnitudeLastFrame;

  // How do n frames of this movement compare to the tile's physical size.
  // 计算瓦片的物理直径（避免半径为0的异常）
  const diameter = Math.max(tile.boundingSphere.radius * 2.0, 1.0);
  // 计算“移动距离/瓦片尺寸”的比值（乘以系数控制灵敏度）
  const movementRatio =
    (tileset.cullRequestsWhileMovingMultiplier * deltaMagnitude) / diameter;

  return movementRatio < 1.0;
}

/**
 * Reset some of the tile's flags and re-evaluate visibility and priority
 *
 * @private
 * @param {Cesium3DTile} tile
 * @param {FrameState} frameState
 */
Cesium3DTilesetTraversal.updateTile = function (tile, frameState) {
  updateTileVisibility(tile, frameState);
  tile.updateExpiration();

  tile._wasMinPriorityChild = false;
  tile._priorityHolder = tile;
  updateMinimumMaximumPriority(tile);

  // SkipLOD
  tile._shouldSelect = false;
  tile._finalResolution = true;
};

/**
 * @private
 * @param {Cesium3DTile} tile
 * @param {FrameState} frameState
 */
function updateTileVisibility(tile, frameState) {
  tile.updateVisibility(frameState); // 只是用了cullVolume，并没有用到屏幕误差

  if (!tile.isVisible) {
    return;
  }

  const hasChildren = tile.children.length > 0;
  if ((tile.hasTilesetContent || tile.hasImplicitContent) && hasChildren) {
    // Use the root tile's visibility instead of this tile's visibility.
    // The root tile may be culled by the children bounds optimization in which
    // case this tile should also be culled.
    const child = tile.children[0]; // 如果hasTilesetContnet只有一个子节点
    updateTileVisibility(child, frameState);
    tile._visible = child._visible;
    return;
  }

  // 如果A瓦片SSE > tileset.memoryAdjustedScreenSpaceError表示需要细化，
  // 子瓦片的SSE<=tileset.memoryAdjustedScreenSpaceError表示不需要细化
  // 那子瓦片到底需不需要加载？meetsScreenSpaceErrorEarly进行了处理
  if (meetsScreenSpaceErrorEarly(tile, frameState)) {
    tile._visible = false;
    return;
  }

  // Optimization - if none of the tile's children are visible then this tile isn't visible
  // 只有在Refine策略下才有效，场景：父瓦片在cullVolume内，子瓦片都不在，因为父瓦片的包围盒可能远大于每个子瓦片的包围盒
  // 子瓦片都不在视野范围内，所以父瓦片不可见，之前计算父瓦片可见，用的包围体偏大
  const replace = tile.refine === Cesium3DTileRefine.REPLACE;
  const useOptimization =
    tile._optimChildrenWithinParent ===
    Cesium3DTileOptimizationHint.USE_OPTIMIZATION;
  if (replace && useOptimization && hasChildren) {
    if (!anyChildrenVisible(tile, frameState)) {
      ++tile.tileset._statistics.numberOfTilesCulledWithChildrenUnion;
      tile._visible = false;
      return;
    }
  }
}

/**
 * @private
 * @param {Cesium3DTile} tile
 * @param {FrameState} frameState
 * @returns {boolean}
 */
function meetsScreenSpaceErrorEarly(tile, frameState) {
  const { parent, tileset } = tile;
  if (
    !defined(parent) ||
    parent.hasTilesetContent ||
    parent.hasImplicitContent ||
    parent.refine !== Cesium3DTileRefine.ADD
  ) {
    return false;
  }

  // Use parent's geometric error with child's box to see if the tile already meet the SSE
  // true表示用父瓦片的几何误差，层级越高屏幕误差越小
  // 使用父瓦片的说明tile.getScreenSpaceError(frameState, true)计算结果变大了
  // 正常情况下SSE > tileset.memoryAdjustedScreenSpaceError，表示需要加载
  // SSE <= tileset.memoryAdjustedScreenSpaceError，

  // 思考：
  // 如果A瓦片SSE > tileset.memoryAdjustedScreenSpaceError表示需要细化，
  // 子瓦片的SSE<=tileset.memoryAdjustedScreenSpaceError表示不需要细化
  // 那子瓦片到底需不需要加载？
  // 下面可能就是处理这种情况，用父瓦片的几何误差，子瓦片到相机的距离，实际的SSE变大了。如果变大的情况下判断还不需加载则不加载
  return (
    tile.getScreenSpaceError(frameState, true) <=
    tileset.memoryAdjustedScreenSpaceError
  );
}

/**
 * @private
 * @param {Cesium3DTile} tile
 * @param {FrameState} frameState
 * @returns {boolean}
 */
function anyChildrenVisible(tile, frameState) {
  let anyVisible = false;
  const children = tile.children;
  for (let i = 0; i < children.length; ++i) {
    const child = children[i];
    child.updateVisibility(frameState);
    anyVisible = anyVisible || child.isVisible;
  }
  return anyVisible;
}

/**
 * @private
 * @param {Cesium3DTile} tile
 */
function updateMinimumMaximumPriority(tile) {
  const minimumPriority = tile.tileset._minimumPriority;
  const maximumPriority = tile.tileset._maximumPriority;
  const priorityHolder = tile._priorityHolder;

  maximumPriority.distance = Math.max(
    priorityHolder._distanceToCamera,
    maximumPriority.distance,
  );
  minimumPriority.distance = Math.min(
    priorityHolder._distanceToCamera,
    minimumPriority.distance,
  );
  maximumPriority.depth = Math.max(tile._depth, maximumPriority.depth);
  minimumPriority.depth = Math.min(tile._depth, minimumPriority.depth);
  maximumPriority.foveatedFactor = Math.max(
    priorityHolder._foveatedFactor,
    maximumPriority.foveatedFactor,
  );
  minimumPriority.foveatedFactor = Math.min(
    priorityHolder._foveatedFactor,
    minimumPriority.foveatedFactor,
  );
  maximumPriority.reverseScreenSpaceError = Math.max(
    tile._priorityReverseScreenSpaceError,
    maximumPriority.reverseScreenSpaceError,
  );
  minimumPriority.reverseScreenSpaceError = Math.min(
    tile._priorityReverseScreenSpaceError,
    minimumPriority.reverseScreenSpaceError,
  );
}

export default Cesium3DTilesetTraversal;
