in vec4 v_color;

void main()
{   // Flat Shading 平面着色， 不进行光照处理
    out_FragColor = czm_gammaCorrect(v_color);
}
