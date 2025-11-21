import Cartesian2 from "../Core/Cartesian2.js";
import Cartesian3 from "../Core/Cartesian3.js";
import ComponentDatatype from "../Core/ComponentDatatype.js";
import ContextLimits from "../Renderer/ContextLimits.js";
import defined from "../Core/defined.js";
import destroyObject from "../Core/destroyObject.js";
import DeveloperError from "../Core/DeveloperError.js";
import CesiumMath from "../Core/Math.js";
import MetadataComponentType from "./MetadataComponentType.js";
import PixelDatatype from "../Renderer/PixelDatatype.js";
import PixelFormat from "../Core/PixelFormat.js";
import RuntimeError from "../Core/RuntimeError.js";
import Sampler from "../Renderer/Sampler.js";
import Texture from "../Renderer/Texture.js";
import TextureMagnificationFilter from "../Renderer/TextureMagnificationFilter.js";
import TextureMinificationFilter from "../Renderer/TextureMinificationFilter.js";
import TextureWrap from "../Renderer/TextureWrap.js";

/**
 * @alias Megatexture
 * @constructor
 *
 * @param {Context} context The context in which to create GPU resources.
 * @param {Cartesian3} dimensions The number of voxels in each dimension of the tile.
 * @param {number} channelCount The number of channels in the metadata.
 * @param {MetadataComponentType} componentType The component type of the metadata.
 * @param {number} [availableTextureMemoryBytes=134217728] An upper limit on the texture memory size in bytes.
 *
 * @private
 */
