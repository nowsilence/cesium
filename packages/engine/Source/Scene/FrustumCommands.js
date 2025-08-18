import Pass from "../Renderer/Pass.js";

/**
 * Defines a list of commands whose geometry are bound by near and far distances from the camera.
 * @alias FrustumCommands
 * @constructor
 *
 * @param {number} [near=0.0] The lower bound or closest distance from the camera.
 * @param {number} [far=0.0] The upper bound or farthest distance from the camera.
 *
 * @private
 */
function FrustumCommands(near, far) {
  this.near = near ?? 0.0;
  this.far = far ?? 0.0;

  const numPasses = Pass.NUMBER_OF_PASSES;
  const commands = new Array(numPasses); // 存放的是每个pass对应的命令
  const indices = new Array(numPasses); 
  // 存放的是每个pass对应命令的数量，这样用的好处是复用command数组空间，
  // 第一次假如command的长度为10，第二次使用的时候command不需要重新赋值或者长度置为0，
  // 只需要把indice置为0，command[indices]= obj;这样赋值就可，如果第二次长度不超过第一次，那么完全没有内存申请操作

  for (let i = 0; i < numPasses; ++i) {
    commands[i] = [];
    indices[i] = 0;
  }

  this.commands = commands;
  this.indices = indices;
}
export default FrustumCommands;
