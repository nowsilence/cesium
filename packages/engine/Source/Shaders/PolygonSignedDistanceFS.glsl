in vec2 v_textureCoordinates;

uniform int u_polygonsLength;
uniform int u_extentsLength;
uniform highp sampler2D u_polygonTexture;
uniform highp sampler2D u_extentsTexture;

int getPolygonIndex(float dimension, vec2 coord) {
   vec2 uv = coord.xy * dimension;
   return int(floor(uv.y) * dimension + floor(uv.x));
}

vec2 getLookupUv(ivec2 dimensions, int i) {
    int pixY = i / dimensions.x;
    int pixX = i - (pixY * dimensions.x);
    float pixelWidth = 1.0 / float(dimensions.x);
    float pixelHeight = 1.0 / float(dimensions.y);
    float u = (float(pixX) + 0.5) * pixelWidth; // sample from center of pixel
    float v = (float(pixY) + 0.5) * pixelHeight;
    return vec2(u, v);
}

vec4 getExtents(int i) {
    return texture(u_extentsTexture, getLookupUv(textureSize(u_extentsTexture, 0), i));
}

ivec2 getPositionsLengthAndExtentsIndex(int i) {
    vec2 uv = getLookupUv(textureSize(u_polygonTexture, 0), i);
    vec4 value = texture(u_polygonTexture, uv);
    return ivec2(int(value.x), int(value.y));
}

vec2 getPolygonPosition(int i) {
    vec2 uv = getLookupUv(textureSize(u_polygonTexture, 0), i);
    return texture(u_polygonTexture, uv).xy;
}

vec2 getCoordinates(vec2 textureCoordinates, vec4 extents) {
    float latitude = mix(extents.x, extents.x + 1.0 / extents.z, textureCoordinates.y);
    float longitude = mix(extents.y, extents.y + 1.0 / extents.w, textureCoordinates.x);
    return vec2(latitude, longitude);
}

void main() {
    int lastPolygonIndex = 0;
    out_FragColor = vec4(1.0);

    // Get the relevant region of the texture
    float dimension = float(u_extentsLength);
    if (u_extentsLength > 2) { 
        // 维度 可表示为存储extent需要dimension行dimension列
        // 会把一个大的纹理分成dimension*dimension的区域，每一个区域存放一个exent
        dimension = ceil(log2(float(u_extentsLength)));
    }
    // 根据从顶点着色器传过来的v_textureCoordinates，确定当前片段在哪个区域
    int regionIndex = getPolygonIndex(dimension, v_textureCoordinates);

    for (int polygonIndex = 0; polygonIndex < u_polygonsLength; polygonIndex++) {
        ivec2 positionsLengthAndExtents = getPositionsLengthAndExtentsIndex(lastPolygonIndex);
        int positionsLength = positionsLengthAndExtents.x;
        // polygon对应的extent的索引
        int polygonExtentsIndex = positionsLengthAndExtents.y;
        lastPolygonIndex += 1;

         // Only compute signed distance for the relevant part of the atlas
         if (polygonExtentsIndex == regionIndex) {
            float clipAmount = czm_infinity;
            vec4 extents = getExtents(polygonExtentsIndex);
            vec2 textureOffset = vec2(mod(float(polygonExtentsIndex), dimension), floor(float(polygonExtentsIndex) / dimension)) / dimension;
            vec2 p = getCoordinates((v_textureCoordinates - textureOffset) * dimension, extents);
            float s = 1.0;

            // Check each edge for absolute distance
            // 计算点p在多边形内部还是外部，以及最近的距离
            for (int i = 0, j = positionsLength - 1; i < positionsLength; j = i, i++) {
                vec2 a = getPolygonPosition(lastPolygonIndex + i);
                vec2 b = getPolygonPosition(lastPolygonIndex + j);
 
                vec2 ab = b - a;
                vec2 pa = p - a;
                float t = dot(pa, ab) / dot(ab, ab);
                t = clamp(t, 0.0, 1.0);

                vec2 pq = pa - t * ab; // t * ab 最近点
                float d = length(pq); // 距离

                // 用于测试给定的布尔向量中的所有元素是否均为true，类似的有any，not
                // Inside / outside computation to determine sign
                bvec3 cond = bvec3(p.y >= a.y, 
                            p.y < b.y, 
                            ab.x * pa.y > ab.y * pa.x); // 叉乘
                if (all(cond) || all(not(cond))) s = -s;
                if (abs(d) < abs(clipAmount)) {
                    clipAmount = d; // 点p到边的最小距离
                }
            }

            // Normalize the range to [0,1]
            vec4 result = (s * vec4(clipAmount * length(extents.zw))) / 2.0 + 0.5;
            // In the case where we've iterated through multiple polygons, take the minimum
            out_FragColor = min(out_FragColor, result);
         }

        lastPolygonIndex += positionsLength;
    }
}