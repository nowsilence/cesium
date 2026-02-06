import { Cesium, getViewer } from "./index.js";
const viewer = await getViewer();

/**
 * gltfResource/typedArray/gltfJson三者选其一即可
 */
const gltf = new Cesium.GltfLoader({
    baseResource: undefined, // 作为资源的基准路径
    gltfResource: undefined, // 直接指向GLTF文件的具体路径/资源
    typedArray: undefined, // 二进制格式的GLTF，即.glb 文件
    gltfJson: undefined,  // 完整的 GLTF JSON 对象
})

// gltfJson 结构
const gltfJson = {
    "asset": {
        "version": "2.0",  // 必选：GLTF版本号（2.0是目前最主流的版本）
        "generator": "Blender 4.0",  // 可选：生成该GLTF的工具（如Blender、3ds Max）
        "copyright": "© 2026 Example Inc."  // 可选：版权信息
    },
    "images": [
        {
            "uri": "textures/color.jpg" // 纹理图片路径（相对baseResource）
        }
    ],
    "samplers": [
        {
            "magFilter": 9729,   // 放大过滤方式（9729=LINEAR，线性过滤）
            "minFilter": 9987,   // 缩小过滤方式（9987=LINEAR_MIPMAP_LINEAR）
            "wrapS": 10497,      // S轴（U）包裹方式（重复）
            "wrapT": 10497       // T轴（V）包裹方式（重复）
        }
    ],
    "textures": [
        {
            "source": 0,         // 关联第0个image
            "sampler": 0         // 关联第0个sampler
        }
    ],
    "materials": [
        {
            "pbrMetallicRoughness": { // PBR材质（主流）
                "baseColorTexture": {
                    "index": 0       // 基础颜色纹理关联第0个texture
                },
                "metallicFactor": 1.0,   // 金属度
                "roughnessFactor": 0.5   // 粗糙度
            }
        }
    ],
    "buffers": [
        {
            "uri": "model.bin",  // 外部二进制文件路径（相对baseResource）
            "byteLength": 1024   // 必选：二进制文件总字节数
        }
    ],
    "bufferViews": [
        {
            "buffer": 0,         // 关联第0个buffer
            "byteOffset": 0,     // 从buffer的第0字节开始
            "byteLength": 768,   // 截取768字节
            "target": 34962      // 可选：标识用途（34962=ARRAY_BUFFER，存储顶点数据）
        }
    ],
    "accessors": [
        {
            "bufferView": 0,     // 关联第0个bufferView
            "byteOffset": 0,     // 从bufferView的第0字节开始
            "componentType": 5126, // 数据类型（5126=FLOAT32）
            "count": 64,         // 数据元素数量（64个顶点）
            "type": "VEC3",      // 元素类型（VEC3=三维向量，对应顶点坐标）
            "min": [-1, -1, -1], // 可选：数据最小值（优化渲染）
            "max": [1, 1, 1]     // 可选：数据最大值
        }
    ],
   "meshes": [ // 定义 “几何网格”（关联 accessors 的顶点数据 + 材质）；
        {
            "primitives": [      // 基本图元（一个mesh可以包含多个primitive）
                {
                    "attributes": {
                        "POSITION": 0  // 顶点坐标关联第0个accessor
                    },
                    "mode": 4, // TRIANGLES（三角形图元）
                    "indices": 1,    // 索引数据关联第1个accessor（可选，优化顶点复用）
                    "material": 0,    // 关联第0个材质（可选）
                    // 变形目标数组：2个变形目标
                    "targets": [
                        { "POSITION": 1 }, // 变形目标1：POSITION 偏移量对应 accessor 1
                        { "POSITION": 2 }  // 变形目标2：POSITION 偏移量对应 accessor 2
                    ]
                }
            ],
            // 变形目标权重：控制每个变形目标的混合程度（0~1）
            "morphTargetsWeights": [0.5, 0.8]
        }
  ],
  "nodes": [ // 定义 “节点”（可以理解为 3D 空间中的一个 “对象”，关联 mesh、位置 / 旋转 / 缩放）；
        {
            "mesh": 0,           // 关联第0个mesh
            "translation": [0, 0, 0], // 位置
            "rotation": [0, 0, 0, 1], // 旋转（四元数）
            "scale": [1, 1, 1]   // 缩放
        }
  ],
  "scenes": [ // 定义 “场景”（一组节点的集合，是渲染的入口）。
        {
            "nodes": [0]         // 场景包含第0个节点
        }
  ],
  "scene": 0 
}