function Megatexture(
  context,
  dimensions,
  channelCount,
  componentType,
  availableTextureMemoryBytes,
) {
  const maximumTextureMemoryByteLength = 512 * 1024 * 1024;
  availableTextureMemoryBytes = Math.min(
    availableTextureMemoryBytes ?? 128 * 1024 * 1024,
    maximumTextureMemoryByteLength,
  );

  // TODO there are a lot of texture packing rules, see https://github.com/CesiumGS/cesium/issues/9572
  // Unsigned short textures not allowed in webgl 1, so treat as float
  if (componentType === MetadataComponentType.UNSIGNED_SHORT) {
    componentType = MetadataComponentType.FLOAT32;
  }

  if (
    componentType === MetadataComponentType.FLOAT32 &&
    !context.floatingPointTexture
  ) {
    throw new RuntimeError("Floating point texture not supported");
  }

  const pixelDataType = getPixelDataType(componentType);
  const pixelFormat = getPixelFormat(channelCount, context.webgl2);
  const componentTypeByteLength =
    MetadataComponentType.getSizeInBytes(componentType);
  const textureDimension = getTextureDimension(
    availableTextureMemoryBytes,
    channelCount,
    componentTypeByteLength,
  );
  // 一个三维立方体从z方向进行切片，切片的数量为z;
  // sliceCountPerRegionX * sliceCountPerRegionY = Math.ceil(Math.sqrt(dimensions.x)) * Math.ceil(dimensions.z / Math.ceil(Math.sqrt(dimensions.x))) >= z
  // 这里为什么要用开根方，不清楚，可能让所有的切片更加集中些，是个方形最好
  const sliceCountPerRegionX = Math.ceil(Math.sqrt(dimensions.x)); // 表示在纹理X方向上每个区域的切片数量，一个切片的尺寸是dimension.xy
  const sliceCountPerRegionY = Math.ceil(dimensions.z / sliceCountPerRegionX); // 指的是在三维Tile中xz平面向y轴方向切片，sliceCountPerRegionX和sliceCountPerRegionY指的是纹理x方向和y方向
  const voxelCountPerRegionX = sliceCountPerRegionX * dimensions.x; // 区域X方向上的体素数量
  const voxelCountPerRegionY = sliceCountPerRegionY * dimensions.y;
  const regionCountPerMegatextureX = Math.floor( // 整张纹理上x方向上有多少个区域
    textureDimension / voxelCountPerRegionX
  );
  const regionCountPerMegatextureY = Math.floor(
    textureDimension / voxelCountPerRegionY,
  );

  if (regionCountPerMegatextureX === 0 || regionCountPerMegatextureY === 0) {
    throw new RuntimeError("Tileset is too large to fit into megatexture");
  }

  /**
   * @type {number}
   * @readonly
   */
  this.channelCount = channelCount;

  /**
   * @type {MetadataComponentType}
   * @readonly
   */
  this.componentType = componentType;

  /**
   * @type {number}
   * @readonly
   */
  this.textureMemoryByteLength =
    componentTypeByteLength * channelCount * textureDimension ** 2;

  /**
   * @type {Cartesian3}
   * @readonly
   */
  this.voxelCountPerTile = Cartesian3.clone(dimensions, new Cartesian3());

  /**
   * 一个区域代表一个Tile，一个区域存放tile的体素的三维信息
   * @type {number}
   * @readonly
   */
  this.maximumTileCount =
    regionCountPerMegatextureX * regionCountPerMegatextureY;

  /**
   * @type {Cartesian2}
   * @readonly
   */
  this.regionCountPerMegatexture = new Cartesian2(
    regionCountPerMegatextureX,
    regionCountPerMegatextureY,
  );

  /**
   * @type {Cartesian2}
   * @readonly
   */
  this.voxelCountPerRegion = new Cartesian2(
    voxelCountPerRegionX,
    voxelCountPerRegionY,
  );

  /**
   * @type {Cartesian2}
   * @readonly
   */
  this.sliceCountPerRegion = new Cartesian2(
    sliceCountPerRegionX,
    sliceCountPerRegionY,
  );

  /**
   * @type {Cartesian2}
   * @readonly
   */
  this.voxelSizeUv = new Cartesian2(
    1.0 / textureDimension,
    1.0 / textureDimension,
  );

  /**
   * @type {Cartesian2}
   * @readonly
   */
  this.sliceSizeUv = new Cartesian2(
    dimensions.x / textureDimension,
    dimensions.y / textureDimension,
  );

  /**
   * @type {Cartesian2}
   * @readonly
   */
  this.regionSizeUv = new Cartesian2(
    voxelCountPerRegionX / textureDimension,
    voxelCountPerRegionY / textureDimension,
  );

  /**
   * @type {Texture}
   * @readonly
   */
  this.texture = new Texture({
    context: context,
    pixelFormat: pixelFormat,
    pixelDatatype: pixelDataType,
    flipY: false,
    width: textureDimension,
    height: textureDimension,
    sampler: new Sampler({
      wrapS: TextureWrap.CLAMP_TO_EDGE,
      wrapT: TextureWrap.CLAMP_TO_EDGE,
      minificationFilter: TextureMinificationFilter.LINEAR,
      magnificationFilter: TextureMagnificationFilter.LINEAR,
    }),
  });

  const componentDatatype =
    MetadataComponentType.toComponentDatatype(componentType);

  /**
   * @type {Array} 一个区域
   */
  this.tileVoxelDataTemp = ComponentDatatype.createTypedArray(
    componentDatatype,
    voxelCountPerRegionX * voxelCountPerRegionY * channelCount,
  );

  /**
   * @type {MegatextureNode[]}
   * @readonly
   */
  this.nodes = new Array(this.maximumTileCount);
  for (let tileIndex = 0; tileIndex < this.maximumTileCount; tileIndex++) {
    this.nodes[tileIndex] = new MegatextureNode(tileIndex);
  }
  for (let tileIndex = 0; tileIndex < this.maximumTileCount; tileIndex++) {
    const node = this.nodes[tileIndex];
    node.previousNode = tileIndex > 0 ? this.nodes[tileIndex - 1] : undefined;
    node.nextNode =
      tileIndex < this.maximumTileCount - 1
        ? this.nodes[tileIndex + 1]
        : undefined;
  }

  /**
   * @type {MegatextureNode}
   * @readonly
   */
  this.occupiedList = undefined;

  /**
   * @type {MegatextureNode}
   * @readonly
   */
  this.emptyList = this.nodes[0];

  /**
   * @type {number}
   * @readonly
   */
  this.occupiedCount = 0;
}

/**
 * Get the pixel data type to use in a megatexture.
 * TODO support more
 *
 * @param {MetadataComponentType} componentType The component type of the metadata.
 * @returns {PixelDatatype} The pixel datatype to use for a megatexture.
 *
 * @private
 */
function getPixelDataType(componentType) {
  if (
    componentType === MetadataComponentType.FLOAT32 ||
    componentType === MetadataComponentType.FLOAT64
  ) {
    return PixelDatatype.FLOAT;
  } else if (componentType === MetadataComponentType.UINT8) {
    return PixelDatatype.UNSIGNED_BYTE;
  }
}

/**
 * Get the pixel format to use for a megatexture.
 *
 * @param {number} channelCount The number of channels in the metadata. Must be 1 to 4.
 * @param {boolean} webgl2 true if the context is using webgl2
 * @returns {PixelFormat} The pixel format to use for a megatexture.
 *
 * @private
 */
function getPixelFormat(channelCount, webgl2) {
  if (channelCount === 1) {
    return webgl2 ? PixelFormat.RED : PixelFormat.LUMINANCE;
  } else if (channelCount === 2) {
    return webgl2 ? PixelFormat.RG : PixelFormat.LUMINANCE_ALPHA;
  } else if (channelCount === 3) {
    return PixelFormat.RGB;
  } else if (channelCount === 4) {
    return PixelFormat.RGBA;
  }
}

