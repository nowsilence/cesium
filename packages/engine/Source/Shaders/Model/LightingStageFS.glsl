#ifdef USE_IBL_LIGHTING
vec3 computeIBL(vec3 position, vec3 normal, vec3 lightDirection, vec3 lightColorHdr, czm_modelMaterial material)
{
    #if defined(DIFFUSE_IBL) || defined(SPECULAR_IBL)
        // Environment maps were provided, use them for IBL
        vec3 viewDirection = -normalize(position);
        vec3 iblColor = textureIBL(viewDirection, normal, material);
        return iblColor;
    #endif
    
    return vec3(0.0);
}
#endif

#ifdef USE_CLEARCOAT
vec3 addClearcoatReflection(vec3 baseLayerColor, vec3 position, vec3 lightDirection, vec3 lightColorHdr, czm_modelMaterial material)
{   // clearcoat 透明涂层
    /**
        clearcoat（中文常称「清漆层」「透明涂层」）是一种模拟「物体表面覆盖透明 / 半透明保护层」的渲染技术 —— 核心作用是在原有材质（如车漆、塑料、木材、手机外壳）表面，叠加一层薄薄的、高光泽的透明介质（类似现实中的清漆、镀膜），从而呈现「基础材质纹理 + 透明层高光 / 反射」的复合效果。
        它的本质是 “双层材质模型”：底层是物体本身的基础材质（如金属、非金属），顶层是透明的清漆层（通常是高折射率的电介质，类似玻璃、树脂），两层分别计算光照（反射、折射）后叠加，最终还原真实世界中 “带清漆保护的材质” 质感。
    */
    vec3 viewDirection = -normalize(position);
    vec3 halfwayDirection = normalize(viewDirection + lightDirection);
    vec3 normal = material.clearcoatNormal;
    float NdotL = clamp(dot(normal, lightDirection), 0.001, 1.0);

    // clearcoatF0 = vec3(pow((ior - 1.0) / (ior + 1.0), 2.0)), but without KHR_materials_ior, ior is a constant 1.5.
    vec3 f0 = vec3(0.04);
    vec3 f90 = vec3(1.0);
    // Note: clearcoat Fresnel computed with dot(n, v) instead of dot(v, h).
    // This is to make it energy conserving with a simple layering function.
    float NdotV = clamp(dot(normal, viewDirection), 0.0, 1.0);
    vec3 F = fresnelSchlick2(f0, f90, NdotV);

    // compute specular reflection from direct lighting
    float roughness = material.clearcoatRoughness;
    float alphaRoughness = roughness * roughness;
    float directStrength = computeDirectSpecularStrength(normal, lightDirection, viewDirection, halfwayDirection, alphaRoughness);
    vec3 directReflection = F * directStrength * NdotL;
    vec3 color = lightColorHdr * directReflection;

    #ifdef SPECULAR_IBL
        // Find the direction in which to sample the environment map
        vec3 reflectMC = normalize(model_iblReferenceFrameMatrix * reflect(-viewDirection, normal));
        vec3 iblColor = computeSpecularIBL(reflectMC, NdotV, f0, roughness);
        color += iblColor * material.occlusion;
    #endif

    float clearcoatFactor = material.clearcoatFactor;
    vec3 clearcoatColor = color * clearcoatFactor;

    // Dim base layer based on transmission loss through clearcoat
    return baseLayerColor * (1.0 - clearcoatFactor * F) + clearcoatColor;
}
#endif

#if defined(LIGHTING_PBR) && defined(HAS_NORMALS)
vec3 computePbrLighting(in czm_modelMaterial material, in vec3 position)
{
    #ifdef USE_CUSTOM_LIGHT_COLOR
        vec3 lightColorHdr = model_lightColorHdr;
    #else
        vec3 lightColorHdr = czm_lightColorHdr;
    #endif

    vec3 viewDirection = -normalize(position);
    vec3 normal = material.normalEC;
    vec3 lightDirection = normalize(czm_lightDirectionEC);

    vec3 directLighting = czm_pbrLighting(viewDirection, normal, lightDirection, material);
    vec3 directColor = lightColorHdr * directLighting;

    // Accumulate colors from base layer
    vec3 color = directColor + material.emissive;
    #ifdef USE_IBL_LIGHTING
        color += computeIBL(position, normal, lightDirection, lightColorHdr, material);
    #endif

    #ifdef USE_CLEARCOAT
        color = addClearcoatReflection(color, position, lightDirection, lightColorHdr, material);
    #endif

    return color;
}
#endif

/**
 * Compute the material color under the current lighting conditions.
 * All other material properties are passed through so further stages
 * have access to them.
 *
 * @param {czm_modelMaterial} material The material properties from {@MaterialStageFS}
 * @param {ProcessedAttributes} attributes
 */
void lightingStage(inout czm_modelMaterial material, ProcessedAttributes attributes)
{
    #ifdef LIGHTING_PBR
        #ifdef HAS_NORMALS
            vec3 color = computePbrLighting(material, attributes.positionEC);
        #else
            vec3 color = material.diffuse * material.occlusion + material.emissive;
        #endif
        // In HDR mode, the frame buffer is in linear color space. The
        // post-processing stages (see PostProcessStageCollection) will handle
        // tonemapping. However, if HDR is not enabled, we must tonemap else large
        // values may be clamped to 1.0
        #ifndef HDR
            color = czm_pbrNeutralTonemapping(color);
        #endif
    #else // unlit
        vec3 color = material.diffuse;
    #endif

    #ifdef HAS_POINT_CLOUD_COLOR_STYLE
        // The colors resulting from point cloud styles are adjusted differently.
        color = czm_gammaCorrect(color);
    #elif !defined(HDR)
        // If HDR is not enabled, the frame buffer stores sRGB colors rather than
        // linear colors so the linear value must be converted.
        color = czm_linearToSrgb(color);
    #endif

    material.diffuse = color;
}
