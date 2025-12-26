import { Cesium, getViewer } from "./index.js";

const viewer = await getViewer();

const rectangle = Cesium.Rectangle.fromDegrees(-120.0, 30.0, -99.0, 39.0);

const i1 = new Cesium.GeometryInstance({
    geometry: new Cesium.RectangleGeometry({
        rectangle: rectangle,
    }),
});

let material;

// Entity
{
    /**
     * 在Entity子类型（polyline/box/corridor/ellipse/ellipsoid/plane/polygon/rectangle/wall等）下的属性material
     * 总共有三只设置方式：
     * 1）Color对象，内部会被构建成ColorMaterialProperty
     * 2)string/Resource/HTMLCanvasElement/HTMLVideElment，内部会被构建成ImageMaterialProperty
     * 3）各种**MaterialProperty的实例对象:
     *      PolylineDashMaterialProperty
     *      ImageMaterialProperty
     *      PolylineArrowMaterialProperty
     *      StripeMaterialProperty
     *      GridMaterialProperty
     *      CompositeMaterialProperty
     *      CheckerboardMaterialProperty
     *      PolylineGlowMaterialProperty
     *      PolylineOutlineMaterialProperty
     */
    viewer.entities.add({
        
        polyline : {
            positions : Cesium.Cartesian3.fromDegreesArrayHeights([
                0, 0, 5550,
                40, 0, 5550,
                // -124, 43, 500000,
                40, 40, 5550
            ]),
            width : 10,
            material: Cesium.Color.RED,
            // material : new Cesium.PolylineArrowMaterialProperty(Cesium.Color.PURPLE)
            material: new Cesium.PolylineDashMaterialProperty({
                dashLength: 100,
                dashPattern: parseInt('11011', 2),
                color: Cesium.Color.CYAN,
            }),
        }
    });
}
// Primitive，通过appearance设置，从Material.fromType获取
{
    /**
     * PolylineColorAppearance/PerInstanceColorAppearance不能设置material
     */
    // const instance = new Cesium.GeometryInstance({
    //     geometry : new Cesium.EllipseGeometry({
    //         center : Cesium.Cartesian3.fromDegrees(-100.0, 20.0),
    //         semiMinorAxis : 500000.0,
    //         semiMajorAxis : 1000000.0,
    //         rotation : Cesium.Math.PI_OVER_FOUR,
    //         vertexFormat : Cesium.VertexFormat.POSITION_AND_ST
    //     }),
    //     id : 'object returned when this instance is picked and to get/set per-instance attributes'
    // });
    // viewer.scene.primitives.add(new Cesium.Primitive({
    //     geometryInstances : instance,
    //     appearance : new Cesium.EllipsoidSurfaceAppearance({
    //         // material : Cesium.Material.fromType('Checkerboard')
    //         material: Cesium.Material.fromType(Cesium.Material.CheckerboardType)
    //     })
    // }));
}

// Primitive，通过appearance设置，new一个Material对象，但type必须得是Material定义过的
{
    // Checkerboard，uniforms变量可以只写部分，内部会进行combine
    material = new Cesium.Material({
       fabric: {
            type: 'Checkerboard',
            uniforms: {
                lightColor: new Cesium.Color(1.0, 0.0, 0.0, 0.5)
            }
        }
    });
}

// Primitive，通过appearance设置，自定义Material，需要自定义shader
{
    material = new Cesium.Material({
        fabric: {
            type: "StandardMaterial",
            uniforms: {
                emission: new Cesium.Cartesian3(1.0, 0.5, 0.0),
            },
            source: `

            czm_material czm_getMaterial(czm_materialInput materialInput) {

            czm_material material = czm_getDefaultMaterial(materialInput);
                
                //material.diffuse = diffuse.rgb;
                material.emission = emission;

                return material;
            }`
        }
    });
}

if (material) {
    /**
     * PolylineColorAppearance/PerInstanceColorAppearance不能设置material
     */
    viewer.scene.primitives.add(
        new Cesium.Primitive({
            geometryInstances: [i1],
            appearance: new Cesium.MaterialAppearance({
                closed: true,
                material
            }),
            asynchronous: false,
        })
    );
}

