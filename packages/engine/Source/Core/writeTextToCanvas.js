import Color from "./Color.js";
import Frozen from "./Frozen.js";
import defined from "./defined.js";
import DeveloperError from "./DeveloperError.js";

/**
 * 原生 Canvas context2D.measureText() 的致命缺陷
 * 1) 只能获取文本的宽度，完全拿不到真实高度（比如j、y、g、p这些下沉字符，原生拿不到基线以下的高度）；
 * 2) 没有文字基线（baseline） 相关信息，不知道文字「最高点到基线的距离 (ascent)」、「基线到最低点的距离 (descent)」；
 * 3) 没有左侧偏移量 (minx)，比如字符j的绘制起点在基线左侧，原生无法获取这个偏移，会导致文字绘制被裁切；
 * 4) 对于带描边 + 填充的文本，原生测量的宽度和实际绘制的宽度不一致，描边会让文字变宽但原生不计算。
 * @param {*} context2D 
 * @param {*} textString 
 * @param {*} font 
 * @param {*} stroke 
 * @param {*} fill 
 * @returns 
 */
function measureText(context2D, textString, font, stroke, fill) {
  const metrics = context2D.measureText(textString); // 主要计算宽度，还是很准确的
  const isSpace = !/\S/.test(textString);

  if (!isSpace) {
    const fontSize = document.defaultView
      .getComputedStyle(context2D.canvas)
      .getPropertyValue("font-size")
      .replace("px", "");
    const canvas = document.createElement("canvas");
    const padding = 100;
    const width = (metrics.width + padding) | 0;
    const height = 3 * fontSize;
    const baseline = height / 2;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    ctx.font = font;
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width + 1, canvas.height + 1);
    // textbaseline alphabetic	默认。 文本基线是正常的字母基线
    if (stroke) {
      ctx.strokeStyle = "black";
      ctx.lineWidth = context2D.lineWidth;
      ctx.strokeText(textString, padding / 2, baseline);
    }

    if (fill) {
      ctx.fillStyle = "black";
      ctx.fillText(textString, padding / 2, baseline);
    }

    // Context image data has width * height * 4 elements, because
    // each pixel's R, G, B and A are consecutive values in the array.
    const pixelData = ctx.getImageData(0, 0, width, height).data;
    const length = pixelData.length;
    const width4 = width * 4;
    let i, j;

    let ascent, descent;
    // Find the number of rows (from the top) until the first non-white pixel
    for (i = 0; i < length; ++i) {
      if (pixelData[i] !== 255) { // 不等于255即为黑色，黑色是字体的颜色
        ascent = (i / width4) | 0;
        break;
      }
    }

    // Find the number of rows (from the bottom) until the first non-white pixel
    for (i = length - 1; i >= 0; --i) {
      if (pixelData[i] !== 255) {
        descent = (i / width4) | 0;
        break;
      }
    }

    let minx = -1;
    // For each column, for each row, check for first non-white pixel
    for (i = 0; i < width && minx === -1; ++i) {
      for (j = 0; j < height; ++j) {
        const pixelIndex = i * 4 + j * width4;
        if (
          pixelData[pixelIndex] !== 255 ||
          pixelData[pixelIndex + 1] !== 255 ||
          pixelData[pixelIndex + 2] !== 255 ||
          pixelData[pixelIndex + 3] !== 255
        ) {
          minx = i;
          break;
        }
      }
    }

    return {
      width: metrics.width,
      height: descent - ascent,
      ascent: baseline - ascent,
      descent: descent - baseline,
      minx: minx - padding / 2,
    };
  }

  return {
    width: metrics.width,
    height: 0,
    ascent: 0,
    descent: 0,
    minx: 0,
  };
}

let imageSmoothingEnabledName;

/**
 * Writes the given text into a new canvas.  The canvas will be sized to fit the text.
 * If text is blank, returns undefined.
 *
 * @param {string} text The text to write.
 * @param {object} [options] Object with the following properties:
 * @param {string} [options.font='10px sans-serif'] The CSS font to use.
 * @param {boolean} [options.fill=true] Whether to fill the text.
 * @param {boolean} [options.stroke=false] Whether to stroke the text.
 * @param {Color} [options.fillColor=Color.WHITE] The fill color.
 * @param {Color} [options.strokeColor=Color.BLACK] The stroke color.
 * @param {number} [options.strokeWidth=1] The stroke width.
 * @param {Color} [options.backgroundColor=Color.TRANSPARENT] The background color of the canvas.
 * @param {number} [options.padding=0] The pixel size of the padding to add around the text.
 * @returns {HTMLCanvasElement|undefined} A new canvas with the given text drawn into it.  The dimensions object
 *                   from measureText will also be added to the returned canvas. If text is
 *                   blank, returns undefined.
 * @function writeTextToCanvas
 */
