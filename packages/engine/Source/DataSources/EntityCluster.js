import BoundingRectangle from "../Core/BoundingRectangle.js";
import Cartesian2 from "../Core/Cartesian2.js";
import Cartesian3 from "../Core/Cartesian3.js";
import Frozen from "../Core/Frozen.js";
import defined from "../Core/defined.js";
import EllipsoidalOccluder from "../Core/EllipsoidalOccluder.js";
import Event from "../Core/Event.js";
import Matrix4 from "../Core/Matrix4.js";
import Billboard from "../Scene/Billboard.js";
import BillboardCollection from "../Scene/BillboardCollection.js";
import Label from "../Scene/Label.js";
import LabelCollection from "../Scene/LabelCollection.js";
import PointPrimitive from "../Scene/PointPrimitive.js";
import PointPrimitiveCollection from "../Scene/PointPrimitiveCollection.js";
import SceneMode from "../Scene/SceneMode.js";
import KDBush from "kdbush";

/**
 * Defines how screen space objects (billboards, points, labels) are clustered.
 *
 * @param {object} [options] An object with the following properties:
 * @param {boolean} [options.enabled=false] Whether or not to enable clustering.
 * @param {number} [options.pixelRange=80] The pixel range to extend the screen space bounding box.
 * @param {number} [options.minimumClusterSize=2] The minimum number of screen space objects that can be clustered.
 * @param {boolean} [options.clusterBillboards=true] Whether or not to cluster the billboards of an entity.
 * @param {boolean} [options.clusterLabels=true] Whether or not to cluster the labels of an entity.
 * @param {boolean} [options.clusterPoints=true] Whether or not to cluster the points of an entity.
 * @param {boolean} [options.show=true] Determines if the entities in the cluster will be shown.
 *
 * @alias EntityCluster
 * @constructor
 *
 * @demo {@link https://sandcastle.cesium.com/index.html?src=Clustering.html|Cesium Sandcastle Clustering Demo}
 */
function EntityCluster(options) {
  options = options ?? Frozen.EMPTY_OBJECT;

  this._enabled = options.enabled ?? false;
  this._pixelRange = options.pixelRange ?? 80;
  this._minimumClusterSize = options.minimumClusterSize ?? 2;
  this._clusterBillboards = options.clusterBillboards ?? true;
  this._clusterLabels = options.clusterLabels ?? true;
  this._clusterPoints = options.clusterPoints ?? true;

  this._labelCollection = undefined;
  this._billboardCollection = undefined;
  this._pointCollection = undefined;

  this._clusterBillboardCollection = undefined;
  this._clusterLabelCollection = undefined;
  this._clusterPointCollection = undefined;

  this._collectionIndicesByEntity = {};

  this._unusedLabelIndices = [];
  this._unusedBillboardIndices = [];
  this._unusedPointIndices = [];

  this._previousClusters = [];
  this._previousHeight = undefined;

  this._enabledDirty = false;
  this._clusterDirty = false;

  this._cluster = undefined;
  this._removeEventListener = undefined;

  this._clusterEvent = new Event();

  /**
   * Determines if entities in this collection will be shown.
   *
   * @type {boolean}
   * @default true
   */
  this.show = options.show ?? true;
}

function expandBoundingBox(bbox, pixelRange) {
  bbox.x -= pixelRange;
  bbox.y -= pixelRange;
  bbox.width += pixelRange * 2.0;
  bbox.height += pixelRange * 2.0;
}

const labelBoundingBoxScratch = new BoundingRectangle();

