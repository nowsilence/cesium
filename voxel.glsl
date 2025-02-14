#version 300 es
#ifdef GL_FRAGMENT_PRECISION_HIGH
    precision highp float;
    precision highp int;
#else
    precision mediump float;
    precision mediump int;
    #define highp mediump
#endif

#define DEPTH_TEST
#define BOX_INTERSECTION_INDEX 0
#define DEPTH_INTERSECTION_INDEX 1
#define INTERSECTION_COUNT 2
#define PADDING
#define LOG_DEPTH_READ_ONLY
#define NEAREST_SAMPLING
#define SAMPLE_COUNT 1
#define METADATA_COUNT 1
#define OES_texture_float_linear

#define OES_texture_float


#line 0
layout(location = 0) out vec4 out_FragColor;

uniform float czm_log2FarDepthFromNearPlusOne;
uniform vec4 czm_viewport;
uniform vec2 czm_currentFrustum;
uniform vec4 czm_frustumPlanes;
uniform mat4 czm_inverseProjection;
uniform mat4 czm_viewportTransformation;
uniform mat3 czm_inverseViewRotation;
vec4 czm_screenToEyeCoordinates(vec4 screenCoordinate)
{
    
    float x = 2.0 * screenCoordinate.x - 1.0;
    float y = 2.0 * screenCoordinate.y - 1.0;
    float z = (screenCoordinate.z - czm_viewportTransformation[3][2]) / czm_viewportTransformation[2][2];
    vec4 q = vec4(x, y, z, 1.0);

    
    q /= screenCoordinate.w;

    
    if (!(czm_inverseProjection == mat4(0.0))) 
    {
        q = czm_inverseProjection * q;
    }
    else
    {
        float top = czm_frustumPlanes.x;
        float bottom = czm_frustumPlanes.y;
        float left = czm_frustumPlanes.z;
        float right = czm_frustumPlanes.w;

        float near = czm_currentFrustum.x;
        float far = czm_currentFrustum.y;

        q.x = (q.x * (right - left) + left + right) * 0.5;
        q.y = (q.y * (top - bottom) + bottom + top) * 0.5;
        q.z = (q.z * (near - far) - near - far) * 0.5;
        q.w = 1.0;
    }

    return q;
}


























vec4 czm_windowToEyeCoordinates(vec4 fragmentCoordinate)
{
    vec2 screenCoordXY = (fragmentCoordinate.xy - czm_viewport.xy) / czm_viewport.zw;
    return czm_screenToEyeCoordinates(vec4(screenCoordXY, fragmentCoordinate.zw));
}

vec4 czm_screenToEyeCoordinates(vec2 screenCoordinateXY, float depthOrLogDepth)
{
    
#if defined(LOG_DEPTH) || defined(LOG_DEPTH_READ_ONLY)
    float near = czm_currentFrustum.x;
    float far = czm_currentFrustum.y;
    float log2Depth = depthOrLogDepth * czm_log2FarDepthFromNearPlusOne;
    float depthFromNear = pow(2.0, log2Depth) - 1.0;
    float depthFromCamera = depthFromNear + near;
    vec4 screenCoord = vec4(screenCoordinateXY, far * (1.0 - near / depthFromCamera) / (far - near), 1.0);
    vec4 eyeCoordinate = czm_screenToEyeCoordinates(screenCoord);
    eyeCoordinate.w = 1.0 / depthFromCamera; 
    return eyeCoordinate;
#else
    vec4 screenCoord = vec4(screenCoordinateXY, depthOrLogDepth, 1.0);
    vec4 eyeCoordinate = czm_screenToEyeCoordinates(screenCoord);
#endif
    return eyeCoordinate;
}



vec4 czm_windowToEyeCoordinates(vec2 fragmentCoordinateXY, float depthOrLogDepth)
{
    vec2 screenCoordXY = (fragmentCoordinateXY.xy - czm_viewport.xy) / czm_viewport.zw;
    return czm_screenToEyeCoordinates(screenCoordXY, depthOrLogDepth);
}

uniform sampler2D czm_globeDepthTexture;


 float czm_unpackDepth(vec4 packedDepth)
 {
    
    
    return dot(packedDepth, vec4(1.0, 1.0 / 255.0, 1.0 / 65025.0, 1.0 / 16581375.0));
 }


const float czm_infinity = 5906376272000.0;  

uniform vec3 czm_lightDirectionEC;
uniform mat3 czm_normal;


struct czm_modelMaterial {
    vec3 diffuse;
    float alpha;
    vec3 specular;
    float roughness;
    vec3 normalEC;
    float occlusion;
    vec3 emissive;
};



