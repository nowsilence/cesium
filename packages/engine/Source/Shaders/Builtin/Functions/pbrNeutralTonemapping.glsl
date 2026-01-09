// KhronosGroup https://github.com/KhronosGroup/ToneMapping/tree/main/PBR_Neutral
// PBR 风格的中性色调映射函数（来自 Khronos Group 中性 PBR 色调映射标准），
// 核心使命是：将高动态范围（HDR）的线性 Rec. 709 颜色，压缩到低动态范围（LDR）的 [0, 1] 区间内，
// 同时最大程度保留原始颜色的亮度层次、对比度和色彩信息，实现 “中性” 无风格化的视觉效果（不偏亮、不偏暗、不偏色，还原真实视觉感受）。
// Input color is non-negative and resides in the Linear Rec. 709 color space.
// Output color is also Linear Rec. 709, but in the [0, 1] range.
// neutral 中性的;中立的
vec3 czm_pbrNeutralTonemapping(vec3 color) {
    const float startCompression = 0.8 - 0.04;
    const float desaturation = 0.15;

    float x = min(color.r, min(color.g, color.b));
    float offset = czm_branchFreeTernary(x < 0.08, x - 6.25 * x * x, 0.04);
    color -= offset;

    float peak = max(color.r, max(color.g, color.b));
    if (peak < startCompression) return color;

    const float d = 1.0 - startCompression;
    float newPeak = 1.0 - d * d / (peak + d - startCompression);
    color *= newPeak / peak;

    float g = 1.0 - 1.0 / (desaturation * (peak - newPeak) + 1.0);
    return mix(color, newPeak * vec3(1.0, 1.0, 1.0), g);
}
