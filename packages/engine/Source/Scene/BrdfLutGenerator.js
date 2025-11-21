import BoundingRectangle from "../Core/BoundingRectangle.js";
import defined from "../Core/defined.js";
import destroyObject from "../Core/destroyObject.js";
import PixelFormat from "../Core/PixelFormat.js";
import Framebuffer from "../Renderer/Framebuffer.js";
import PixelDatatype from "../Renderer/PixelDatatype.js";
import RenderState from "../Renderer/RenderState.js";
import Sampler from "../Renderer/Sampler.js";
import Texture from "../Renderer/Texture.js";
import BrdfLutGeneratorFS from "../Shaders/BrdfLutGeneratorFS.js";

/**
 * BRDF 查找表（LUT）生成器，核心作用是预计算并生成一张存储 BRDF 数据的纹理，
 * 用于后续 PBR（基于物理的渲染）流程中快速查询材质的高光反射 / 漫反射响应，避免实时计算的性能开销。
 * BRDF LUT：BRDF 的计算通常复杂且耗时（涉及积分、三角函数等），如果每个像素都实时计算，会严重影响性能。
 * 因此，将 固定参数范围内的 BRDF 计算结果预存到一张纹理中，这张纹理就是 BRDF LUT。
 * 后续渲染时，只需通过「粗糙度」「视角与法线夹角」等参数直接采样纹理，即可快速获取 BRDF 结果（用空间换时间）。
 * @private
 */
function BrdfLutGenerator() {
  this._colorTexture = undefined;
  this._drawCommand = undefined;
}

Object.defineProperties(BrdfLutGenerator.prototype, {
  colorTexture: {
    get: function () {
      return this._colorTexture;
    },
  },
});

function createCommand(generator, context, framebuffer) {
  const drawCommand = context.createViewportQuadCommand(BrdfLutGeneratorFS, {
    framebuffer: framebuffer,
    renderState: RenderState.fromCache({
      viewport: new BoundingRectangle(0.0, 0.0, 256.0, 256.0),
    }),
  });

  generator._drawCommand = drawCommand;
}

BrdfLutGenerator.prototype.update = function (frameState) {
  if (!defined(this._colorTexture)) {
    const context = frameState.context;
    const colorTexture = new Texture({
      context: context,
      width: 256,
      height: 256,
      pixelFormat: PixelFormat.RGBA,
      pixelDatatype: PixelDatatype.UNSIGNED_BYTE,
      sampler: Sampler.NEAREST,
    });

    this._colorTexture = colorTexture;
    const framebuffer = new Framebuffer({
      context: context,
      colorTextures: [colorTexture],
      destroyAttachments: false,
    });

    createCommand(this, context, framebuffer);
    this._drawCommand.execute(context);
    framebuffer.destroy();
    this._drawCommand.shaderProgram =
      this._drawCommand.shaderProgram &&
      this._drawCommand.shaderProgram.destroy();
  }
};

BrdfLutGenerator.prototype.isDestroyed = function () {
  return false;
};

BrdfLutGenerator.prototype.destroy = function () {
  this._colorTexture = this._colorTexture && this._colorTexture.destroy();
  return destroyObject(this);
};
export default BrdfLutGenerator;