#line 0
uniform int u_selectedTile;
uniform int u_selectedSample;
uniform sampler2D u_megatextureTextures[METADATA_COUNT];
struct PropertyStatistics_color
{
    vec4 min;
    vec4 max;
};
struct Statistics
{
    PropertyStatistics_color color;
};
struct Metadata
{
    Statistics statistics;
    vec4 color;
};
struct VoxelProperty_color
{
    mat4 partialDerivativeLocal;
    mat4 partialDerivativeWorld;
    mat4 partialDerivativeView;
    mat4 partialDerivativeValid;
};
struct Voxel
{
    VoxelProperty_color color;
    vec3 positionEC;
    vec3 positionUv;
    vec3 positionShapeUv;
    vec3 positionUvLocal;
    vec3 viewDirUv;
    vec3 viewDirWorld;
    vec3 surfaceNormal;
    float travelDistance;
    int stepCount;
    int tileIndex;
    int sampleIndex;
};
struct FragmentInput
{
    Metadata metadata;
    Voxel voxel;
};
struct Properties
{
    vec4 color;
};
Properties clearProperties()
{
    Properties properties;
    properties.color = vec4(0.0);
    return properties;
}
Properties sumProperties(Properties propertiesA, Properties propertiesB)
{
    Properties properties;
    properties.color = propertiesA.color + propertiesB.color;
    return properties;
}
Properties scaleProperties(Properties properties, float scale)
{
    Properties scaledProperties = properties;
    scaledProperties.color *= scale;
    return scaledProperties;
}
Properties mixProperties(Properties propertiesA, Properties propertiesB, float mixFactor)
{
    Properties properties;
    properties.color = mix(propertiesA.color, propertiesB.color, mixFactor);
    return properties;
}
void copyPropertiesToMetadata(in Properties properties, inout Metadata metadata)
{
    metadata.color = properties.color;
}
Properties getPropertiesFromMegatextureAtUv(vec2 texcoord)
{
    Properties properties;
    properties.color = texture(u_megatextureTextures[0], texcoord);
    return properties;
}
void fragmentMain(FragmentInput fsInput, inout czm_modelMaterial material)
    {
      vec3 voxelNormal = normalize(czm_normal * fsInput.voxel.surfaceNormal);
      float diffuse = max(0.0, dot(voxelNormal, czm_lightDirectionEC));
      float lighting = 0.5 + 0.5 * diffuse;

      int tileIndex = fsInput.voxel.tileIndex;
      int sampleIndex = fsInput.voxel.sampleIndex;
      vec3 cellColor = fsInput.metadata.color.rgb * lighting;
      if (tileIndex == u_selectedTile && sampleIndex == u_selectedSample) {
material.diffuse = mix(cellColor, vec3(1.0), 0.5);
material.alpha = fsInput.metadata.color.a;
      } else {
material.diffuse = cellColor;
material.alpha = fsInput.metadata.color.a;
      }
    }
#line 0

#define OCTREE_FLAG_INTERNAL 0
#define OCTREE_FLAG_LEAF 1
#define OCTREE_FLAG_PACKED_LEAF_FROM_PARENT 2

#define OCTREE_MAX_LEVELS 32 

uniform sampler2D u_octreeInternalNodeTexture;
uniform vec2 u_octreeInternalNodeTexelSizeUv;
uniform int u_octreeInternalNodeTilesPerRow;
#if (SAMPLE_COUNT > 1)
uniform sampler2D u_octreeLeafNodeTexture;
uniform vec2 u_octreeLeafNodeTexelSizeUv;
uniform int u_octreeLeafNodeTilesPerRow;
#endif

struct OctreeNodeData {
    int data;
    int flag;
};

struct TraversalData {
    ivec4 octreeCoords;
    int parentOctreeIndex;
};

struct SampleData {
    int megatextureIndex;
    ivec4 tileCoords;
    vec3 tileUv;
    #if (SAMPLE_COUNT > 1)
        float weight;
    #endif
};


int intMod(in int a, in int b) {
    return a - (b * (a / b));
}
int normU8_toInt(in float value) {
    return int(value * 255.0);
}
int normU8x2_toInt(in vec2 value) {
    return int(value.x * 255.0) + 256 * int(value.y * 255.0);
}
float normU8x2_toFloat(in vec2 value) {
    return float(normU8x2_toInt(value)) / 65535.0;
}

OctreeNodeData getOctreeNodeData(in vec2 octreeUv) {
    vec4 texData = texture(u_octreeInternalNodeTexture, octreeUv);

    OctreeNodeData data;
    data.data = normU8x2_toInt(texData.xy);
    data.flag = normU8x2_toInt(texData.zw);
    return data;
}

OctreeNodeData getOctreeChildData(in int parentOctreeIndex, in ivec3 childCoord) {
    int childIndex = childCoord.z * 4 + childCoord.y * 2 + childCoord.x;
    int octreeCoordX = intMod(parentOctreeIndex, u_octreeInternalNodeTilesPerRow) * 9 + 1 + childIndex;
    int octreeCoordY = parentOctreeIndex / u_octreeInternalNodeTilesPerRow;
    vec2 octreeUv = u_octreeInternalNodeTexelSizeUv * vec2(float(octreeCoordX) + 0.5, float(octreeCoordY) + 0.5);
    return getOctreeNodeData(octreeUv);
}

int getOctreeParentIndex(in int octreeIndex) {
    int octreeCoordX = intMod(octreeIndex, u_octreeInternalNodeTilesPerRow) * 9;
    int octreeCoordY = octreeIndex / u_octreeInternalNodeTilesPerRow;
    vec2 octreeUv = u_octreeInternalNodeTexelSizeUv * vec2(float(octreeCoordX) + 0.5, float(octreeCoordY) + 0.5);
    vec4 parentData = texture(u_octreeInternalNodeTexture, octreeUv);
    int parentOctreeIndex = normU8x2_toInt(parentData.xy);
    return parentOctreeIndex;
}





vec3 getTileUv(in vec3 shapePosition, in ivec4 octreeCoords) {
	
    float dimAtLevel = exp2(float(octreeCoords.w));
    return shapePosition * dimAtLevel - vec3(octreeCoords.xyz);
}

vec3 getClampedTileUv(in vec3 shapePosition, in ivec4 octreeCoords) {
    vec3 tileUv = getTileUv(shapePosition, octreeCoords);
    return clamp(tileUv, vec3(0.0), vec3(1.0));
}

