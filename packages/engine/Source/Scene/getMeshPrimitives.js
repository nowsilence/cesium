import addAllToArray from "../Core/addAllToArray.js";
import defined from "../Core/defined.js";
import Frozen from "../Core/Frozen.js";
import WebGLConstants from "../Core/WebGLConstants.js";

/**
 * Get an array of primitives for a given mesh. If the EXT_mesh_primitive_restart extension is present, use it to combine groups of primitives.
 * If the extension is not present or its spec is violated, return the original mesh.primitives.
 * EXT_mesh_primitive_restart图元重启，如在绘制LINE_STRIP的时候，必须是前一个点连接后一个点，
 * 若两个断开的线使用LINE_STRIP的时候，必须分两个Primitive，使用图元重启在渲染的时候碰到图元重启标志会重启图元绘制
 * 
 * 这个函数的作用是如果支持图元重启，能合并渲染的primitive进行合并
 * 
 * meshPrimitives内的primitives并不是所有的都支持合并，group里面记录了这个group合并了哪些primitive，并将索引记录在了group.primitives，group.indices就是这些primitives的顶点索引
 * 可以合并的合并，和不能合并的一块返回
 * @param {object} mesh A mesh from the glTF meshes array
 * @returns {object[]} An array of mesh primitives
 * @private
 */
function getMeshPrimitives(mesh) {
  const meshExtensions = mesh.extensions ?? Frozen.EMPTY_OBJECT;
  const primitiveRestartExtension = meshExtensions.EXT_mesh_primitive_restart;
  const meshPrimitives = mesh.primitives;

  if (!defined(primitiveRestartExtension)) {
    return meshPrimitives;
  }

  // Note: per the spec, any violation of the extension's specification should cause us to fall back to mesh.primitives, if detecting the violation is feasible.

  // Start with a copy of mesh.primitives. For each group, replace the first primitive in the group with a primitive representing the entire group,
  // and set the rest of the primitives in the group to `undefined`.
  // This allows us to identify which remaining primitives do not use primitive restart, and any errors involving a primitive appearing in more than one group.
  const primitives = [];
  addAllToArray(primitives, meshPrimitives);
  for (const group of primitiveRestartExtension.primitiveGroups) {
    // Spec: the group must not be empty and all indices must be valid array indices into mesh.primitives.
    const firstPrimitiveIndex = group.primitives[0]; // 里面存的是索引值，是meshPrimitives的索引
    if (!defined(firstPrimitiveIndex) || !meshPrimitives[firstPrimitiveIndex]) {
      return meshPrimitives;
    }

    const primitive = {
      ...meshPrimitives[firstPrimitiveIndex],
      indices: group.indices, // 合并后的统一索引数组，包含重启索引值
    };

    // Spec: primitive restart only supported for these topologies.
    switch (primitive.mode) {
      case WebGLConstants.TRIANGLE_FAN:
      case WebGLConstants.TRIANGLE_STRIP:
      case WebGLConstants.LINE_STRIP:
      case WebGLConstants.LINE_LOOP:
        break;
      default:
        return meshPrimitives;
    }

    for (const primitiveIndex of group.primitives) {
      const thisPrimitive = primitives[primitiveIndex];

      // Spec: all primitives must use indexed geometry and a given primitive may appear in at most one group.
      // Spec: all primitives must have same topology.
      if (
        !defined(thisPrimitive?.indices) ||
        thisPrimitive.mode !== primitive.mode
      ) {
        return meshPrimitives;
      }

      primitives[primitiveIndex] = undefined;
    }

    primitives[firstPrimitiveIndex] = primitive;
  }

  return primitives.filter(defined);
}
export default getMeshPrimitives;