function getBoundingBox(item, coord, pixelRange, entityCluster, result) {
  if (defined(item._labelCollection) && entityCluster._clusterLabels) {
    result = Label.getScreenSpaceBoundingBox(item, coord, result);
  } else if (
    defined(item._billboardCollection) &&
    entityCluster._clusterBillboards
  ) {
    result = Billboard.getScreenSpaceBoundingBox(item, coord, result);
  } else if (
    defined(item._pointPrimitiveCollection) &&
    entityCluster._clusterPoints
  ) {
    result = PointPrimitive.getScreenSpaceBoundingBox(item, coord, result);
  }

  expandBoundingBox(result, pixelRange);

  if (
    entityCluster._clusterLabels &&
    !defined(item._labelCollection) &&
    defined(item.id) &&
    hasLabelIndex(entityCluster, item.id.id) &&
    defined(item.id._label)
  ) {
    const labelIndex =
      entityCluster._collectionIndicesByEntity[item.id.id].labelIndex;
    const label = entityCluster._labelCollection.get(labelIndex);
    const labelBBox = Label.getScreenSpaceBoundingBox(
      label,
      coord,
      labelBoundingBoxScratch,
    );
    expandBoundingBox(labelBBox, pixelRange);
    result = BoundingRectangle.union(result, labelBBox, result);
  }

  return result;
}

function addNonClusteredItem(item, entityCluster) {
  item.clusterShow = true;

  if (
    !defined(item._labelCollection) &&
    defined(item.id) &&
    hasLabelIndex(entityCluster, item.id.id) &&
    defined(item.id._label)
  ) {
    const labelIndex =
      entityCluster._collectionIndicesByEntity[item.id.id].labelIndex;
    const label = entityCluster._labelCollection.get(labelIndex);
    label.clusterShow = true;
  }
}

function addCluster(position, numPoints, ids, entityCluster) {
  const cluster = {
    billboard: entityCluster._clusterBillboardCollection.add(),
    label: entityCluster._clusterLabelCollection.add(),
    point: entityCluster._clusterPointCollection.add(),
  };

  cluster.billboard.show = false;
  cluster.point.show = false;
  cluster.label.show = true;
  cluster.label.text = numPoints.toLocaleString();
  cluster.label.id = ids;
  cluster.billboard.position =
    cluster.label.position =
    cluster.point.position =
      position;

  entityCluster._clusterEvent.raiseEvent(ids, cluster);
}

function hasLabelIndex(entityCluster, entityId) {
  return (
    defined(entityCluster) &&
    defined(entityCluster._collectionIndicesByEntity[entityId]) &&
    defined(entityCluster._collectionIndicesByEntity[entityId].labelIndex)
  );
}

function getScreenSpacePositions(
  collection,
  points,
  scene,
  occluder,
  entityCluster,
) {
  if (!defined(collection)) {
    return;
  }

  const length = collection.length;
  for (let i = 0; i < length; ++i) {
    const item = collection.get(i);
    item.clusterShow = false;

    if (
      !item.show ||
      (entityCluster._scene.mode === SceneMode.SCENE3D &&
        !occluder.isPointVisible(item.position))
    ) {
      continue;
    }

    const canClusterLabels =
      entityCluster._clusterLabels && defined(item._labelCollection);
    const canClusterBillboards =
      entityCluster._clusterBillboards && defined(item.id._billboard);
    const canClusterPoints =
      entityCluster._clusterPoints && defined(item.id._point);
    if (canClusterLabels && (canClusterPoints || canClusterBillboards)) {
      continue;
    }

    const coord = item.computeScreenSpacePosition(scene);
    if (!defined(coord)) {
      continue;
    }

    points.push({
      index: i,
      collection: collection,
      clustered: false,
      coord: coord,
    });
  }
}

const pointBoundinRectangleScratch = new BoundingRectangle();
const totalBoundingRectangleScratch = new BoundingRectangle();
const neighborBoundingRectangleScratch = new BoundingRectangle();

