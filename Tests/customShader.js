import { Cesium, getViewer } from "./index.js";

const viewer = await getViewer();

const geometry = new Cesium.SimplePolylineGeometry({
    positions: Cesium.Cartesian3.fromDegreesArray([-115.0, 37.0, -60.0, 10.0]),
});

const geometryInstance = new Cesium.GeometryInstance({
    geometry: geometry,
    attributes: {
        // 自定义实例属性，需要在shader使用czm_batchTable_**函数读取（czm_batchTable_testFloat）
        testFloat: new Cesium.GeometryInstanceAttribute({
          componentDatatype: Cesium.ComponentDatatype.FLOAT,
          componentsPerAttribute: 1.0,
          value: [0.1], // 必须为一个数组
          normalize: true
        }),
        // 对应shader里的 in vec4 color; cesium自有的属性
        color : Cesium.ColorGeometryInstanceAttribute.fromColor(new Cesium.Color(1.0, 0.0, 0.0, 1.0))
    }
});


/**
 * source和components不能同时设置，否则报错
 * 若没有设置source，内部会生成czm_getMaterial，对components进行赋值
 * 若设置了source，可以读取uniform变量
 * 
 * uniform变量只能material内部shader（内部生成或者外部创建）读取，内部会对变量名进行替换，真正写入shader的变量名会有变化
 * 外部要使用，可以读取材质的值，包含：
 * struct czm_material
 * {
 *     vec3 diffuse;
 *     float specular;
 *     float shininess;
 *     vec3 normal;
 *     vec3 emission;
 *     float alpha;
 * };
 */
const material = new Cesium.Material({
    fabric: {
        type: 'Test_Custom_Material',
        uniforms: {
            mcolor: new Cesium.Color(1.0, 0.0, 0.0, 0.5),
        },
        // components: {
        //     diffuse: "mcolor.rgb",
        //     alpha: "mcolor.a",
        // },
        source: `
        uniform vec4 mcolor;

        czm_material czm_getMaterial(czm_materialInput materialInput)
        {
            czm_material material = czm_getDefaultMaterial(materialInput);

            vec4 color = czm_gammaCorrect(mcolor);
            material.diffuse = color.rgb;
            material.alpha = color.a;

            return material;
        }
        `
    },
    translucent: false
});

/**
 * 若没有设置，vertexShaderSource/fragmentShaderSource则使用设置的materialSupport
 * materialSupport有三种类型:
 * BASIC: position/normal
 * TEXTURED: position/normal/st
 * ALL: position/normal/st/tangent/bitangent
 * 若没有设置materialSupport，默认使用TEXTURED
 * 
 * material若没有设置则默认使用Material.Color
 * 
 * uniforms两种设置方式：
 * 1）appearance对象上可以设置uniforms，但不能通过构造函数传入，使用的话必须在shader里声明
 * 2）material设置uniforms，如果是自定义的，需要通过components赋值，或者自定义material的shader，
 *    重写czm_getMaterial方法，进行赋值
 * 
 * 
 */
const appearance = new Cesium.MaterialAppearance({
    material,
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
            // 自定义属性
            v_testFloat = czm_batchTable_testFloat(batchId);

            gl_Position = czm_modelViewProjectionRelativeToEye * p;
        }`,
    fragmentShaderSource: `
        in vec4 v_color;
        in float v_testFloat;
        uniform vec4 tcolor;

        void main()
        {   
            czm_materialInput materialInput;
        //     materialInput.normalEC = normalEC;
        //     materialInput.positionToEyeEC = positionToEyeEC;
            czm_material material = czm_getMaterial(materialInput);

        // #ifdef FLAT
        //     out_FragColor = vec4(material.diffuse + material.emission, material.alpha);
        // #else
        //     out_FragColor = czm_phong(normalize(positionToEyeEC), material, czm_lightDirectionEC);
        // #endif
            
            // 通过appearance.uniforms设置
            //out_FragColor = czm_gammaCorrect(tcolor);
            
            // 通过appearance.material设置颜色
            out_FragColor = vec4(material.diffuse, material.alpha);//vec4(1.0, 0.0, 0.0, v_testFloat);
        }
        `,
    materialCacheKey: "my-box-material-appearance",
});

// 不能通过构造函数传入
appearance.uniforms = {
    tcolor: new Cesium.Color(1.0, 1.0, 0.0, 0.9),
};


viewer.scene.primitives.add(new Cesium.Primitive({
    geometryInstances: [geometryInstance],
    appearance
}));
