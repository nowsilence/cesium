in vec2 v_textureCoordinates;
const float M_PI = 3.141592653589793;


float vdcRadicalInverse(int i)
{
    float r;
    float base = 2.0;
    float value = 0.0;
    float invBase = 1.0 / base;
    float invBi = invBase;
    for (int x = 0; x < 100; x++)
    {
        if (i <= 0)
        {
            break;
        }
        r = mod(float(i), base);
        value += r * invBi;
        invBi *= invBase;
        i = int(float(i) * invBase);
    }
    return value;
}

// 生成低差异采样点
vec2 hammersley2D(int i, int N)
{
    return vec2(float(i) / float(N), vdcRadicalInverse(i));
}

/**
    这个函数实现了 GGX 法线分布的重要性采样（Importance Sampling），
    核心作用是：在 PBR（基于物理的渲染）中，根据材质的粗糙度（alphaRoughness）和表面法线（N），
    从随机输入（xi）生成「符合 GGX 分布的半程向量（H）」—— 简单说，就是 “有偏向性地生成微平面的朝向”，
    让采样结果更集中在对渲染贡献大的方向上，提升光线追踪、IBL（图像基光照）等场景的计算效率和精度。

*/
vec3 importanceSampleGGX(vec2 xi, float alphaRoughness, vec3 N)
{
    float alphaRoughnessSquared = alphaRoughness * alphaRoughness;
    float phi = 2.0 * M_PI * xi.x;
    float cosTheta = sqrt((1.0 - xi.y) / (1.0 + (alphaRoughnessSquared - 1.0) * xi.y));
    float sinTheta = sqrt(1.0 - cosTheta * cosTheta);
    vec3 H = vec3(sinTheta * cos(phi), sinTheta * sin(phi), cosTheta);
    vec3 upVector = abs(N.z) < 0.999 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);
    vec3 tangentX = normalize(cross(upVector, N));
    vec3 tangentY = cross(N, tangentX);
    return tangentX * H.x + tangentY * H.y + N * H.z;
}

/**
 * 实现了 Smith 联合 GGX 可见性函数（Smith Joint GGX Visibility Function），
 * 是 PBR（基于物理的渲染）中核心的「几何遮挡 / 阴影函数（Geometric Function）」—— 
 * 核心作用是量化微平面模型中 “微平面被自身遮挡或阴影” 的程度，最终影响镜面反射的强度（遮挡越严重，反射越弱）。
 * Estimate the geometric self-shadowing of the microfacets in a surface,
 * using the Smith Joint GGX visibility function.
 * Note: Vis = G / (4 * NdotL * NdotV)
 * see Eric Heitz. 2014. Understanding the Masking-Shadowing Function in Microfacet-Based BRDFs. Journal of Computer Graphics Techniques, 3
 * see Real-Time Rendering. Page 331 to 336.
 * see https://google.github.io/filament/Filament.md.html#materialsystem/specularbrdf/geometricshadowing(specularg)
 * 遮挡（Masking）：视线方向（V）被前方的微平面挡住，无法看到后方的微平面；
 * 阴影（Shadowing）：光线方向（L）被前方的微平面挡住，无法照射到后方的微平面
 * Smith 函数的核心是 联合计算 “遮挡 + 阴影” 的概率，最终输出一个 “可见性因子”—— 只有同时不被遮挡（视线能到）且不被阴影（光线能到）的微平面，才能产生有效的镜面反射。
 * 一种特定微平面法线分布函数」的命名标识，源于其数学模型（广义高斯分布的变体Generalized Gaussian Distribution, GGD），因简洁且符合渲染领域的术语习惯而被广泛使用。
 * @param {float} alphaRoughness The roughness of the material, expressed as the square of perceptual roughness.
 * @param {float} NdotL The cosine of the angle between the surface normal and the direction to the light source.
 * @param {float} NdotV The cosine of the angle between the surface normal and the direction to the camera.
 */
float smithVisibilityGGX(float alphaRoughness, float NdotL, float NdotV)
{
    // 1. 计算物理粗糙度的平方（alpha²）：GGX分布的核心参数，物理粗糙度（Alpha）是用于数学计算的，通常是「感知粗糙度的平方」
    float alphaRoughnessSq = alphaRoughness * alphaRoughness;
    // 2. 计算视线方向的遮挡项（GGXV）：描述微平面被视线遮挡的程度
    float GGXV = NdotL * sqrt(NdotV * NdotV * (1.0 - alphaRoughnessSq) + alphaRoughnessSq);
    // 3. 计算光线方向的阴影项（GGXL）：描述微平面被光线阴影的程度
    float GGXL = NdotV * sqrt(NdotL * NdotL * (1.0 - alphaRoughnessSq) + alphaRoughnessSq);
    // 4. 联合遮挡+阴影：分母越大，遮挡越严重；分母为0时无反射
    float GGX = GGXV + GGXL; // 2.0 if NdotL = NdotV = 1.0
    // 原始 GGX 几何函数 G 的公式为：G = 2 * NdotL * NdotV / (GGXV + GGXL)；
    if (GGX > 0.0)
    {
        // Vis = [2*NdotL*NdotV/(GGXV+GGXL)] / [4*NdotL*NdotV] = 0.5/(GGXV+GGXL)
        // 5. 计算最终可见性因子：0.5 / GGX（对应注释中的 Vis = G / (4*NdotL*NdotV)）
        return 0.5 / GGX; // 1/4 if NdotL = NdotV = 1.0
    }
    return 0.0;
}


vec2 integrateBrdf(float roughness, float NdotV)
{
    vec3 V = vec3(sqrt(1.0 - NdotV * NdotV), 0.0, NdotV);
    float A = 0.0;
    float B = 0.0;
    const int NumSamples = 1024;
    float alphaRoughness = roughness * roughness;
    for (int i = 0; i < NumSamples; i++)
    {
        // 在下面函数中，每次执行integrateBrdf函数，i相等的情况下，xi和H的值都是一样的
        vec2 xi = hammersley2D(i, NumSamples);
        vec3 H = importanceSampleGGX(xi, alphaRoughness, vec3(0.0, 0.0, 1.0));
        vec3 L = 2.0 * dot(V, H) * H - V;
        float NdotL = clamp(L.z, 0.0, 1.0);
        float NdotH = clamp(H.z, 0.0, 1.0);
        float VdotH = clamp(dot(V, H), 0.0, 1.0);
        if (NdotL > 0.0)
        {
            float G = smithVisibilityGGX(alphaRoughness, NdotL, NdotV);
            float G_Vis = 4.0 * G * VdotH * NdotL / NdotH;
            float Fc = pow(1.0 - VdotH, 5.0);
            A += (1.0 - Fc) * G_Vis;
            B += Fc * G_Vis;
        }
    }
    return vec2(A, B) / float(NumSamples);
}

void main()
{
    out_FragColor = vec4(integrateBrdf(v_textureCoordinates.y, v_textureCoordinates.x), 0.0, 1.0);
}

