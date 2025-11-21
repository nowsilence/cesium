uniform vec4 color;
uniform vec4 gapColor;
uniform float dashLength;
uniform float dashPattern;
in float v_polylineAngle;

const float maskLength = 16.0;

// 旋转坐标矩阵，不是旋转点
mat2 rotate(float rad) {
    float c = cos(rad);
    float s = sin(rad);
    return mat2(
        c, s,
        -s, c
    );
}

/**
// 旋转点，计算的是原坐标系下的点，和上边对偶，互为转置
mat2 rotate(float angle) {
    float c = cos(angle);
    float s = sin(angle);
    return mat2(
        c, -s,  // 第一列
        s,  c   // 第二列
    );
}
*/

czm_material czm_getMaterial(czm_materialInput materialInput)
{
    czm_material material = czm_getDefaultMaterial(materialInput);
    // 计算的是新坐标系下的点
    vec2 pos = rotate(v_polylineAngle) * gl_FragCoord.xy;

    // Get the relative position within the dash from 0 to 1
    float dashPosition = fract(pos.x / (dashLength * czm_pixelRatio));
    // Figure out the mask index.
    float maskIndex = floor(dashPosition * maskLength);
    // Test the bit mask.
    float maskTest = floor(dashPattern / pow(2.0, maskIndex));
    vec4 fragColor = (mod(maskTest, 2.0) < 1.0) ? gapColor : color;
    if (fragColor.a < 0.005) {   // matches 0/255 and 1/255
        discard;
    }

    fragColor = czm_gammaCorrect(fragColor);
    material.emission = fragColor.rgb;
    material.alpha = fragColor.a;
    return material;
}
