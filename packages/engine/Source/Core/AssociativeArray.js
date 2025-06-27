import defined from "./defined.js";
import DeveloperError from "./DeveloperError.js";

/**
 * A collection of key-value pairs that is stored as a hash for easy
 * lookup but also provides an array for fast iteration.
 * 暂且称之为关联数组
 * AssociativeArray：键必须是字符串（或可以唯一标识的 ID），且通常用于管理 Cesium 内部对象的引用（如 Entity 的 id）。
 * Map：键可以是任意类型（包括对象、函数等），灵活性更高，但在某些场景下可能带来额外的内存或性能开销。
 * 
 * AssociativeArray：针对 Cesium 的用例（如频繁增删实体）进行了优化。它内部使用普通对象（{}）或数组来存储数据，避免了 Map 的一些额外开销（如迭代器、更复杂的哈希表结构）。
 * Map：虽然功能强大，但在存储大量简单键值对时，可能占用更多内存（尤其是在旧版 JS 引擎中）
 * 
 * 内存控制：减少不必要的开销。
 * 遍历优化：直接暴露值数组。
 * @alias AssociativeArray
 * @constructor
 */
function AssociativeArray() {
  this._array = [];
  this._hash = {};
}

Object.defineProperties(AssociativeArray.prototype, {
  /**
   * Gets the number of items in the collection.
   * @memberof AssociativeArray.prototype
   *
   * @type {number}
   */
  length: {
    get: function () {
      return this._array.length;
    },
  },
  /**
   * Gets an unordered array of all values in the collection.
   * This is a live array that will automatically reflect the values in the collection,
   * it should not be modified directly.
   * @memberof AssociativeArray.prototype
   *
   * @type {Array}
   */
  values: {
    get: function () {
      return this._array;
    },
  },
});

/**
 * Determines if the provided key is in the array.
 *
 * @param {string|number} key The key to check.
 * @returns {boolean} <code>true</code> if the key is in the array, <code>false</code> otherwise.
 */
AssociativeArray.prototype.contains = function (key) {
  //>>includeStart('debug', pragmas.debug);
  if (typeof key !== "string" && typeof key !== "number") {
    throw new DeveloperError("key is required to be a string or number.");
  }
  //>>includeEnd('debug');
  return defined(this._hash[key]);
};

/**
 * Associates the provided key with the provided value.  If the key already
 * exists, it is overwritten with the new value.
 *
 * @param {string|number} key A unique identifier.
 * @param {*} value The value to associate with the provided key.
 */
AssociativeArray.prototype.set = function (key, value) {
  //>>includeStart('debug', pragmas.debug);
  if (typeof key !== "string" && typeof key !== "number") {
    throw new DeveloperError("key is required to be a string or number.");
  }
  //>>includeEnd('debug');

  const oldValue = this._hash[key];
  if (value !== oldValue) {
    this.remove(key);
    this._hash[key] = value;
    this._array.push(value);
  }
};

/**
 * Retrieves the value associated with the provided key.
 *
 * @param {string|number} key The key whose value is to be retrieved.
 * @returns {*} The associated value, or undefined if the key does not exist in the collection.
 */
AssociativeArray.prototype.get = function (key) {
  //>>includeStart('debug', pragmas.debug);
  if (typeof key !== "string" && typeof key !== "number") {
    throw new DeveloperError("key is required to be a string or number.");
  }
  //>>includeEnd('debug');
  return this._hash[key];
};

/**
 * Removes a key-value pair from the collection.
 *
 * @param {string|number} key The key to be removed.
 * @returns {boolean} True if it was removed, false if the key was not in the collection.
 */
AssociativeArray.prototype.remove = function (key) {
  //>>includeStart('debug', pragmas.debug);
  if (defined(key) && typeof key !== "string" && typeof key !== "number") {
    throw new DeveloperError("key is required to be a string or number.");
  }
  //>>includeEnd('debug');

  const value = this._hash[key];
  const hasValue = defined(value);
  if (hasValue) {
    const array = this._array;
    array.splice(array.indexOf(value), 1);
    delete this._hash[key];
  }
  return hasValue;
};

/**
 * Clears the collection.
 */
AssociativeArray.prototype.removeAll = function () {
  const array = this._array;
  if (array.length > 0) {
    this._hash = {};
    array.length = 0;
  }
};
export default AssociativeArray;
