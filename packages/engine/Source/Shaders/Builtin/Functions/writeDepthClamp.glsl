// emulated noperspective
#if !defined(LOG_DEPTH)
in float v_WindowZ;
#endif

/**
 * Emulates GL_DEPTH_CLAMP. Clamps a fragment to the near and far plane
 * by writing the fragment's depth. See czm_depthClamp for more details.
 *
 * @name czm_writeDepthClamp
 * @glslFunction
 *
 * @example
 * out_FragColor = color;
 * czm_writeDepthClamp();
 *
 * @see czm_depthClamp
 */
void czm_writeDepthClamp()
{ // gl_FragCoord.w 是裁剪空间clip.w 的倒数即 1/clip.w
#if (!defined(LOG_DEPTH) && (__VERSION__ == 300 || defined(GL_EXT_frag_depth)))
    gl_FragDepth = clamp(v_WindowZ * gl_FragCoord.w, 0.0, 1.0);
#endif
}
// #if __VERSION__ == 300 || defined(GL_EXT_frag_depth)
//     v_WindowZ = (0.5 * (coords.z / coords.w) + 0.5) * coords.w;
//     coords.z = 0.0;
// #else
//     coords.z = min(coords.z, coords.w);
// #endif