function writeTextToCanvas(text, options) {
  //>>includeStart('debug', pragmas.debug);
  if (!defined(text)) {
    throw new DeveloperError("text is required.");
  }
  //>>includeEnd('debug');
  if (text === "") {
    return undefined;
  }

  options = options ?? Frozen.EMPTY_OBJECT;
  const font = options.font ?? "10px sans-serif";
  const stroke = options.stroke ?? false;
  const fill = options.fill ?? true;
  const strokeWidth = options.strokeWidth ?? 1;
  const backgroundColor = options.backgroundColor ?? Color.TRANSPARENT;
  const padding = options.padding ?? 0;
  const doublePadding = padding * 2.0;

  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  canvas.style.font = font; // 给canvas DOM元素设置字体样式，配合 measureText 做精准的尺寸计算；
  // Since multiple read-back operations are expected for labels, use the willReadFrequently option – See https://html.spec.whatwg.org/multipage/canvas.html#concept-canvas-will-read-frequently
  const context2D = canvas.getContext("2d", { willReadFrequently: true });
  // Canvas 2D API 中的一个属性，用于控制绘制图像时是否应用平滑（抗锯齿）处理
  if (!defined(imageSmoothingEnabledName)) {
    if (defined(context2D.imageSmoothingEnabled)) {
      imageSmoothingEnabledName = "imageSmoothingEnabled";
    } else if (defined(context2D.mozImageSmoothingEnabled)) {
      imageSmoothingEnabledName = "mozImageSmoothingEnabled";
    } else if (defined(context2D.webkitImageSmoothingEnabled)) {
      imageSmoothingEnabledName = "webkitImageSmoothingEnabled";
    } else if (defined(context2D.msImageSmoothingEnabled)) {
      imageSmoothingEnabledName = "msImageSmoothingEnabled";
    }
  }
  // 两处字体设置都必须有
  context2D.font = font; // 给2D绘制上下文设置字体样式
  context2D.lineJoin = "round";
  context2D.lineWidth = strokeWidth;
  // 关闭平滑后，文本在 Cesium 3D 场景中缩放、旋转时，不会出现模糊的毛边，文字更清晰
  context2D[imageSmoothingEnabledName] = false; // 让文本边缘更锐利，避免模糊；

  // in order for measureText to calculate style, the canvas has to be
  // (temporarily) added to the DOM.
  // display:none 的 DOM 元素，浏览器不会解析它的样式！
  canvas.style.visibility = "hidden";
  // 必须加入到dom内，不然计算的值是canvas默认字体（10px sans-serif）的大小，而不是自定义设置的font
  document.body.appendChild(canvas);

  const dimensions = measureText(context2D, text, font, stroke, fill);
  // Set canvas.dimensions to be accessed in LabelCollection
  canvas.dimensions = dimensions; // 本身没这个属性

  document.body.removeChild(canvas);
  canvas.style.visibility = "";

  // Some characters, such as the letter j, have a non-zero starting position.
  // This value is used for kerning later, but we need to take it into account
  // now in order to draw the text completely on the canvas
  const x = -dimensions.minx;

  // Expand the width to include the starting position.
  const width = Math.ceil(dimensions.width) + x + doublePadding;

  // While the height of the letter is correct, we need to adjust
  // where we start drawing it so that letters like j and y properly dip
  // below the line.

  const height = dimensions.height + doublePadding;
  const baseline = height - dimensions.ascent + padding;
  const y = height - baseline + doublePadding;

  canvas.width = width;
  canvas.height = height;

  // Properties must be explicitly set again after changing width and height
  context2D.font = font;
  context2D.lineJoin = "round";
  context2D.lineWidth = strokeWidth;
  context2D[imageSmoothingEnabledName] = false;

  // Draw background
  if (backgroundColor !== Color.TRANSPARENT) {
    context2D.fillStyle = backgroundColor.toCssColorString();
    context2D.fillRect(0, 0, canvas.width, canvas.height);
  }

  if (stroke) {
    const strokeColor = options.strokeColor ?? Color.BLACK;
    context2D.strokeStyle = strokeColor.toCssColorString();
    context2D.strokeText(text, x + padding, y);
  }

  if (fill) {
    const fillColor = options.fillColor ?? Color.WHITE;
    context2D.fillStyle = fillColor.toCssColorString();
    context2D.fillText(text, x + padding, y);
  }

  return canvas;
}
export default writeTextToCanvas;
