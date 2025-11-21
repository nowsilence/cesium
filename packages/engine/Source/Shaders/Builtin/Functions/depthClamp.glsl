// emulated noperspective
#if (__VERSION__ == 300 || defined(GL_EXT_frag_depth)) && !defined(LOG_DEPTH)
out float v_WindowZ;
#endif

/**
 * Emulates GL_DEPTH_CLAMP, which is not available in WebGL 1 or 2.
 * GL_DEPTH_CLAMP clamps geometry that is outside the near and far planes, 
 * capping the shadow volume. More information here: 
 * https://www.khronos.org/registry/OpenGL/extensions/ARB/ARB_depth_clamp.txt.
 *
 * When GL_EXT_frag_depth is available we emulate GL_DEPTH_CLAMP by ensuring 
 * no geometry gets clipped by setting the clip space z value to 0.0 and then
 * sending the unaltered screen space z value (using emulated noperspective
 * interpolation) to the frag shader where it is clamped to [0,1] and then
 * written with gl_FragDepth (see czm_writeDepthClamp). This technique is based on:
 * https://stackoverflow.com/questions/5960757/how-to-emulate-gl-depth-clamp-nv.
 *
 * When GL_EXT_frag_depth is not available, which is the case on some mobile 
 * devices, we must attempt to fix this only in the vertex shader. 
 * The approach is to clamp the z value to the far plane, which closes the 
 * shadow volume but also distorts the geometry, so there can still be artifacts
 * on frustum seams.
 *
 * @name czm_depthClamp
 * @glslFunction
 *
 * @param {vec4} coords The vertex in clip coordinates. 裁剪空间坐标
 * @returns {vec4} The modified vertex.
 *
 * @example
 * gl_Position = czm_depthClamp(czm_modelViewProjection * vec4(position, 1.0));
 *
 * @see czm_writeDepthClamp
 */
vec4 czm_depthClamp(vec4 coords)
{
#ifndef LOG_DEPTH
#if __VERSION__ == 300 || defined(GL_EXT_frag_depth)
    /**
     * windowZ = 0.5 * (z/w) + 0.5（OpenGL 标准转换，将裁剪空间的 z/w ∈ [-1,1] 映射到窗口空间 [0,1]）；
     * 这里多乘了 coords.w，最终 v_WindowZ = windowZ * w = 0.5*z + 0.5*w—— 目的是「保留原始深度信息」，
     * 且通过 v_WindowZ 传递给片段着色器（注释里的 “emulated noperspective” 就是为了让这个深度值不被透视插值扭曲，保证准确）。   
    */
    v_WindowZ = (0.5 * (coords.z / coords.w) + 0.5) * coords.w; // 用来在片段着色器恢复深度信息，所以要求支持深度修改
    coords.z = 0.0; // 裁剪空间的裁剪规则是：z/w 超出 [-1,1] 的顶点会被裁掉；
#else
// 裁剪空间中，coords.w 对应 “远裁剪面” 的边界（z/w = 1 时是远裁剪面）；
// 将 z 值限制在 ≤ coords.w，即 z/w ≤ 1—— 避免顶点因超出远裁剪面被裁掉
// 会轻微扭曲超出远裁剪面的几何形状（因为强制修改了 z 值）
    coords.z = min(coords.z, coords.w);
#endif
#endif
    return coords;
}
