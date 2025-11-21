uniform vec4 color;
uniform float glowPower;
uniform float taperPower;

czm_material czm_getMaterial(czm_materialInput materialInput)
{
    czm_material material = czm_getDefaultMaterial(materialInput);

    vec2 st = materialInput.st;
    float glow = glowPower / abs(st.t - 0.5) - (glowPower / 0.5);
    // float glow = glowPower * (1.0 / abs(st.t - 0.5) - 2.0); // -2表示在边缘处不发光，中心处最亮为+无穷
    
    if (taperPower <= 0.99999) {
        glow *= min(1.0, taperPower / (0.5 - st.s * 0.5) - (taperPower / 0.5));
        // glow *= min(1.0, taperPower * （1.0 / (0.5 - st.s * 0.5) - 2));
    }

    vec4 fragColor;
    // -1 表示在0~1的范围内不发光
    fragColor.rgb = max(vec3(glow - 1.0 + color.rgb), color.rgb);
    fragColor.a = clamp(0.0, 1.0, glow) * color.a;
    fragColor = czm_gammaCorrect(fragColor);

    material.emission = fragColor.rgb;
    material.alpha = fragColor.a;

    return material;
}
