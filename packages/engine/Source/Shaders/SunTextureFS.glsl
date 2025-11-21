uniform float u_radiusTS;

in vec2 v_textureCoordinates;

/**
 * 旋转点
*/
vec2 rotate(vec2 p, vec2 direction)
{
    return vec2(p.x * direction.x - p.y * direction.y, p.x * direction.y + p.y * direction.x);
}
/*
    旋转点：
    x' = x * cosθ - y * sinθ;  // 顺时针旋转
    y' = x * sinθ + y * cosθ;

    mat2(
        c, -s,
        s, c
    )

    旋转坐标轴 等价于点逆时针旋转 θ（即坐标轴顺时针旋转 θ）
    x' = x * cosθ + y * sinθ; 
    y' = -x * sinθ + y * cosθ;

    mat2(
        c, s,
        -s, c
    )
*/


vec4 addBurst(vec2 position, vec2 direction, float lengthScalar)
{
    // x 方向拉伸 25 倍，y 方向压缩为 0.75 倍，形成细长的射线形状
    vec2 rotatedPosition = rotate(position, direction) * vec2(25.0, 0.75);
    float radius = length(rotatedPosition) * lengthScalar;
    float burst = 1.0 - smoothstep(0.0, 0.55, radius);
    return vec4(burst);
}

void main()
{
    // 用于生成 lens flare https://www.cnblogs.com/chenglixue/p/17278887.html
    float lengthScalar = 2.0 / sqrt(2.0);
    vec2 position = v_textureCoordinates - vec2(0.5);
    float radius = length(position) * lengthScalar; // 归一化长度，如0.5,0.5,乘以lengthScalar刚好为1
    float surface = step(radius, u_radiusTS); // 圆形区域
    // u_radiusTS > radius 则返回1，或者radius < u_radiusTS则返回1，否则返回0

    vec4 color = vec4(vec2(1.0), surface + 0.2, surface);

    float glow = 1.0 - smoothstep(0.0, 0.55, radius);
    color.ba += mix(vec2(0.0), vec2(1.0), glow) * 0.75;
    // a * (1 - t) + b * t
    vec4 burst = vec4(0.0);

    // The following loop has been manually unrolled for speed, to
    // avoid sin() and cos().
    //
    //for (float i = 0.4; i < 3.2; i += 1.047) {
    //    vec2 direction = vec2(sin(i), cos(i));
    //    burst += 0.4 * addBurst(position, direction, lengthScalar);
    //
    //    direction = vec2(sin(i - 0.08), cos(i - 0.08));
    //    burst += 0.3 * addBurst(position, direction, lengthScalar);
    //}

    /**
        单个像素的颜色是 “多方向光芒的叠加结果”
        虽然最终输出的是单个像素的颜色，但这个颜色并非只由 “像素到中心的距离” 决定，还受到 ** 该像素在各个放射方向上的 “光芒贡献”** 影响：
        例如，一个位于 30° 方向的像素，可能同时处于 0° 主光芒的边缘、60° 主光芒的边缘，以及它们的副光芒范围内；
        6 次计算分别计算该像素在 6 个方向上的光芒强度（通过 addBurst 函数），再叠加起来，最终颜色就会体现出 “多个方向光芒在此处交汇” 的效果。
        这种叠加能让光芒在交叉区域更亮、边缘区域渐暗，形成类似 “星芒闪烁” 的层次感 —— 如果只计算 1 次，无论旋转到哪个角度，都只能得到单方向的一条光芒，无法形成 “爆发” 的视觉冲击。
    */

    burst += 0.4 * addBurst(position, vec2(0.38942,  0.92106), lengthScalar);  // angle == 0.4
    burst += 0.4 * addBurst(position, vec2(0.99235,  0.12348), lengthScalar);  // angle == 0.4 + 1.047
    burst += 0.4 * addBurst(position, vec2(0.60327, -0.79754), lengthScalar);  // angle == 0.4 + 1.047 * 2.0

    burst += 0.3 * addBurst(position, vec2(0.31457,  0.94924), lengthScalar);  // angle == 0.4 - 0.08
    burst += 0.3 * addBurst(position, vec2(0.97931,  0.20239), lengthScalar);  // angle == 0.4 + 1.047 - 0.08
    burst += 0.3 * addBurst(position, vec2(0.66507, -0.74678), lengthScalar);  // angle == 0.4 + 1.047 * 2.0 - 0.08

    // End of manual loop unrolling.

    color += clamp(burst, vec4(0.0), vec4(1.0)) * 0.15;

    out_FragColor = clamp(color, vec4(0.0), vec4(1.0));
}