void getOctreeLeafSampleData(in OctreeNodeData data, in ivec4 octreeCoords, out SampleData sampleData) {
    sampleData.megatextureIndex = data.data;
    sampleData.tileCoords = (data.flag == OCTREE_FLAG_PACKED_LEAF_FROM_PARENT)
        ? ivec4(octreeCoords.xyz / 2, octreeCoords.w - 1)
        : octreeCoords;
}

#if (SAMPLE_COUNT > 1)
void getOctreeLeafSampleDatas(in OctreeNodeData data, in ivec4 octreeCoords, out SampleData sampleDatas[SAMPLE_COUNT]) {
    int leafIndex = data.data;
    int leafNodeTexelCount = 2;
    
    float leafCoordXStart = float(intMod(leafIndex, u_octreeLeafNodeTilesPerRow) * leafNodeTexelCount) + 0.5;
    float leafCoordY = float(leafIndex / u_octreeLeafNodeTilesPerRow) + 0.5;

    
    vec2 leafUv0 = u_octreeLeafNodeTexelSizeUv * vec2(leafCoordXStart + 0.0, leafCoordY);
    vec4 leafData0 = texture(u_octreeLeafNodeTexture, leafUv0);
    float lerp = normU8x2_toFloat(leafData0.xy);
    sampleDatas[0].weight = 1.0 - lerp;
    sampleDatas[1].weight = lerp;
    
    sampleDatas[0].tileCoords = (normU8_toInt(leafData0.z) == 1)
        ? ivec4(octreeCoords.xyz / 2, octreeCoords.w - 1)
        : octreeCoords;
    sampleDatas[1].tileCoords = (normU8_toInt(leafData0.w) == 1)
        ? ivec4(octreeCoords.xyz / 2, octreeCoords.w - 1)
        : octreeCoords;

    
    vec2 leafUv1 = u_octreeLeafNodeTexelSizeUv * vec2(leafCoordXStart + 1.0, leafCoordY);
    vec4 leafData1 = texture(u_octreeLeafNodeTexture, leafUv1);
    sampleDatas[0].megatextureIndex = normU8x2_toInt(leafData1.xy);
    sampleDatas[1].megatextureIndex = normU8x2_toInt(leafData1.zw);
}
#endif

OctreeNodeData traverseOctreeDownwards(in vec3 shapePosition, inout TraversalData traversalData) {
    float sizeAtLevel = exp2(-1.0 * float(traversalData.octreeCoords.w));
    vec3 start = vec3(traversalData.octreeCoords.xyz) * sizeAtLevel;
    vec3 end = start + vec3(sizeAtLevel);
    OctreeNodeData childData;

    for (int i = 0; i < OCTREE_MAX_LEVELS; ++i) {
        
        
        vec3 center = 0.5 * (start + end);
        vec3 childCoord = step(center, shapePosition);

        
        ivec4 octreeCoords = traversalData.octreeCoords;
        traversalData.octreeCoords = ivec4(octreeCoords.xyz * 2 + ivec3(childCoord), octreeCoords.w + 1);

        childData = getOctreeChildData(traversalData.parentOctreeIndex, ivec3(childCoord));

        if (childData.flag != OCTREE_FLAG_INTERNAL) {
            
            break;
        }

        
        start = mix(start, center, childCoord);
        end = mix(center, end, childCoord);
        traversalData.parentOctreeIndex = childData.data;
    }

    return childData;
}





void traverseOctreeFromBeginning(in vec3 shapePosition, out TraversalData traversalData, out SampleData sampleDatas[SAMPLE_COUNT]) {
    traversalData.octreeCoords = ivec4(0);
    traversalData.parentOctreeIndex = 0;

    OctreeNodeData nodeData = getOctreeNodeData(vec2(0.0));
    if (nodeData.flag != OCTREE_FLAG_LEAF) {
        nodeData = traverseOctreeDownwards(shapePosition, traversalData);
    }

    #if (SAMPLE_COUNT == 1)
        getOctreeLeafSampleData(nodeData, traversalData.octreeCoords, sampleDatas[0]);
        sampleDatas[0].tileUv = getClampedTileUv(shapePosition, sampleDatas[0].tileCoords);
    #else
        getOctreeLeafSampleDatas(nodeData, traversalData.octreeCoords, sampleDatas);
        sampleDatas[0].tileUv = getClampedTileUv(shapePosition, sampleDatas[0].tileCoords);
        sampleDatas[1].tileUv = getClampedTileUv(shapePosition, sampleDatas[1].tileCoords);
    #endif
}

bool inRange(in vec3 v, in vec3 minVal, in vec3 maxVal) {
    return clamp(v, minVal, maxVal) == v;
}

bool insideTile(in vec3 shapePosition, in ivec4 octreeCoords) {
    vec3 tileUv = getTileUv(shapePosition, octreeCoords);
	bool inside = inRange(tileUv, vec3(0.0), vec3(1.0));
	
	return inside || octreeCoords.w == 0;
}

