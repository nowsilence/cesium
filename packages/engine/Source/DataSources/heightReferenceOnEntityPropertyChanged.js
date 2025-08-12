import defined from "../Core/defined.js";
import CallbackProperty from "./CallbackProperty.js";
import GeometryUpdater from "./GeometryUpdater.js";
import TerrainOffsetProperty from "./TerrainOffsetProperty.js";

function heightReferenceOnEntityPropertyChanged(
  entity,
  propertyName,
  newValue,
  oldValue
) {
  // 调用父类方法 只有box/Cylinder/Ellipsoid
  GeometryUpdater.prototype._onEntityPropertyChanged.call(
    this,
    entity,
    propertyName,
    newValue,
    oldValue
  );
  if (this._observedPropertyNames.indexOf(propertyName) === -1) {
    return;
  }
  // 这个geometry其实是***Graphics
  const geometry = this._entity[this._geometryPropertyName];
  if (!defined(geometry)) {
    return;
  }

  if (defined(this._terrainOffsetProperty)) {
    this._terrainOffsetProperty.destroy();
    this._terrainOffsetProperty = undefined;
  }

  // 体渲染的话，没有extrudeHeight，所以只用到了heightReference
  const heightReferenceProperty = geometry.heightReference;

  if (defined(heightReferenceProperty)) {
    const centerPosition = new CallbackProperty(
      this._computeCenter.bind(this),
      !this._dynamic
    );
    this._terrainOffsetProperty = new TerrainOffsetProperty(
      this._scene,
      centerPosition,
      heightReferenceProperty
    );
  }
}
export default heightReferenceOnEntityPropertyChanged;