function createDeclutterCallback(entityCluster) {
  return function (amount) {
    if ((defined(amount) && amount < 0.05) || !entityCluster.enabled) {
      return;
    }

    const scene = entityCluster._scene;

    const labelCollection = entityCluster._labelCollection;
    const billboardCollection = entityCluster._billboardCollection;
    const pointCollection = entityCluster._pointCollection;

    if (
      (!defined(labelCollection) &&
        !defined(billboardCollection) &&
        !defined(pointCollection)) ||
      (!entityCluster._clusterBillboards &&
        !entityCluster._clusterLabels &&
        !entityCluster._clusterPoints)
    ) {
      return;
    }

    let clusteredLabelCollection = entityCluster._clusterLabelCollection;
    let clusteredBillboardCollection =
      entityCluster._clusterBillboardCollection;
    let clusteredPointCollection = entityCluster._clusterPointCollection;

    if (defined(clusteredLabelCollection)) {
      clusteredLabelCollection.removeAll();
    } else {
      clusteredLabelCollection = entityCluster._clusterLabelCollection =
        new LabelCollection({
          scene: scene,
        });
    }

    if (defined(clusteredBillboardCollection)) {
      clusteredBillboardCollection.removeAll();
    } else {
      clusteredBillboardCollection = entityCluster._clusterBillboardCollection =
        new BillboardCollection({
          scene: scene,
        });
    }

    if (defined(clusteredPointCollection)) {
      clusteredPointCollection.removeAll();
    } else {
      clusteredPointCollection = entityCluster._clusterPointCollection =
        new PointPrimitiveCollection();
    }

    const pixelRange = entityCluster._pixelRange;
    const minimumClusterSize = entityCluster._minimumClusterSize;

    const clusters = entityCluster._previousClusters;
    const newClusters = [];

    const previousHeight = entityCluster._previousHeight;
    const currentHeight = scene.camera.positionCartographic.height;

    const ellipsoid = scene.ellipsoid;
    const cameraPosition = scene.camera.positionWC;
    const occluder = new EllipsoidalOccluder(ellipsoid, cameraPosition);

    const points = [];
    if (entityCluster._clusterLabels) {
      getScreenSpacePositions(
        labelCollection,
        points,
        scene,
        occluder,
        entityCluster,
      );
    }
    if (entityCluster._clusterBillboards) {
      getScreenSpacePositions(
        billboardCollection,
        points,
        scene,
        occluder,
        entityCluster,
      );
    }
    if (entityCluster._clusterPoints) {
      getScreenSpacePositions(
        pointCollection,
        points,
        scene,
        occluder,
        entityCluster,
      );
    }

    let i;
    let j;
    let length;
    let bbox;
    let neighbors;
    let neighborLength;
    let neighborIndex;
    let neighborPoint;
    let ids;
    let numPoints;

    let collection;
    let collectionIndex;

    if (points.length > 0) {
      const index = new KDBush(points.length, 64, Uint32Array);
      for (let p = 0; p < points.length; ++p) {
        index.add(points[p].coord.x, points[p].coord.y);
      }
      index.finish();

      if (currentHeight < previousHeight) {
        /**
         * 动态调整聚类范围：相机高度降低意味着视野变窄，原有聚类范围可能过大。算法会按高度比例缩小聚类范围（width = cluster.width * factor），并检查缩小后的范围内是否仍有足够多的点。
         * 避免突然消失：如果直接丢弃所有旧聚类重新计算，会导致视觉上的"闪烁"或"跳跃"。渐进式调整能保持视觉连续性。
         * 性能优化：优先复用已有聚类，减少不必要的重新计算。
         */
        length = clusters.length;
        for (i = 0; i < length; ++i) {
          const cluster = clusters[i];

          if (!occluder.isPointVisible(cluster.position)) {
            continue;
          }

          const coord = Billboard._computeScreenSpacePosition(
            Matrix4.IDENTITY,
            cluster.position,
            Cartesian3.ZERO,
            Cartesian2.ZERO,
            scene,
          );
          if (!defined(coord)) {
            continue;
          }

          const factor = 1.0 - currentHeight / previousHeight;
          let width = (cluster.width = cluster.width * factor);
          let height = (cluster.height = cluster.height * factor);

          width = Math.max(width, cluster.minimumWidth);
          height = Math.max(height, cluster.minimumHeight);

          const minX = coord.x - width * 0.5;
          const minY = coord.y - height * 0.5;
          const maxX = coord.x + width;
          const maxY = coord.y + height;

          neighbors = index.range(minX, minY, maxX, maxY);
          neighborLength = neighbors.length;
          numPoints = 0;
          ids = [];

          for (j = 0; j < neighborLength; ++j) {
            neighborIndex = neighbors[j];
            neighborPoint = points[neighborIndex];
            if (!neighborPoint.clustered) {
              ++numPoints;

              collection = neighborPoint.collection;
              collectionIndex = neighborPoint.index;
              ids.push(collection.get(collectionIndex).id);
            }
          }

          if (numPoints >= minimumClusterSize) {
            addCluster(cluster.position, numPoints, ids, entityCluster);
            newClusters.push(cluster);

            for (j = 0; j < neighborLength; ++j) {
              points[neighbors[j]].clustered = true;
            }
          }
        }
      }
      /**
       * 第一阶段完成后，再处理未被任何聚类包含的点：
       * 捕获新增实体：新添加到场景的实体可能不在任何已有聚类中。
       * 处理相机升高时的扩散：当相机升高时（currentHeight >= previousHeight），旧聚类范围可能过小，需要重新寻找新的聚类组合。
       * 填充空白区域：确保所有符合条件的邻近点都能被聚类，无遗漏。
       * 适用场景：新增实体、相机升高、或之前因范围限制未被聚类的点。
       * 为什么不能只用一阶段？
       * 如果只处理新聚类：
       * 相机缓慢降低时，会出现"聚类范围过大但点密度不足"的问题，导致本应显示的聚类突然消失。
       * 如果只处理已有聚类：
       * 新增实体或相机升高时，无法创建新的聚类，导致性能下降。
       */
      length = points.length;
      for (i = 0; i < length; ++i) {
        const point = points[i];
        if (point.clustered) {
          continue;
        }

        point.clustered = true;

        collection = point.collection;
        collectionIndex = point.index;

        const item = collection.get(collectionIndex);
        bbox = getBoundingBox(
          item,
          point.coord,
          pixelRange,
          entityCluster,
          pointBoundinRectangleScratch,
        );
        const totalBBox = BoundingRectangle.clone(
          bbox,
          totalBoundingRectangleScratch,
        );

        neighbors = index.range(
          bbox.x,
          bbox.y,
          bbox.x + bbox.width,
          bbox.y + bbox.height,
        );
        neighborLength = neighbors.length;

        const clusterPosition = Cartesian3.clone(item.position);
        numPoints = 1;
        ids = [item.id];

        for (j = 0; j < neighborLength; ++j) {
          neighborIndex = neighbors[j];
          neighborPoint = points[neighborIndex];
          if (!neighborPoint.clustered) {
            const neighborItem = neighborPoint.collection.get(
              neighborPoint.index,
            );
            const neighborBBox = getBoundingBox(
              neighborItem,
              neighborPoint.coord,
              pixelRange,
              entityCluster,
              neighborBoundingRectangleScratch,
            );

            Cartesian3.add(
              neighborItem.position,
              clusterPosition,
              clusterPosition,
            );

            BoundingRectangle.union(totalBBox, neighborBBox, totalBBox);
            ++numPoints;

            ids.push(neighborItem.id);
          }
        }

        if (numPoints >= minimumClusterSize) {
          const position = Cartesian3.multiplyByScalar(
            clusterPosition,
            1.0 / numPoints,
            clusterPosition,
          );
          addCluster(position, numPoints, ids, entityCluster);
          newClusters.push({
            position: position,
            width: totalBBox.width,
            height: totalBBox.height,
            minimumWidth: bbox.width,
            minimumHeight: bbox.height,
          });

          for (j = 0; j < neighborLength; ++j) {
            points[neighbors[j]].clustered = true;
          }
        } else {
          addNonClusteredItem(item, entityCluster);
        }
      }
    }

    if (clusteredLabelCollection.length === 0) {
      clusteredLabelCollection.destroy();
      entityCluster._clusterLabelCollection = undefined;
    }

    if (clusteredBillboardCollection.length === 0) {
      clusteredBillboardCollection.destroy();
      entityCluster._clusterBillboardCollection = undefined;
    }

    if (clusteredPointCollection.length === 0) {
      clusteredPointCollection.destroy();
      entityCluster._clusterPointCollection = undefined;
    }

    entityCluster._previousClusters = newClusters;
    entityCluster._previousHeight = currentHeight;
  };
}