void traverseOctreeFromExisting(in vec3 shapePosition, inout TraversalData traversalData, inout SampleData sampleDatas[SAMPLE_COUNT]) {
    if (insideTile(shapePosition, traversalData.octreeCoords)) {
        for (int i = 0; i < SAMPLE_COUNT; i++) {
            sampleDatas[0].tileUv = getClampedTileUv(shapePosition, sampleDatas[0].tileCoords);
        }
        return;
    }

    
    for (int i = 0; i < OCTREE_MAX_LEVELS; ++i) {
        traversalData.octreeCoords.xyz /= 2;
        traversalData.octreeCoords.w -= 1;

        if (insideTile(shapePosition, traversalData.octreeCoords)) {
            break;
        }

        traversalData.parentOctreeIndex = getOctreeParentIndex(traversalData.parentOctreeIndex);
    }

    
    OctreeNodeData nodeData = traverseOctreeDownwards(shapePosition, traversalData);

    #if (SAMPLE_COUNT == 1)
        getOctreeLeafSampleData(nodeData, traversalData.octreeCoords, sampleDatas[0]);
        sampleDatas[0].tileUv = getClampedTileUv(shapePosition, sampleDatas[0].tileCoords);
    #else
        getOctreeLeafSampleDatas(nodeData, traversalData.octreeCoords, sampleDatas);
        sampleDatas[0].tileUv = getClampedTileUv(shapePosition, sampleDatas[0].tileCoords);
        sampleDatas[1].tileUv = getClampedTileUv(shapePosition, sampleDatas[1].tileCoords);
    #endif
}

struct Ray {
    vec3 pos;
    vec3 dir;
    vec3 rawDir;
};

#if defined(JITTER)




float hash(vec2 p)
{
    vec3 p3 = fract(vec3(p.xyx) * 50.0);
    p3 += dot(p3, p3.yzx + 19.19);
    return fract((p3.x + p3.y) * p3.z);
}
#endif

float minComponent(in vec3 v) {
    return min(min(v.x, v.y), v.z);
}

float maxComponent(in vec3 v) {
    return max(max(v.x, v.y), v.z);
}

struct PointJacobianT { // 雅可比矩阵
    vec3 point;
    mat3 jacobianT;
};

/* Intersection defines
#define INTERSECTION_COUNT ###
*/

#define NO_HIT (-czm_infinity)
#define INF_HIT (czm_infinity * 0.5)

struct RayShapeIntersection {
    vec4 entry;
    vec4 exit;
};

vec4 intersectionMin(in vec4 intersect0, in vec4 intersect1)
{
    if (intersect0.w == NO_HIT) {
        return intersect1;
    } else if (intersect1.w == NO_HIT) {
        return intersect0;
    }
    return (intersect0.w <= intersect1.w) ? intersect0 : intersect1;
}

vec4 intersectionMax(in vec4 intersect0, in vec4 intersect1)
{
    return (intersect0.w >= intersect1.w) ? intersect0 : intersect1;
}

RayShapeIntersection intersectIntersections(in Ray ray, in RayShapeIntersection intersect0, in RayShapeIntersection intersect1)
{
    bool missed = (intersect0.entry.w == NO_HIT) ||
        (intersect1.entry.w == NO_HIT) ||
        (intersect0.exit.w < intersect1.entry.w) ||
        (intersect0.entry.w > intersect1.exit.w);
    if (missed) {
        vec4 miss = vec4(normalize(ray.dir), NO_HIT);
        return RayShapeIntersection(miss, miss);
    }

    vec4 entry = intersectionMax(intersect0.entry, intersect1.entry);
    vec4 exit = intersectionMin(intersect0.exit, intersect1.exit);

    return RayShapeIntersection(entry, exit);
}

struct Intersections {
    

    
    vec4 intersections[INTERSECTION_COUNT * 2];

    #if (INTERSECTION_COUNT > 1)
        
        int index;
        int surroundCount;
        bool surroundIsPositive;
    #endif
};

RayShapeIntersection getFirstIntersection(in Intersections ix) 
{
    return RayShapeIntersection(ix.intersections[0], ix.intersections[1]);
}

vec4 encodeIntersectionType(vec4 intersection, int index, bool entry)
{
    float scale = float(index > 0) * 2.0 + float(!entry) + 1.0;
    return vec4(intersection.xyz * scale, intersection.w);
}


#define setIntersection(/*inout Intersections*/ ix, /*int*/ index, /*float*/ t, /*bool*/ positive, /*bool*/ enter) (ix).intersections[(index)] = vec4(0.0, float(!positive) * 2.0 + float(!enter) + 1.0, 0.0, (t))
#define setIntersectionPair(/*inout Intersections*/ ix, /*int*/ index, /*vec2*/ entryExit) (ix).intersections[(index) * 2 + 0] = vec4(0.0, float((index) > 0) * 2.0 + 1.0, 0.0, (entryExit).x); (ix).intersections[(index) * 2 + 1] = vec4(0.0, float((index) > 0) * 2.0 + 2.0, 0.0, (entryExit).y)
#define setSurfaceIntersection(/*inout Intersections*/ ix, /*int*/ index, /*vec4*/ intersection, /*bool*/ positive, /*bool*/ enter) (ix).intersections[(index)] = encodeIntersectionType((intersection), int(!positive), (enter))
#define setShapeIntersection(/*inout Intersections*/ ix, /*int*/ index, /*RayShapeIntersection*/ intersection) (ix).intersections[(index) * 2 + 0] = encodeIntersectionType((intersection).entry, (index), true); (ix).intersections[(index) * 2 + 1] = encodeIntersectionType((intersection).exit, (index), false)

#if (INTERSECTION_COUNT > 1)
void initializeIntersections(inout Intersections ix) {
    
    
    
    const int sortPasses = INTERSECTION_COUNT * 2 - 1;
    for (int n = sortPasses; n > 0; --n) {
        for (int i = 0; i < sortPasses; ++i) {
            
            
            if (i >= n) { break; }

            vec4 intersect0 = ix.intersections[i + 0];
            vec4 intersect1 = ix.intersections[i + 1];

            bool inOrder = intersect0.w <= intersect1.w;

            ix.intersections[i + 0] = inOrder ? intersect0 : intersect1;
            ix.intersections[i + 1] = inOrder ? intersect1 : intersect0;
        }
    }

    
    ix.index = 0;
    ix.surroundCount = 0;
    ix.surroundIsPositive = false;
}
#endif