/**
 * Compute the largest size of a square texture that will fit in the available memory.
 *
 * @param {number} availableTextureMemoryBytes An upper limit on the texture memory size.
 * @param {number} channelCount The number of metadata channels per texel.
 * @param {number} componentByteLength The byte length of each component of the metadata.
 * @returns {number} The dimension of the square texture to use for the megatexture.
 *
 * @private
 */
function getTextureDimension(
  availableTextureMemoryBytes,
  channelCount,
  componentByteLength,
) {
  // Compute how many texels will fit in the available memory // 可以容纳体素的数量
  const texelCount = Math.floor(
    availableTextureMemoryBytes / (channelCount * componentByteLength),
  );
  // Return the largest power of two texture size that will fit in memory // 纹理的大小（宽高相同）s
  return Math.min(
    ContextLimits.maximumTextureSize,
    CesiumMath.previousPowerOfTwo(Math.floor(Math.sqrt(texelCount))),
  );
}

/**
 * @alias MegatextureNode
 * @constructor
 *
 * @param {number} index
 *
 * @private
 */
function MegatextureNode(index) {
  /**
   * @type {number}
   */
  this.index = index;

  /**
   * @type {MegatextureNode}
   */
  this.nextNode = undefined;

  /**
   * @type {MegatextureNode}
   */
  this.previousNode = undefined;
}

/**
 * Add an array of tile metadata to the megatexture.
 * @param {Array} data The data to be added.
 * @returns {number} The index of the tile's location in the megatexture.
 */
Megatexture.prototype.add = function (data) {
  if (this.isFull()) {
    throw new DeveloperError("Trying to add when there are no empty spots");
  }

  // remove head of empty list
  const node = this.emptyList;
  this.emptyList = this.emptyList.nextNode;
  if (defined(this.emptyList)) {
    // 标记为第一个空node
    this.emptyList.previousNode = undefined;
  }

  // 每次添加的node放到list的最前面
  // make head of occupied list
  node.nextNode = this.occupiedList;
  if (defined(node.nextNode)) {
    node.nextNode.previousNode = node;
  }
  this.occupiedList = node;

  const index = node.index;
  this.writeDataToTexture(index, data);

  this.occupiedCount++;
  return index;
};

/**
 * @param {number} index
 */
Megatexture.prototype.remove = function (index) {
  if (index < 0 || index >= this.maximumTileCount) {
    throw new DeveloperError("Megatexture index out of bounds");
  }

  // remove from list
  const node = this.nodes[index];
  if (defined(node.previousNode)) {
    node.previousNode.nextNode = node.nextNode;
  }
  if (defined(node.nextNode)) {
    node.nextNode.previousNode = node.previousNode;
  }

  // make head of empty list
  node.nextNode = this.emptyList;
  if (defined(node.nextNode)) {
    node.nextNode.previousNode = node;
  }
  node.previousNode = undefined;
  this.emptyList = node;
  this.occupiedCount--;
};

/**
 * @returns {boolean}
 */
Megatexture.prototype.isFull = function () {
  return this.emptyList === undefined;
};

/**
 * @param {number} tileCount The total number of tiles in the tileset.
 * @param {Cartesian3} dimensions The number of voxels in each dimension of the tile.
 * @param {number} channelCount The number of channels in the metadata.
 * @param {MetadataComponentType} componentType The type of one channel of the metadata.
 * @returns {number}
 */
Megatexture.getApproximateTextureMemoryByteLength = function (
  tileCount,
  dimensions,
  channelCount,
  componentType,
) {
  // TODO there's a lot of code duplicate with Megatexture constructor

  // Unsigned short textures not allowed in webgl 1, so treat as float
  if (componentType === MetadataComponentType.UNSIGNED_SHORT) {
    componentType = MetadataComponentType.FLOAT32;
  }

  const datatypeSizeInBytes =
    MetadataComponentType.getSizeInBytes(componentType);
  const voxelCountTotal =
    tileCount * dimensions.x * dimensions.y * dimensions.z;

  const sliceCountPerRegionX = Math.ceil(Math.sqrt(dimensions.x));
  const sliceCountPerRegionY = Math.ceil(dimensions.z / sliceCountPerRegionX);
  const voxelCountPerRegionX = sliceCountPerRegionX * dimensions.x;
  const voxelCountPerRegionY = sliceCountPerRegionY * dimensions.y;

  // Find the power of two that can fit all tile data, accounting for slices.
  // There's probably a non-iterative solution for this, but this is good enough for now.
  let textureDimension = CesiumMath.previousPowerOfTwo(
    Math.floor(Math.sqrt(voxelCountTotal)),
  );
  for (;;) {
    const regionCountX = Math.floor(textureDimension / voxelCountPerRegionX);
    const regionCountY = Math.floor(textureDimension / voxelCountPerRegionY);
    const regionCount = regionCountX * regionCountY;
    if (regionCount >= tileCount) {
      break;
    } else {
      textureDimension *= 2;
    }
  }

  const textureMemoryByteLength =
    textureDimension * textureDimension * channelCount * datatypeSizeInBytes;
  return textureMemoryByteLength;
};

