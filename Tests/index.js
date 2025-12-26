import * as Cesium from "../Build/CesiumUnminified/index.js"

Cesium.Ion.defaultAccessToken='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwYjZkZTViOC0xN2E5LTRlMDctOTcxOS04YjU1N2NjMjljOTkiLCJpZCI6MTM0NzcsInNjb3BlcyI6WyJhc3IiLCJnYyJdLCJpYXQiOjE1NjMzNTM5ODB9.RGY9YEPoZFxqKWq-mUb5Yu8QWnRBlnqsvpC-eEKxGDc';

let viewer;

async function getViewer() {
    if (viewer) { return viewer; }

    return createView();
}

async function createView() {
    viewer = new Cesium.Viewer('cesiumContainer', {
        atmosphere: false,
        // skyAtmosphere: false
        // terrainProviderViewModels: [
        //     {
        //     name: 'World Terrain',
        //     tooltip: 'Global terrain data',
        //         creationFunction: function() {
        //             return new Cesium.CesiumTerrainProvider({
        //                 url: 'https://assets.cesium.com/assets/terrain/world'
        //             });
        //         }
        //     }
        // ],
        // animation: false,
        // baseLayerPicker: false,
        // fullscreenButton: false,
        // geocoder: false,
        // homeButton: false,
        // scene3DOnly: true, // 默认为false，场景仅渲染 3D 模式，可提供渲染性能
        // sceneModePicker: true,
        // selectionIndicator: false,
        // timeline: false,
        // navigationHelpButton: false,
        // infoBox: false,
        // navigationInstructionsInitiallyVisible: false,
        // imageryProviderViewModels: [googleMap]
        //     terrain: Cesium.Terrain.fromWorldTerrain({
        // requestWaterMask: true,
        // requestVertexNormals: true
        // })
    });

    // viewer.scene.skyBox = new Cesium.SkyBox({
    //   sources : {
    //     positiveX : './skybox/px.jpg',
    //     negativeX : './skybox/nx.jpg',
    //     positiveY : './skybox/py.jpg',
    //     negativeY : './skybox/ny.jpg',
    //     positiveZ : './skybox/pz.jpg',
    //     negativeZ : './skybox/nz.jpg'
    //   }
    // });

    // viewer.scene.globe._surface.tileProvider._debug.wireframe = true;
    // viewer.scene.globe.fillHighlightColor = new Cesium.Color(1.0, 0.0, 0, 1);
    // viewer.camera.constrainedAxis = Cesium.Cartesian3.UNIT_Y;

    viewer.scene.screenSpaceCameraController.enableCollisionDetection = false;
    viewer.scene.globe.depthTestAgainstTerrain = false;

    viewer.terrainProvider = await Cesium.createWorldTerrainAsync();
        // viewer.scene.setTerrain(Cesium.Terrain.fromWorldTerrain({
        //     requestWaterMask: true,
        //     requestVertexNormals: true
        // }));

    // viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider()
    // viewer.imageryLayers.removeAll();
    // viewer.scene.camera.switchToOrthographicFrustum()
    // viewer.scene.fog.enabled = false;
    // viewer.imageryLayers.addImageryProvider(new Cesium.TileCoordinatesImageryProvider());

    // 添加mapbox自定义地图实例-
    // var layer=new Cesium.MapboxStyleImageryProvider({
    //     url:'https://api.mapbox.com/styles/v1',
    //     username:'nowsilence',
    //     styleId: 'cjyxrkx3g361d1cqozci0c6hy',
    //     accessToken: 'pk.eyJ1Ijoibm93c2lsZW5jZSIsImEiOiJjanh2ZXFkZ2YwNDc4M2NvYzNwdWc2cGRiIn0.VbsFYhiH15bbdI9IW1-VbQ',
    //     scaleFactor:true
    // });

    // viewer.imageryLayers.addImageryProvider(layer);

    return viewer;
}

export {
    Cesium,
    getViewer,
    createView
}