#if (INTERSECTION_COUNT > 1)
RayShapeIntersection nextIntersection(inout Intersections ix) {
    vec4 surfaceIntersection = vec4(0.0, 0.0, 0.0, NO_HIT);
    RayShapeIntersection shapeIntersection = RayShapeIntersection(surfaceIntersection, surfaceIntersection);

    const int passCount = INTERSECTION_COUNT * 2;

    if (ix.index == passCount) {
        return shapeIntersection;
    }

    for (int i = 0; i < passCount; ++i) {
        
        
        if (i < ix.index) {
            continue;
        }

        ix.index = i + 1;

        surfaceIntersection = ix.intersections[i];
        int intersectionType = int(length(surfaceIntersection.xyz) - 0.5);
        bool currShapeIsPositive = intersectionType < 2;
        bool enter = intMod(intersectionType, 2) == 0;

        ix.surroundCount += enter ? +1 : -1;
        ix.surroundIsPositive = currShapeIsPositive ? enter : ix.surroundIsPositive;

        
        if (ix.surroundCount == 1 && ix.surroundIsPositive && enter == currShapeIsPositive) {
            shapeIntersection.entry = surfaceIntersection;
        }

        
        bool exitPositive = !enter && currShapeIsPositive && ix.surroundCount == 0;
        bool enterNegativeFromPositive = enter && !currShapeIsPositive && ix.surroundCount == 2 && ix.surroundIsPositive;
        if (exitPositive || enterNegativeFromPositive) {
            shapeIntersection.exit = surfaceIntersection;

            
            if (exitPositive) {
                
                ix.index = passCount;
            }
            break;
        }
    }

    return shapeIntersection;
}
#endif





/* Megatexture defines (set in Scene/VoxelRenderResources.js)
#define SAMPLE_COUNT ###
#define NEAREST_SAMPLING
#define PADDING
*/

uniform ivec2 u_megatextureSliceDimensions; 
uniform ivec2 u_megatextureTileDimensions; 
uniform vec2 u_megatextureVoxelSizeUv;
uniform vec2 u_megatextureSliceSizeUv;
uniform vec2 u_megatextureTileSizeUv;

uniform ivec3 u_dimensions; 
#if defined(PADDING)
    uniform ivec3 u_paddingBefore;
    uniform ivec3 u_paddingAfter;
#endif


int intMin(int a, int b) {
    return a <= b ? a : b;
}
int intMax(int a, int b) {
    return a >= b ? a : b;
}
int intClamp(int v, int minVal, int maxVal) {
    return intMin(intMax(v, minVal), maxVal);
}

vec2 index1DTo2DTexcoord(int index, ivec2 dimensions, vec2 uvScale)
{
    int indexX = intMod(index, dimensions.x);
    int indexY = index / dimensions.x;
    return vec2(indexX, indexY) * uvScale;
}

/*
    How is 3D data stored in a 2D megatexture?

    In this example there is only one loaded tile and it has 2x2x2 voxels (8 voxels total).
    The data is sliced by Z. The data at Z = 0 is placed in texels (0,0), (0,1), (1,0), (1,1) and
    the data at Z = 1 is placed in texels (2,0), (2,1), (3,0), (3,1).
    Note that there could be empty space in the megatexture because it's a power of two.

      0   1   2   3
    +---+---+---+---+
    |   |   |   |   | 3
    +---+---+---+---+
    |   |   |   |   | 2
    +-------+-------+
    |010|110|011|111| 1
    |--- ---|--- ---|
    |000|100|001|101| 0
    +-------+-------+

    When doing linear interpolation the megatexture needs to be sampled twice: once for
    the Z slice above the voxel coordinate and once for the slice below. The two slices
    are interpolated with fract(coord.z - 0.5). For example, a Z coordinate of 1.0 is
    halfway between two Z slices so the interpolation factor is 0.5. Below is a side view
    of the 3D voxel grid with voxel coordinates on the left side.

    2 +---+
      |001|
    1 +-z-+
      |000|
    0 +---+

    When doing nearest neighbor the megatexture only needs to be sampled once at the closest Z slice.
*/

Properties getPropertiesFromMegatexture(in SampleData sampleData) {
    int tileIndex = sampleData.megatextureIndex;
    vec3 voxelCoord = sampleData.tileUv * vec3(u_dimensions);
    ivec3 voxelDimensions = u_dimensions;

    #if defined(PADDING)
        voxelDimensions += u_paddingBefore + u_paddingAfter;
        voxelCoord += vec3(u_paddingBefore);
    #endif

    #if defined(NEAREST_SAMPLING)
        
        voxelCoord = floor(voxelCoord) + vec3(0.5);
    #endif

    
    vec2 tileUvOffset = index1DTo2DTexcoord(tileIndex, u_megatextureTileDimensions, u_megatextureTileSizeUv);

    
    float slice = voxelCoord.z - 0.5;
    int sliceIndex = int(floor(slice));
    int sliceIndex0 = intClamp(sliceIndex, 0, voxelDimensions.z - 1);
    vec2 sliceUvOffset0 = index1DTo2DTexcoord(sliceIndex0, u_megatextureSliceDimensions, u_megatextureSliceSizeUv);

    
    vec2 voxelUvOffset = clamp(voxelCoord.xy, vec2(0.5), vec2(voxelDimensions.xy) - vec2(0.5)) * u_megatextureVoxelSizeUv;

    
    vec2 uv0 = tileUvOffset + sliceUvOffset0 + voxelUvOffset;

    #if defined(NEAREST_SAMPLING)
        return getPropertiesFromMegatextureAtUv(uv0);
    #else
        float sliceLerp = fract(slice);
        int sliceIndex1 = intMin(sliceIndex + 1, voxelDimensions.z - 1);
        vec2 sliceUvOffset1 = index1DTo2DTexcoord(sliceIndex1, u_megatextureSliceDimensions, u_megatextureSliceSizeUv);
        vec2 uv1 = tileUvOffset + sliceUvOffset1 + voxelUvOffset;
        Properties properties0 = getPropertiesFromMegatextureAtUv(uv0);
        Properties properties1 = getPropertiesFromMegatextureAtUv(uv1);
        return mixProperties(properties0, properties1, sliceLerp);
    #endif
}