EntityCluster.prototype._initialize = function (scene) {
  this._scene = scene;

  const cluster = createDeclutterCallback(this);
  this._cluster = cluster;
  this._removeEventListener = scene.camera.changed.addEventListener(cluster);
};

Object.defineProperties(EntityCluster.prototype, {
  /**
   * Gets or sets whether clustering is enabled.
   * @memberof EntityCluster.prototype
   * @type {boolean}
   */
  enabled: {
    get: function () {
      return this._enabled;
    },
    set: function (value) {
      this._enabledDirty = value !== this._enabled;
      this._enabled = value;
    },
  },
  /**
   * Gets or sets the pixel range to extend the screen space bounding box.
   * @memberof EntityCluster.prototype
   * @type {number}
   */
  pixelRange: {
    get: function () {
      return this._pixelRange;
    },
    set: function (value) {
      this._clusterDirty = this._clusterDirty || value !== this._pixelRange;
      this._pixelRange = value;
    },
  },
  /**
   * Gets or sets the minimum number of screen space objects that can be clustered.
   * @memberof EntityCluster.prototype
   * @type {number}
   */
  minimumClusterSize: {
    get: function () {
      return this._minimumClusterSize;
    },
    set: function (value) {
      this._clusterDirty =
        this._clusterDirty || value !== this._minimumClusterSize;
      this._minimumClusterSize = value;
    },
  },
  /**
   * Gets the event that will be raised when a new cluster will be displayed. The signature of the event listener is {@link EntityCluster.newClusterCallback}.
   * @memberof EntityCluster.prototype
   * @type {Event<EntityCluster.newClusterCallback>}
   */
  clusterEvent: {
    get: function () {
      return this._clusterEvent;
    },
  },
  /**
   * Gets or sets whether clustering billboard entities is enabled.
   * @memberof EntityCluster.prototype
   * @type {boolean}
   */
  clusterBillboards: {
    get: function () {
      return this._clusterBillboards;
    },
    set: function (value) {
      this._clusterDirty =
        this._clusterDirty || value !== this._clusterBillboards;
      this._clusterBillboards = value;
    },
  },
  /**
   * Gets or sets whether clustering labels entities is enabled.
   * @memberof EntityCluster.prototype
   * @type {boolean}
   */
  clusterLabels: {
    get: function () {
      return this._clusterLabels;
    },
    set: function (value) {
      this._clusterDirty = this._clusterDirty || value !== this._clusterLabels;
      this._clusterLabels = value;
    },
  },
  /**
   * Gets or sets whether clustering point entities is enabled.
   * @memberof EntityCluster.prototype
   * @type {boolean}
   */
  clusterPoints: {
    get: function () {
      return this._clusterPoints;
    },
    set: function (value) {
      this._clusterDirty = this._clusterDirty || value !== this._clusterPoints;
      this._clusterPoints = value;
    },
  },

  /**
   * Returns true when all clustered data has been rendered.
   * @memberof EntityCluster.prototype
   * @type {boolean}
   * @readonly
   * @private
   */
  ready: {
    get: function () {
      return (
        !this._enabledDirty &&
        !this._clusterDirty &&
        (!defined(this._billboardCollection) ||
          this._billboardCollection.ready) &&
        (!defined(this._labelCollection) || this._labelCollection.ready)
      );
    },
  },
});

