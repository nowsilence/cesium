import { Cesium, getViewer } from "./index.js";

const viewer = await getViewer();

const geometry = new Cesium.SimplePolylineGeometry({
    // RHUMB不支持，估计是cesium的bug
    arcType: Cesium.ArcType.GEODESIC, // 线段是测地线（GEODESIC，最短路径）还是恒向线（RHUMB,恒定方位角），或者是NONE（空间直线）
    positions: Cesium.Cartesian3.fromDegreesArray([-115.0, 37.0, -60.0, 10.0]),
});

const geometryInstance = new Cesium.GeometryInstance({
    geometry: geometry,
    id: 'sid',
    attributes: {
        // 对应shader里的 in vec4 color;
        color : Cesium.ColorGeometryInstanceAttribute.fromColor(new Cesium.Color(1.0, 0.0, 0.0, 1.0))
    }
});

//## 只能使用PerInstanceColorAppearance

let appearance;
{
    /**
     * 顶点数据只有color和position, 因为没有法线，不能进行光照，所以flat只能设置为true, 默认为false
     */
    // appearance = new Cesium.PerInstanceColorAppearance({
    //     flat: true, // 对于SimplePolyline只能设置为true
    //     translucent: false,
    //     // mateiral: mateiral PerInstanceColorAppearance不支持设置material
    // })
}

//## 自定义MaterialAppearance
{
    // const material = new Cesium.Material({
    //     fabric: {
    //         type: Material.ColorType,
    //         uniforms: {
    //             color: new Color(1.0, 0.0, 0.0, 0.5),
    //         },
    //         components: {
    //         diffuse: "color.rgb",
    //         alpha: "color.a",
    //         },
    //     },
    //     translucent: false
    // });

    appearance = new Cesium.MaterialAppearance({
        // material: customMaterial, // 如果不设置material，则默认使用Material.Color
        flat: false,
        faceForward: true,
        translucent: true,
        closed: true,
        vertexShaderSource: `
            in vec3 position3DHigh;
            in vec3 position3DLow;
            in vec4 color;
            in float batchId;

            out vec4 v_color;
            out float v_testFloat;

            void main()
            {
                vec4 p = czm_computePosition();

                v_color = color;

                gl_Position = czm_modelViewProjectionRelativeToEye * p;
            }`,
        fragmentShaderSource: `
            in vec4 v_color;

            void main()
            {   
            //     czm_materialInput materialInput;
            //     materialInput.normalEC = normalEC;
            //     materialInput.positionToEyeEC = positionToEyeEC;
            //     czm_material material = czm_getMaterial(materialInput);

                out_FragColor = v_color;
            }
            `,
        materialCacheKey: "my-box-material-appearance",
    });

    appearance.uniforms = {
        tcolor: new Cesium.Color(1.0, 1.0, 0.0, 0.9),
    };
}

viewer.scene.primitives.add(new Cesium.Primitive({
    geometryInstances: [geometryInstance],
    appearance
}));
