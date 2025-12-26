/**
 * Converts a color from RGB space to linear space.
 * czm_inverseGamma配对
 * @name czm_gammaCorrect
 * @glslFunction
 *
 * @param {vec3} color The color in RGB space.
 * @returns {vec3} The color in linear space.
 */
vec3 czm_gammaCorrect(vec3 color) {
#ifdef HDR
    color = pow(color, vec3(czm_gamma));
#endif
    return color;
}

vec4 czm_gammaCorrect(vec4 color) {
#ifdef HDR
    // 伽马解码（线性 RGB = sRGB^γ）：用于把输入的 sRGB 颜色转换为线性 RGB 供计算。
    // czm_gamma 默认为2.2 在Scene.js设置
    color.rgb = pow(color.rgb, vec3(czm_gamma));
#endif
    return color;
}