function createGetEntity(
  collectionProperty,
  CollectionConstructor,
  unusedIndicesProperty,
  entityIndexProperty,
) {
  return function (entity) {
    let collection = this[collectionProperty];

    if (!defined(this._collectionIndicesByEntity)) {
      this._collectionIndicesByEntity = {};
    }

    let entityIndices = this._collectionIndicesByEntity[entity.id];

    if (!defined(entityIndices)) {
      entityIndices = this._collectionIndicesByEntity[entity.id] = {
        billboardIndex: undefined,
        labelIndex: undefined,
        pointIndex: undefined,
      };
    }

    if (defined(collection) && defined(entityIndices[entityIndexProperty])) {
      return collection.get(entityIndices[entityIndexProperty]);
    }

    if (!defined(collection)) {
      collection = this[collectionProperty] = new CollectionConstructor({
        scene: this._scene,
      });
    }

    let index;
    let entityItem;
    // 复用PointPrimitiveCollection/LabelCollection/BilboarCollection里的_pointPrimitives里item
    const unusedIndices = this[unusedIndicesProperty];
    if (unusedIndices.length > 0) {
      index = unusedIndices.shift();
      entityItem = collection.get(index);
    } else {
      entityItem = collection.add();
      index = collection.length - 1;
    }

    entityIndices[entityIndexProperty] = index;

    const that = this;
    Promise.resolve().then(function () {
      that._clusterDirty = true;
    });

    return entityItem;
  };
}