Properties accumulatePropertiesFromMegatexture(in SampleData sampleDatas[SAMPLE_COUNT]) {
    #if (SAMPLE_COUNT == 1)
        return getPropertiesFromMegatexture(sampleDatas[0]);
    #else
        
        Properties properties = clearProperties();
        for (int i = 0; i < SAMPLE_COUNT; ++i) {
            float weight = sampleDatas[i].weight;

            
            if (weight > 0.0) {
                Properties tempProperties = getPropertiesFromMegatexture(sampleDatas[i]);
                tempProperties = scaleProperties(tempProperties, weight);
                properties = sumProperties(properties, tempProperties);
            }
        }
        return properties;
    #endif
}




/* intersectDepth defines (set in Scene/VoxelRenderResources.js)
#define DEPTH_INTERSECTION_INDEX ###
*/

uniform mat4 u_transformPositionViewToUv;

void intersectDepth(in vec2 screenCoord, in Ray ray, inout Intersections ix) {
    float logDepthOrDepth = czm_unpackDepth(texture(czm_globeDepthTexture, screenCoord));
    if (logDepthOrDepth != 0.0) {
        
        vec4 eyeCoordinateDepth = czm_screenToEyeCoordinates(screenCoord, logDepthOrDepth);
        eyeCoordinateDepth /= eyeCoordinateDepth.w;
        vec3 depthPositionUv = vec3(u_transformPositionViewToUv * eyeCoordinateDepth);
        float t = dot(depthPositionUv - ray.pos, ray.dir);
        setIntersectionPair(ix, DEPTH_INTERSECTION_INDEX, vec2(t, +INF_HIT));
    } else {
        
        setIntersectionPair(ix, DEPTH_INTERSECTION_INDEX, vec2(NO_HIT));
    }
}

/* Box defines (set in Scene/VoxelBoxShape.js)
#define BOX_HAS_SHAPE_BOUNDS
*/

#if defined(BOX_HAS_SHAPE_BOUNDS)
    uniform vec3 u_boxUvToShapeUvScale;
    uniform vec3 u_boxUvToShapeUvTranslate;
#endif

PointJacobianT convertUvToShapeSpaceDerivative(in vec3 positionUv) {
    
    
    
    return PointJacobianT(positionUv, mat3(0.5));
}

vec3 convertShapeToShapeUvSpace(in vec3 positionShape) {
#if defined(BOX_HAS_SHAPE_BOUNDS)
    return positionShape * u_boxUvToShapeUvScale + u_boxUvToShapeUvTranslate;
#else
    return positionShape;
#endif
}

PointJacobianT convertUvToShapeUvSpaceDerivative(in vec3 positionUv) {
    PointJacobianT pointJacobian = convertUvToShapeSpaceDerivative(positionUv);
    pointJacobian.point = convertShapeToShapeUvSpace(pointJacobian.point);
    return pointJacobian;
}

vec3 convertShapeUvToUvSpace(in vec3 shapeUv) {
#if defined(BOX_HAS_SHAPE_BOUNDS)
    return (shapeUv - u_boxUvToShapeUvTranslate) / u_boxUvToShapeUvScale;
#else
    return shapeUv;
#endif
}

vec3 scaleShapeUvToShapeSpace(in vec3 shapeUv) {
#if defined(BOX_HAS_SHAPE_BOUNDS)
    return shapeUv / u_boxUvToShapeUvScale;
#else
    return shapeUv;
#endif
}



/* Box defines (set in Scene/VoxelBoxShape.js)
#define BOX_INTERSECTION_INDEX ### 
*/

uniform vec3 u_renderMinBounds;
uniform vec3 u_renderMaxBounds;

RayShapeIntersection intersectBox(in Ray ray, in vec3 minBound, in vec3 maxBound)
{
    
    
    vec3 t0 = (minBound - ray.pos) / ray.dir;
    vec3 t1 = (maxBound - ray.pos) / ray.dir;

    
    vec3 entries = min(t0, t1);
    vec3 exits = max(t0, t1);

    vec3 directions = sign(ray.dir);

    
    float lastEntry = maxComponent(entries);
    bvec3 isLastEntry = equal(entries, vec3(lastEntry));
    vec3 entryNormal = -1.0 * vec3(isLastEntry) * directions;
    vec4 entry = vec4(entryNormal, lastEntry);

    float firstExit = minComponent(exits);
    bvec3 isFirstExit = equal(exits, vec3(firstExit));
    vec3 exitNormal = vec3(isLastEntry) * directions;
    vec4 exit = vec4(exitNormal, firstExit);

    if (entry.w > exit.w) {
        entry.w = NO_HIT;
        exit.w = NO_HIT;
    }

    return RayShapeIntersection(entry, exit);
}

