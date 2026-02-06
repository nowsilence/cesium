import defined from "./defined.js";

/**
 * Adds all elements from the given source array to the given target array.
 *
 * If the <code>source</code> is <code>null</code>, <code>undefined</code>,
 * or empty, then nothing will be done. Otherwise, this has the same
 * semantics as<br>
 * <code>for (const s of source) target.push(s);</code><br>
 * but is usually more efficient than a <code>for</code>-loop, and does not
 * put the elements of the source on the stack, as it would be done with the
 * spread operator or when using <code>target.push.apply(source)</code>.
 *
 * @function
 * @private
 *
 * @param {Array} target The target array
 * @param {Array|undefined} source The source array
 *
 * @example
 * const target = [ 0, 1, 2 ];
 * const source = [ 3, 4, 5 ];
 * Cesium.addAllToArray(target, source);
 * // The target is now [ 0, 1, 2, 3, 4, 5 ]
 */
function addAllToArray(target, source) {
  if (!defined(source)) {
    return;
  }
  const sourceLength = source.length;
  if (sourceLength === 0) {
    return;
  }
  /**
   * 数组的length属性可直接修改，提前扩容能一次性分配足够的内存空间，
   * 避免逐个push时数组频繁触发“扩容-复制”操作（数组默认是动态扩容，每次扩容会重新分配内存并复制元素，损耗性能）；
   * 
   * 逐个 push 可能触发多次数组扩容，性能低
   * target.push(...source)	大数组时会触发栈溢出（参数过多）
   * target.push.apply(target, source)大数组时apply的参数数组过长，触发栈溢出	
   */
  const targetLength = target.length;
  target.length += sourceLength;
  for (let i = 0; i < sourceLength; i++) {
    target[targetLength + i] = source[i];
  }
}
export default addAllToArray;