function removeEntityIndicesIfUnused(entityCluster, entityId) {
  const indices = entityCluster._collectionIndicesByEntity[entityId];

  if (
    !defined(indices.billboardIndex) &&
    !defined(indices.labelIndex) &&
    !defined(indices.pointIndex)
  ) {
    delete entityCluster._collectionIndicesByEntity[entityId];
  }
}

/**
 * Returns a new {@link Label}.
 * @param {Entity} entity The entity that will use the returned {@link Label} for visualization.
 * @returns {Label} The label that will be used to visualize an entity.
 *
 * @private
 */
EntityCluster.prototype.getLabel = createGetEntity(
  "_labelCollection",
  LabelCollection,
  "_unusedLabelIndices",
  "labelIndex",
);

/**
 * Removes the {@link Label} associated with an entity so it can be reused by another entity.
 * @param {Entity} entity The entity that will uses the returned {@link Label} for visualization.
 *
 * @private
 */
EntityCluster.prototype.removeLabel = function (entity) {
  const entityIndices =
    this._collectionIndicesByEntity &&
    this._collectionIndicesByEntity[entity.id];
  if (
    !defined(this._labelCollection) ||
    !defined(entityIndices) ||
    !defined(entityIndices.labelIndex)
  ) {
    return;
  }

  const index = entityIndices.labelIndex;
  entityIndices.labelIndex = undefined;
  removeEntityIndicesIfUnused(this, entity.id);

  const label = this._labelCollection.get(index);
  label.show = false;
  label.text = "";
  label.id = undefined;

  this._unusedLabelIndices.push(index);

  this._clusterDirty = true;
};

/**
 * Returns a new {@link Billboard}.
 * @param {Entity} entity The entity that will use the returned {@link Billboard} for visualization.
 * @returns {Billboard} The label that will be used to visualize an entity.
 * 在pointVisualizer或者billVisualizer调用
 * @private
 */
EntityCluster.prototype.getBillboard = createGetEntity(
  "_billboardCollection",
  BillboardCollection,
  "_unusedBillboardIndices",
  "billboardIndex",
);

/**
 * Removes the {@link Billboard} associated with an entity so it can be reused by another entity.
 * @param {Entity} entity The entity that will uses the returned {@link Billboard} for visualization.
 *
 * @private
 */
