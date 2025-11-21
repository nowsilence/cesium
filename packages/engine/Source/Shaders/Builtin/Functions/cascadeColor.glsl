
/**
 * 主要作用是根据权重值计算最终颜色，通常用于实现级联阴影映射（Cascaded Shadow Maps, CSM）中的阴影可视化或调试功能
*/
vec4 czm_cascadeColor(vec4 weights)
{
    return vec4(1.0, 0.0, 0.0, 1.0) * weights.x +
           vec4(0.0, 1.0, 0.0, 1.0) * weights.y +
           vec4(0.0, 0.0, 1.0, 1.0) * weights.z +
           vec4(1.0, 0.0, 1.0, 1.0) * weights.w;
}