/**
 * Write an array of tile metadata to the megatexture.
 * @param {number} index The index of the tile's location in the megatexture.
 * @param {Float32Array|Uint16Array|Uint8Array} data The data to be written.
 */
Megatexture.prototype.writeDataToTexture = function (index, data) {
  // Unsigned short textures not allowed in webgl 1, so treat as float
  const tileData =
    data.constructor === Uint16Array ? new Float32Array(data) : data;

  const {
    tileVoxelDataTemp,
    voxelCountPerTile,
    sliceCountPerRegion,
    voxelCountPerRegion,
    channelCount,
    regionCountPerMegatexture,
  } = this;

  for (let z = 0; z < voxelDimensionsPerTile.z; z++) { // 在z轴方向进行切片
    // 计算切片起始位置
    const sliceVoxelOffsetX = (z % sliceCountPerRegion.x) * voxelCountPerTile.x;
    const sliceVoxelOffsetY =
      Math.floor(z / sliceCountPerRegion.x) * voxelCountPerTile.y;
    for (let y = 0; y < voxelCountPerTile.y; y++) {
      const readOffset = getReadOffset(voxelCountPerTile, y, z);
      const writeOffset =
        (sliceVoxelOffsetY + y) * voxelCountPerRegion.x + sliceVoxelOffsetX;
      for (let x = 0; x < voxelCountPerTile.x; x++) {
        const readIndex = readOffset + x;
        const writeIndex = writeOffset + x;
        for (let c = 0; c < channelCount; c++) {
          tileVoxelDataTemp[writeIndex * channelCount + c] =
            tileData[readIndex * channelCount + c];
        }
      }
    }
  }

  const voxelOffsetX =
    (index % regionCountPerMegatexture.x) * voxelCountPerRegion.x;
  const voxelOffsetY =
    Math.floor(index / regionCountPerMegatexture.x) * voxelCountPerRegion.y;

  const source = {
    arrayBufferView: tileVoxelDataTemp,
    width: voxelCountPerRegion.x,
    height: voxelCountPerRegion.y,
  };

  const copyOptions = {
    source: source,
    xOffset: voxelOffsetX,
    yOffset: voxelOffsetY,
  };

  this.texture.copyFrom(copyOptions);
};

/**
 * Get the offset into the data array for a given row of contiguous voxel data.
 *
 * @param {Cartesian3} dimensions The number of voxels in each dimension of the tile.
 * @param {number} y The y index of the voxel row
 * @param {number} z The z index of the voxel row
 * @returns {number} The offset into the data array
 * @private
 */
function getReadOffset(dimensions, y, z) {
  const voxelsPerInputSlice = dimensions.y * dimensions.x;
  const sliceIndex = z;
  const rowIndex = y;
  return sliceIndex * voxelsPerInputSlice + rowIndex * dimensions.x;
}

/**
 * Returns true if this object was destroyed; otherwise, false.
 * <br /><br />
 * If this object was destroyed, it should not be used; calling any function other than
 * <code>isDestroyed</code> will result in a {@link DeveloperError} exception.
 *
 * @returns {boolean} <code>true</code> if this object was destroyed; otherwise, <code>false</code>.
 *
 * @see Megatexture#destroy
 */
Megatexture.prototype.isDestroyed = function () {
  return false;
};

/**
 * Destroys the WebGL resources held by this object.  Destroying an object allows for deterministic
 * release of WebGL resources, instead of relying on the garbage collector to destroy this object.
 * <br /><br />
 * Once an object is destroyed, it should not be used; calling any function other than
 * <code>isDestroyed</code> will result in a {@link DeveloperError} exception.  Therefore,
 * assign the return value (<code>undefined</code>) to the object as done in the example.
 *
 * @exception {DeveloperError} This object was destroyed, i.e., destroy() was called.
 *
 * @see Megatexture#isDestroyed
 *
 * @example
 * megatexture = megatexture && megatexture.destroy();
 */
Megatexture.prototype.destroy = function () {
  this.texture = this.texture && this.texture.destroy();
  return destroyObject(this);
};

export default Megatexture;