EntityCluster.prototype.removeBillboard = function (entity) {
  const entityIndices =
    this._collectionIndicesByEntity &&
    this._collectionIndicesByEntity[entity.id];
  if (
    !defined(this._billboardCollection) ||
    !defined(entityIndices) ||
    !defined(entityIndices.billboardIndex)
  ) {
    return;
  }

  const index = entityIndices.billboardIndex;
  entityIndices.billboardIndex = undefined;
  removeEntityIndicesIfUnused(this, entity.id);

  const billboard = this._billboardCollection.get(index);
  billboard.id = undefined;
  billboard.show = false;
  billboard.image = undefined;

  this._unusedBillboardIndices.push(index);

  this._clusterDirty = true;
};

/**
 * Returns a new {@link Point}.
 * @param {Entity} entity The entity that will use the returned {@link Point} for visualization.
 * @returns {Point} The label that will be used to visualize an entity.
 * pointVisualizer调用
 * @private
 */
EntityCluster.prototype.getPoint = createGetEntity(
  "_pointCollection",
  PointPrimitiveCollection,
  "_unusedPointIndices",
  "pointIndex",
);

/**
 * Removes the {@link Point} associated with an entity so it can be reused by another entity.
 * @param {Entity} entity The entity that will uses the returned {@link Point} for visualization.
 *
 * @private
 */
EntityCluster.prototype.removePoint = function (entity) {
  const entityIndices =
    this._collectionIndicesByEntity &&
    this._collectionIndicesByEntity[entity.id];
  if (
    !defined(this._pointCollection) ||
    !defined(entityIndices) ||
    !defined(entityIndices.pointIndex)
  ) {
    return;
  }

  const index = entityIndices.pointIndex;
  entityIndices.pointIndex = undefined;
  removeEntityIndicesIfUnused(this, entity.id);

  const point = this._pointCollection.get(index);
  point.show = false;
  point.id = undefined;

  this._unusedPointIndices.push(index);

  this._clusterDirty = true;
};

function disableCollectionClustering(collection) {
  if (!defined(collection)) {
    return;
  }

  const length = collection.length;
  for (let i = 0; i < length; ++i) {
    collection.get(i).clusterShow = true;
  }
}

function updateEnable(entityCluster) {
  if (entityCluster.enabled) {
    return;
  }

  if (defined(entityCluster._clusterLabelCollection)) {
    entityCluster._clusterLabelCollection.destroy();
  }
  if (defined(entityCluster._clusterBillboardCollection)) {
    entityCluster._clusterBillboardCollection.destroy();
  }
  if (defined(entityCluster._clusterPointCollection)) {
    entityCluster._clusterPointCollection.destroy();
  }

  entityCluster._clusterLabelCollection = undefined;
  entityCluster._clusterBillboardCollection = undefined;
  entityCluster._clusterPointCollection = undefined;

  disableCollectionClustering(entityCluster._labelCollection);
  disableCollectionClustering(entityCluster._billboardCollection);
  disableCollectionClustering(entityCluster._pointCollection);
}

/**
 * 被添加到scene.primitives中，update函数会在scene.updateAndRenderPrimitives中调用
 * Gets the draw commands for the clustered billboards/points/labels if enabled, otherwise,
 * queues the draw commands for billboards/points/labels created for entities.
 * @private
 */
