import { Cesium, getViewer } from "./index.js";
const viewer = await getViewer();
const type = 0;

const positions = Cesium.Cartesian3.fromDegreesArrayHeights([
    19.0, 47.0, 10000.0,
    19.0, 48.0, 10000.0,
    20.0, 48.0, 10000.0,
    20.0, 47.0, 10000.0,
    19.0, 47.0, 10000.0]);

{
    const image = './Tests/images/linear.png';
    const color = new Cesium.Color.fromCssColorString('rgba(0, 255, 255, 1)');
    const speed = 2;
    const source =
    'czm_material czm_getMaterial(czm_materialInput materialInput)\n\
    {\n\
        czm_material material = czm_getDefaultMaterial(materialInput);\n\
        vec2 st = materialInput.st;\n\
        vec4 colorImage = texture(image, vec2(st.s, fract(st.t - speed*czm_frameNumber*0.005)));\n\
        material.alpha = colorImage.a * color.a;\n\
        material.diffuse = (colorImage.rgb+color.rgb)/2.0;\n\
        return material;\n\
    }';
    Cesium.Material._materialCache.addMaterial('Pulse', {
        fabric: {
            type: 'Pulse',
            uniforms: {
            color: color,
            image: image,
            speed: speed,
            },
            source: source,
        },
        translucent: function () {
            return true
        },
    });
}

if (type == 0) {
    

    const wall = new Cesium.WallGeometry({
        positions,
        // granularity: CesiumMath.RADIANS_PER_DEGREE, // 粒度
        // minimumHeights: [], // 最低点数组 必须与positions数量相等，若为配置最低点高程为0
        // maximumHeights: [], // 最高点数组 必须与positions数量相等，若未配置最高点为传入点的高程
    });

    const geometryInstance = new Cesium.GeometryInstance({
        geometry: wall,
        id: 'sid',
        attributes: {
        }
    });


    viewer.scene.primitives.add(
        new Cesium.Primitive({
            asynchronous: false,
            geometryInstances: [geometryInstance],
            appearance: new Cesium.MaterialAppearance({
                material: Cesium.Material.fromType('Pulse', {
                    
                }),
            }),
        })
    );
}

 

if (type == 1) 
{
    positions.forEach(it => {
        viewer.entities.add({
            wall: {
                positions,
                show : true,
                fill: true,
                // outline: false,
                // outlineColor: Cesium.Color.BLACK,
                // outlineWidth: 10
                // granularity: CesiumMath.RADIANS_PER_DEGREE, // 粒度
                // minimumHeights: [], // 最低点数组 必须与positions数量相等，若为配置最低点高程为0
                // maximumHeights: [], // 最高点数组 必须与positions数量相等，若未配置最高点为传入点的高程
                // distanceDisplayCondition: new Cesium.DistanceDisplayCondition(1, 10000000), //0.0
            }
        })
    })
}