void intersectShape(in Ray ray, inout Intersections ix)
{
    RayShapeIntersection intersection = intersectBox(ray, u_renderMinBounds, u_renderMaxBounds);
    setShapeIntersection(ix, BOX_INTERSECTION_INDEX, intersection);
}










/* Intersection defines (set in Scene/VoxelRenderResources.js)
#define INTERSECTION_COUNT ###
*/

RayShapeIntersection intersectScene(in vec2 screenCoord, in Ray ray, out Intersections ix) {
    
    intersectShape(ray, ix);

    
    RayShapeIntersection intersection = getFirstIntersection(ix);
    if (intersection.entry.w == NO_HIT) {
        
        return intersection;
    }

    
    #if defined(CLIPPING_PLANES)
        intersectClippingPlanes(ray, ix);
    #endif

    
    #if defined(DEPTH_TEST)
        intersectDepth(screenCoord, ray, ix);
    #endif

    
    #if (INTERSECTION_COUNT > 1)
        initializeIntersections(ix);
        for (int i = 0; i < INTERSECTION_COUNT; ++i) {
            intersection = nextIntersection(ix);
            if (intersection.exit.w > 0.0) {
                
                intersection.entry.w = max(intersection.entry.w, 0.0);
                break;
            }
        }
    #else
        
        intersection.entry.w = max(intersection.entry.w, 0.0);
    #endif

    return intersection;
}











#define STEP_COUNT_MAX 1000 
#if defined(PICKING_VOXEL)
    #define ALPHA_ACCUM_MAX 0.1
#else
    #define ALPHA_ACCUM_MAX 0.98 
#endif

uniform mat3 u_transformDirectionViewToLocal;
uniform vec3 u_cameraPositionUv;
uniform float u_stepSize;

#if defined(PICKING)
    uniform vec4 u_pickColor;
#endif

vec3 getSampleSize(in int level) {
    vec3 sampleCount = exp2(float(level)) * vec3(u_dimensions);
    vec3 sampleSizeUv = 1.0 / sampleCount;
    return scaleShapeUvToShapeSpace(sampleSizeUv);
}

#define MINIMUM_STEP_SCALAR (0.02)
#define SHIFT_FRACTION (0.001)







RayShapeIntersection getVoxelIntersection(in vec3 tileUv, in vec3 sampleSizeAlongRay) {
    vec3 voxelCoord = tileUv * vec3(u_dimensions);
    vec3 directions = sign(sampleSizeAlongRay);
    vec3 positiveDirections = max(directions, 0.0);
    vec3 entryCoord = mix(ceil(voxelCoord), floor(voxelCoord), positiveDirections);
    vec3 exitCoord = entryCoord + directions;

    vec3 distanceFromEntry = -abs((entryCoord - voxelCoord) * sampleSizeAlongRay);
    float lastEntry = maxComponent(distanceFromEntry);
    bvec3 isLastEntry = equal(distanceFromEntry, vec3(lastEntry));
    vec3 entryNormal = -1.0 * vec3(isLastEntry) * directions;
    vec4 entry = vec4(entryNormal, lastEntry);

    vec3 distanceToExit = abs((exitCoord - voxelCoord) * sampleSizeAlongRay);
    float firstExit = minComponent(distanceToExit);
    bvec3 isFirstExit = equal(distanceToExit, vec3(firstExit));
    vec3 exitNormal = vec3(isFirstExit) * directions;
    vec4 exit = vec4(exitNormal, firstExit);

    return RayShapeIntersection(entry, exit);
}

vec4 getStepSize(in SampleData sampleData, in Ray viewRay, in RayShapeIntersection shapeIntersection, in mat3 jacobianT, in float currentT) {
    
    
    
    vec3 gradient = 2.0 * viewRay.rawDir * jacobianT;
    vec3 sampleSizeAlongRay = getSampleSize(sampleData.tileCoords.w) / gradient;

    RayShapeIntersection voxelIntersection = getVoxelIntersection(sampleData.tileUv, sampleSizeAlongRay);

    
    vec3 voxelNormal = normalize(jacobianT * voxelIntersection.entry.xyz);
    
    vec4 voxelEntry = vec4(voxelNormal, currentT + voxelIntersection.entry.w);
    vec4 entry = intersectionMax(shapeIntersection.entry, voxelEntry);

    float fixedStep = minComponent(abs(sampleSizeAlongRay)) * u_stepSize;
    float shift = fixedStep * SHIFT_FRACTION;
    float dt = voxelIntersection.exit.w + shift;
    if ((currentT + dt) > shapeIntersection.exit.w) {
        
        dt = shapeIntersection.exit.w - currentT + shift;
    }
    float stepSize = clamp(dt, fixedStep * MINIMUM_STEP_SCALAR, fixedStep + shift);

    return vec4(entry.xyz, stepSize);
}

vec2 packIntToVec2(int value) {
    float shifted = float(value) / 255.0;
    float lowBits = fract(shifted);
    float highBits = floor(shifted) / 255.0;
    return vec2(highBits, lowBits);
}

vec2 packFloatToVec2(float value) {
    float lowBits = fract(value);
    float highBits = floor(value) / 255.0;
    return vec2(highBits, lowBits);
}

int getSampleIndex(in vec3 tileUv) {
    ivec3 voxelDimensions = u_dimensions;
    vec3 sampleCoordinate = tileUv * vec3(voxelDimensions);
    
    
    
    vec3 maxCoordinate = vec3(voxelDimensions) - vec3(0.5);
    sampleCoordinate = clamp(sampleCoordinate, vec3(0.0), maxCoordinate);
    ivec3 sampleIndex = ivec3(floor(sampleCoordinate));
    #if defined(PADDING)
        voxelDimensions += u_paddingBefore + u_paddingAfter;
        sampleIndex += u_paddingBefore;
    #endif
    
    return sampleIndex.x + voxelDimensions.x * (sampleIndex.y + voxelDimensions.y * sampleIndex.z);
}

