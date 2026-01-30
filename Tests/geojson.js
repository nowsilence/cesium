import { Cesium, getViewer } from "./index.js";
const viewer = await getViewer();

/**
 * 分为两种：
 * 一种是标准的geojson, 如simplestyles.geojson 解析入口函数为processFeatureCollection
 * 一种是topojson, 如ne_10m_us_states.topojson，解析入口函数为processTopology
 * topojson的arc索引可能为负数，原始索引 = |负数索引| - 1，负数需要反向使用对应弧，指点顺序翻转
 * toojson对于边界如省界、国界，共享边的时候减少点的存储。为什么要使用负索引，一般的边界点需要按照顺序存储。
 */
const json = 'simplestyles.geojson'; // ne_10m_us_states.topojson
viewer.dataSources.add(Cesium.GeoJsonDataSource.load('./Tests/data/'+json, {
    stroke: Cesium.Color.HOTPINK,
    fill: Cesium.Color.PINK,
    strokeWidth: 3,
    markerSymbol: '?'
}));