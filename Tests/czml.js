
import { Cesium, getViewer } from "./index.js";
const viewer = await getViewer();
let type = 1;
const czmlPath = "./Apps/SampleData/";

// 动画的关键
viewer.clock.shouldAnimate = true;

if (type == 0) {
    // tracking simple Vehicle
    viewer.dataSources.add(Cesium.CzmlDataSource.load(czmlPath + 'simple.czml'))
}

if (type == 1) {
    const startTime = Cesium.JulianDate.fromIso8601("2012-03-15T10:00:00Z");

    const satelliteStopTime = Cesium.JulianDate.fromIso8601("2012-03-16T10:00:00Z");

    const droneStopTime = Cesium.JulianDate.fromIso8601("2012-03-15T10:00:30Z");

    const dataSource = await viewer.dataSources.add(
        Cesium.CzmlDataSource.load(czmlPath + "tracking.czml"),
    );

    const satellite = dataSource.entities.getById("Satellite/ISS");
    const drone = dataSource.entities.getById("CesiumDrone");

    satellite.viewFrom = new Cesium.Cartesian3(-300, 20, 100);
    drone.viewFrom = new Cesium.Cartesian3(-50, 0, 5);

    viewer.clock.stopTime = droneStopTime;
    viewer.clock.currentTime = startTime;
    viewer.clock.multiplier = 1;
    // 仅调整Timeline控件的可视显示范围——只是让时间轴 “聚焦” 到某段时间
    // viewer.timeline.zoomTo(startTime, droneStopTime);
    viewer.trackedEntity = drone;

    // viewer.clock.stopTime = satelliteStopTime;
    // viewer.clock.currentTime = startTime;
    // viewer.clock.multiplier = 130;
    // viewer.timeline.zoomTo(startTime, satelliteStopTime);
    // viewer.trackedEntity = satellite;

    // INERTIAL VELOCITY AUTODETECT ENU
    satellite.trackingReferenceFrame = Cesium.TrackingReferenceFrame.INERTIAL;
    drone.trackingReferenceFrame = Cesium.TrackingReferenceFrame.INERTIAL;
}

if (type == 2) {
    // const czmlPath = './Tests/'
    let vehicleEntity;

    

    const dataSource = new Cesium.CzmlDataSource();
    viewer.dataSources.add(dataSource);

    const partsToLoad = [
        {
            url: "MultipartVehicle_part1.czml",
            range: [0, 1500],
            requested: false,
            loaded: false,
        },
        {
            url: "MultipartVehicle_part2.czml",
            range: [1500, 3000],
            requested: false,
            loaded: false,
        },
        {
            url: "MultipartVehicle_part3.czml",
            range: [3000, 4500],
            requested: false,
            loaded: false,
        },
    ];

    function processPart(part) {
        part.requested = true;
        // updateStatusDisplay();
        dataSource.process(czmlPath + part.url).then(function () {
            part.loaded = true;
            // updateStatusDisplay();

            // Follow the vehicle with the camera.
            if (!viewer.trackedEntity) {
                viewer.trackedEntity = vehicleEntity =
                    dataSource.entities.getById("Vehicle");
                }
        });
    }

    // Load the first part up front.
    processPart(partsToLoad[0]);

    const preloadTimeInSeconds = 100;

    viewer.clock.onTick.addEventListener(function (clock) {
        // This example uses time offsets from the start to identify which parts need loading.
        const timeOffset = Cesium.JulianDate.secondsDifference(
            clock.currentTime,
            clock.startTime,
        );

        // Filter the list of parts to just the ones that need loading right now.
        // Then, process each part that needs loading.
        partsToLoad
            .filter(function (part) {
                return (
                    !part.requested &&
                    timeOffset >= part.range[0] - preloadTimeInSeconds &&
                    timeOffset <= part.range[1]
                );
            })
            .forEach(function (part) {
                processPart(part);
            });

        if (vehicleEntity) {
            // const fuel = vehicleEntity.properties.fuel_remaining.getValue(
            //     clock.currentTime,
            // );
            // if (Cesium.defined(fuel)) {
            //     fuelDisplay.textContent = `Fuel: ${fuel.toFixed(2)} gal`;
            // }
        }
    });
}