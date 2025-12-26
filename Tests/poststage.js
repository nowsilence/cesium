import { Cesium, getViewer } from "./index.js";


const viewer = await getViewer();
//entities
const box = viewer.entities.add({
   position: Cesium.Cartesian3.fromDegrees(106.647382019240, 26.620452464821, 50),
   box: {
       dimensions: new Cesium.Cartesian3(100, 100, 100),
       material: Cesium.Color.RED
  }
})
viewer.entities.add({
   position: Cesium.Cartesian3.fromDegrees(106.647482019240, 26.621452464821, 50),
   ellipsoid: {
       radii: new Cesium.Cartesian3(50, 50, 50),
       material: Cesium.Color.GREY
  }
})

let ferrari = viewer.entities.add({
   position: Cesium.Cartesian3.fromDegrees(106.647382019240, 26.624152464821, 0),
   model: {
       uri: '../Apps/SampleData/models/GroundVehicle/GroundVehicle.glb',
       scale: 50,
       runAnimations: true
  }
})
viewer.flyTo(box)


let yellowEdge = Cesium.PostProcessStageLibrary.createEdgeDetectionStage();
yellowEdge.uniforms.color = Cesium.Color.YELLOW;

// yellowEdge.selected = [feature0]; // 如果不设置selected则对整个纹理进行边缘检测

const greenEdge = Cesium.PostProcessStageLibrary.createEdgeDetectionStage();
greenEdge.uniforms.color = Cesium.Color.LIME;
greenEdge.enabled = false;
// greenEdge.selected = [feature1];

{   // 参考[https://zhuanlan.zhihu.com/p/407871786]
    // createSilhouetteStage函数内部会自动创建createEdgeDetectionStage
    yellowEdge = Cesium.PostProcessStageLibrary.createSilhouetteStage();
    yellowEdge.uniforms.color = Cesium.Color.YELLOW;
    yellowEdge.enabled = false;
    viewer.scene.postProcessStages.add(yellowEdge);
}

{
    // 让场景中焦点平面的物体清晰，而焦点前后的区域呈现自然的模糊效果，大幅提升 3D 场景的真实感和沉浸感
    // depth of field 景深 可以理解为背景模糊
    // const poststage = Cesium.PostProcessStageLibrary.createDepthOfFieldStage();
    // viewer.scene.postProcessStages.add(poststage);
}

{
    // 高斯模糊，实现景深、bloom的基础组件
    // const poststage = Cesium.PostProcessStageLibrary.createBlurStage();
    // poststage.uniforms.delta = 1;
    // poststage.uniforms.sigma = 2,
    // poststage.uniforms.stepSize = 1;
    // viewer.scene.postProcessStages.add(poststage);
}

{
    // const bloom = viewer.scene.postProcessStages.bloom;
    // const bloom = Cesium.PostProcessStageLibrary.createBloomStage();
    // bloom.uniforms.contrast = 128;
    // bloom.uniforms.brightness = 1;//-0.3,
    // bloom.uniforms.glowOnly = true;
    // 
    // bloom.enabled = true;
    // bloom.uniforms.brightness = 0;//-0.5;
    // bloom.uniforms.stepSize = 1.0;
    // bloom.uniforms.sigma = 3.0;
    // bloom.uniforms.delta = 1.5;
    // scene.highDynamicRange = true;
    // viewer.scene.postProcessStages.exposure = 1.5;

    // viewer.scene.postProcessStages.add(poststage);

    // yellowEdge = bloom;
}

// viewer.scene.postProcessStages.add(Cesium.PostProcessStageLibrary.createSilhouetteStage([yellowEdge]));//, greenEdge]));

viewer.homeButton.viewModel.command.beforeExecute.addEventListener(e => {
   viewer.flyTo(box)
   e.cancel = true
})

//鼠标点击，拾取对象并高亮显示
viewer.screenSpaceEventHandler.setInputAction((e) => {
   var mousePosition = e.position;
   // 返回的是context.createPickId(object)传进去的参数
   var picked = viewer.scene.pick(mousePosition)

   yellowEdge.selected = [];
//    edgeStage.selected = []
   yellowEdge.enabled = false

   if (picked && picked.primitive) {
        let primitive = picked.primitive
        // 基类Primitive为pickIds，Billboard/PointPrimitive/Polyline/VexelPrimitive为pickId，
        // 一般是 { id, primitive }
        let pickIds = primitive._pickIds;
        //已经单体化的3D Tiles或者其他pickObject本身带有pickId属性的情况
        let pickId = picked.pickId;
        //未单体化的3D Tiles
        if (!pickId && !pickIds && picked.content) {
           pickIds = picked.content._model._pickIds;
        }
       
        if (!pickId) {
           if (picked.id) {
               //picked返回的是Primitive._pickIds.[object]
               pickId = pickIds.find(pickId => {
                   return pickId.object == picked;
              })
          } else if (pickIds) {
               pickId = pickIds[0]
          }
        }

       if (pickId) {
           let pickObject = {
               pickId: pickId
          }
           yellowEdge.selected = [pickObject]
           yellowEdge.enabled = true;
        //    cesiumStage.selected = [pickObject]
        //    edgeStage.enabled = !cesiumStage.enabled
      }
    }

}, Cesium.ScreenSpaceEventType.LEFT_CLICK)