EntityCluster.prototype.update = function (frameState) {
  if (!this.show) {
    return;
  }

  // If clustering is enabled before the label collection is updated,
  // the glyphs haven't been created so the screen space bounding boxes
  // are incorrect.
  let commandList;
  const labelCollection = this._labelCollection;
  if (
    defined(labelCollection) &&
    labelCollection.length > 0 &&
    !labelCollection.ready
  ) {
    commandList = frameState.commandList;
    frameState.commandList = [];
    labelCollection.update(frameState);
    frameState.commandList = commandList;
  }

  // If clustering is enabled before the billboard collections are updated,
  // the images haven't been added to the image atlas so the screen space bounding boxes
  // are incorrect.
  const billboardCollection = this._billboardCollection;
  if (
    defined(billboardCollection) &&
    billboardCollection.length > 0 &&
    !billboardCollection.ready
  ) {
    commandList = frameState.commandList;
    frameState.commandList = [];
    billboardCollection.update(frameState);
    frameState.commandList = commandList;
  }

  if (this._enabledDirty) {
    this._enabledDirty = false;
    updateEnable(this);
    this._clusterDirty = true;
  }

  if (this._clusterDirty) {
    this._cluster(); // 函数内会判断是否要进行聚合

    // Unless all existing billboards and labels were clustered, clustering will need to execute again next frame
    this._clusterDirty =
      (defined(labelCollection) && !labelCollection.ready) ||
      (defined(billboardCollection) && !billboardCollection.ready);
  }

  /**
   * 聚合collection的渲染
   */
  if (defined(this._clusterLabelCollection)) {
    this._clusterLabelCollection.update(frameState);
  }
  if (defined(this._clusterBillboardCollection)) {
    this._clusterBillboardCollection.update(frameState);
  }
  if (defined(this._clusterPointCollection)) {
    this._clusterPointCollection.update(frameState);
  }

  /**
   * 非聚合collection的渲染
   */
  if (defined(this._labelCollection)) {
    this._labelCollection.update(frameState);
  }
  if (defined(billboardCollection)) {
    billboardCollection.update(frameState);
  }
  if (defined(this._pointCollection)) {
    this._pointCollection.update(frameState);
  }
};

/**
 * Destroys the WebGL resources held by this object.  Destroying an object allows for deterministic
 * release of WebGL resources, instead of relying on the garbage collector to destroy this object.
 * <p>
 * Unlike other objects that use WebGL resources, this object can be reused. For example, if a data source is removed
 * from a data source collection and added to another.
 * </p>
 */
EntityCluster.prototype.destroy = function () {
  if (defined(this._removeEventListener)) {
    this._removeEventListener();
    this._removeEventListener = undefined;
  }

  this._labelCollection =
    this._labelCollection && this._labelCollection.destroy();
  this._billboardCollection =
    this._billboardCollection && this._billboardCollection.destroy();
  this._pointCollection =
    this._pointCollection && this._pointCollection.destroy();

  this._clusterLabelCollection =
    this._clusterLabelCollection && this._clusterLabelCollection.destroy();
  this._clusterBillboardCollection =
    this._clusterBillboardCollection &&
    this._clusterBillboardCollection.destroy();
  this._clusterPointCollection =
    this._clusterPointCollection && this._clusterPointCollection.destroy();

  this._labelCollection = undefined;
  this._billboardCollection = undefined;
  this._pointCollection = undefined;

  this._clusterBillboardCollection = undefined;
  this._clusterLabelCollection = undefined;
  this._clusterPointCollection = undefined;

  this._collectionIndicesByEntity = undefined;

  this._unusedLabelIndices = [];
  this._unusedBillboardIndices = [];
  this._unusedPointIndices = [];

  this._previousClusters = [];
  this._previousHeight = undefined;

  this._enabledDirty = false;
  this._pixelRangeDirty = false;
  this._minimumClusterSizeDirty = false;

  return undefined;
};

/**
 * A event listener function used to style clusters.
 * @callback EntityCluster.newClusterCallback
 *
 * @param {Entity[]} clusteredEntities An array of the entities contained in the cluster.
 * @param {object} cluster An object containing the Billboard, Label, and Point
 * primitives that represent this cluster of entities.
 * @param {Billboard} cluster.billboard
 * @param {Label} cluster.label
 * @param {PointPrimitive} cluster.point
 *
 * @example
 * // The default cluster values.
 * dataSource.clustering.clusterEvent.addEventListener(function(entities, cluster) {
 *     cluster.label.show = true;
 *     cluster.label.text = entities.length.toLocaleString();
 * });
 */
export default EntityCluster;
