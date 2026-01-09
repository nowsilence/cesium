/**
 * Converts a color from RGB(sRGB) space to linear space.
 * 将sRGB颜色转换为线性颜色空间时，需要应用伽马校正的逆操作，即对每个颜色通道值进行2.2次幂运算，以恢复物理上线性的光强度关系
 * czm_inverseGamma配对
 * @name czm_gammaCorrect
 * @glslFunction
 * 名字起的好像是翻了，
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
    color.rgb = pow(color.rgb, vec3(czm_gamma));
#endif
    return color;
}
