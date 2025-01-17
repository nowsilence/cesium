uniform highp sampler2D u_depthTexture;

in vec2 v_textureCoordinates;

void main()
{
    // pack的目的是减少空间的占用，纹理使用unsigned_type类型
    out_FragColor = czm_packDepth(texture(u_depthTexture, v_textureCoordinates).r);
}
