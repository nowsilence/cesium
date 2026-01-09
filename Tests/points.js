import { Cesium, getViewer } from "./index.js";

const viewer = await getViewer();
const type = 1;

// ## 不支持材质，不支持Appearance、不支持shader自定义

const positions = Cesium.Cartesian3.fromDegreesArray([-115.0, 37.0, -60.0, 10.0, -55.0, 60.0]);

if (type == 0) {
    var pointsCollection = new Cesium.PointPrimitiveCollection();
    positions.forEach(it => {
        pointsCollection.add({
            position: it,
            show : true,
            pixelSize : 20.0,
            color : Cesium.Color.WHITE,
            outlineColor : Cesium.Color.RED, //Cesium.Color.TRANSPARENT,
            outlineWidth : 1, //0.0,
            id : undefined,
            // disableDepthTestDistance: 1000, // 0.0
            // translucencyByDistance: new Cesium.NearFarScalar(0.1, 10, 10000, 0.2),
            // scaleByDistance: new Cesium.NearFarScalar(0.1, 10, 10000, 0.2),
            // distanceDisplayCondition: new Cesium.DistanceDisplayCondition(1, 10000000), //0.0
        });
    });

    viewer.scene.primitives.add(pointsCollection);
}


if (type == 1) 
{
    positions.forEach(it => {
        viewer.entities.add({
            position: it,
            point: {
                show : true,
                pixelSize : 20.0,
                color : Cesium.Color.WHITE,
                outlineColor : Cesium.Color.RED, //Cesium.Color.TRANSPARENT,
                outlineWidth : 1, //0.0,
                // disableDepthTestDistance: 1000, // 0.0
                // translucencyByDistance: new Cesium.NearFarScalar(0.1, 10, 10000, 0.2),
                // scaleByDistance: new Cesium.NearFarScalar(0.1, 10, 10000, 0.2),
                // distanceDisplayCondition: new Cesium.DistanceDisplayCondition(1, 10000000), //0.0
            }
        })
    })
}