void main()
{
    vec4 fragCoord = gl_FragCoord;
    vec2 screenCoord = (fragCoord.xy - czm_viewport.xy) / czm_viewport.zw; 
    vec3 eyeDirection = normalize(czm_windowToEyeCoordinates(fragCoord).xyz);
    vec3 viewDirWorld = normalize(czm_inverseViewRotation * eyeDirection); 
    vec3 viewDirUv = normalize(u_transformDirectionViewToLocal * eyeDirection); 
    vec3 viewPosUv = u_cameraPositionUv;
    #if defined(SHAPE_ELLIPSOID)
        vec3 rawDir = viewDirUv * u_ellipsoidRadiiUv;
        Ray viewRayUv = Ray(viewPosUv, viewDirUv, rawDir);
    #else
        Ray viewRayUv = Ray(viewPosUv, viewDirUv, viewDirUv);
    #endif

    Intersections ix;
    RayShapeIntersection shapeIntersection = intersectScene(screenCoord, viewRayUv, ix);

    
    if (shapeIntersection.entry.w == NO_HIT) {
        discard;
    }

    float currentT = shapeIntersection.entry.w;
    float endT = shapeIntersection.exit.w;
    vec3 positionUv = viewPosUv + currentT * viewDirUv;
    PointJacobianT pointJacobian = convertUvToShapeUvSpaceDerivative(positionUv);

    
    TraversalData traversalData;
    SampleData sampleDatas[SAMPLE_COUNT];
    traverseOctreeFromBeginning(pointJacobian.point, traversalData, sampleDatas);
    vec4 step = getStepSize(sampleDatas[0], viewRayUv, shapeIntersection, pointJacobian.jacobianT, currentT);

    #if defined(JITTER)
        float noise = hash(screenCoord); 
        currentT += noise * step.w;
        positionUv += noise * step.w * viewDirUv;
    #endif

    FragmentInput fragmentInput;
    #if defined(STATISTICS)
        setStatistics(fragmentInput.metadata.statistics);
    #endif

    vec4 colorAccum = vec4(0.0);

    for (int stepCount = 0; stepCount < STEP_COUNT_MAX; ++stepCount) {
        
        Properties properties = accumulatePropertiesFromMegatexture(sampleDatas);

        
        copyPropertiesToMetadata(properties, fragmentInput.metadata);
        fragmentInput.voxel.positionUv = positionUv;
        fragmentInput.voxel.positionShapeUv = pointJacobian.point;
        fragmentInput.voxel.positionUvLocal = sampleDatas[0].tileUv;
        fragmentInput.voxel.viewDirUv = viewDirUv;
        fragmentInput.voxel.viewDirWorld = viewDirWorld;
        fragmentInput.voxel.surfaceNormal = step.xyz;
        fragmentInput.voxel.travelDistance = step.w;
        fragmentInput.voxel.stepCount = stepCount;
        fragmentInput.voxel.tileIndex = sampleDatas[0].megatextureIndex;
        fragmentInput.voxel.sampleIndex = getSampleIndex(sampleDatas[0].tileUv);

        
        czm_modelMaterial materialOutput;
        fragmentMain(fragmentInput, materialOutput);

        
        vec4 color = vec4(materialOutput.diffuse, materialOutput.alpha);
        color.rgb = max(color.rgb, vec3(0.0));
        color.a = clamp(color.a, 0.0, 1.0);

        
        colorAccum += (1.0 - colorAccum.a) * vec4(color.rgb * color.a, color.a);

        
        if (colorAccum.a > ALPHA_ACCUM_MAX) {
            colorAccum.a = ALPHA_ACCUM_MAX;
            break;
        }

        if (step.w == 0.0) {
            
            
            step.w == 0.00001;
        }

        
        currentT += step.w;
        positionUv = viewPosUv + currentT * viewDirUv;

        
        if (currentT > endT) {
            #if (INTERSECTION_COUNT == 1)
                break;
            #else
                shapeIntersection = nextIntersection(ix);
                if (shapeIntersection.entry.w == NO_HIT) {
                    break;
                } else {
                    
                    currentT = shapeIntersection.entry.w;
                    endT = shapeIntersection.exit.w;
                    positionUv = viewPosUv + currentT * viewDirUv;
                }
            #endif
        }

        
        
        pointJacobian = convertUvToShapeUvSpaceDerivative(positionUv);
        traverseOctreeFromExisting(pointJacobian.point, traversalData, sampleDatas);
        step = getStepSize(sampleDatas[0], viewRayUv, shapeIntersection, pointJacobian.jacobianT, currentT);
    }

    
    colorAccum.a /= ALPHA_ACCUM_MAX;

    #if defined(PICKING)
        
        if (colorAccum.a == 0.0) {
            discard;
        }
        out_FragColor = u_pickColor;
    #elif defined(PICKING_VOXEL)
        
        if (colorAccum.a == 0.0) {
            discard;
        }
        vec2 megatextureId = packIntToVec2(sampleDatas[0].megatextureIndex);
        vec2 sampleIndex = packIntToVec2(getSampleIndex(sampleDatas[0].tileUv));
        out_FragColor = vec4(megatextureId, sampleIndex);
    #else
        out_FragColor = colorAccum;
    #endif
}
