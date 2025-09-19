in vec3 position;
out vec3 v_texCoord;

void main()
{
    /**
     * czm_entireFrustum.x 近裁剪面near
     * czm_entireFrustum.y 远裁剪面far
    * czm_entireFrustum：Cesium 内置的 “完整视锥体参数”，是一个vec2类型，其中y分量代表立方图渲染的缩放因子（确保立方体能完全覆盖相机的视锥体，避免采样时出现 “空白区域”）
    */
    vec3 p = czm_viewRotation * (czm_temeToPseudoFixed * (czm_entireFrustum.y * position));
    gl_Position = czm_projection * vec4(p, 1.0);
    v_texCoord = position.xyz;
}
