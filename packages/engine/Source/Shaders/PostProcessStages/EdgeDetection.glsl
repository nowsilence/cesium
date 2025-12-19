uniform sampler2D depthTexture;
uniform float length;
uniform vec4 color;

in vec2 v_textureCoordinates;

void main(void)
{
    float directions[3];
    directions[0] = -1.0;
    directions[1] = 0.0;
    directions[2] = 1.0;

    float scalars[3];
    scalars[0] = 3.0;
    scalars[1] = 10.0;
    scalars[2] = 3.0;
    // 可以控制描边的宽度
    float padx = czm_pixelRatio / czm_viewport.z;
    float pady = czm_pixelRatio / czm_viewport.w;

#ifdef CZM_SELECTED_FEATURE
    bool selected = false;
    // 检测八个相邻像素，但这个算方法会有重复
    for (int i = 0; i < 3; ++i)
    {
        float dir = directions[i];
        selected = selected || czm_selected(vec2(-padx, dir * pady));
        selected = selected || czm_selected(vec2(padx, dir * pady));
        selected = selected || czm_selected(vec2(dir * padx, -pady));
        selected = selected || czm_selected(vec2(dir * padx, pady));
        if (selected)
        {
            break;
        }
    }
    if (!selected)
    {
        out_FragColor = vec4(color.rgb, 0.0);
        return;
    }
#endif

    float horizEdge = 0.0;
    float vertEdge = 0.0;
    // 遍历 3 个方向，计算水平和垂直方向的边缘梯度
    for (int i = 0; i < 3; ++i)
    {
        float dir = directions[i];
        float scale = scalars[i];
        // 水平边缘：计算当前像素左右邻域的深度差值（加权）
        horizEdge -= texture(depthTexture, v_textureCoordinates + vec2(-padx, dir * pady)).x * scale;
        horizEdge += texture(depthTexture, v_textureCoordinates + vec2(padx, dir * pady)).x * scale;
        // 垂直边缘：计算当前像素上下邻域的深度差值（加权）
        vertEdge -= texture(depthTexture, v_textureCoordinates + vec2(dir * padx, -pady)).x * scale;
        vertEdge += texture(depthTexture, v_textureCoordinates + vec2(dir * padx, pady)).x * scale;
    }
    // 计算边缘的总强度（欧几里得距离
    float len = sqrt(horizEdge * horizEdge + vertEdge * vertEdge);
    out_FragColor = vec4(color.rgb, len > length ? color.a : 0.0);
}
