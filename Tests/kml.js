/**
 * KML（Keyhole Markup Language）是一种基于 XML 的地理空间数据标记语言，
 * 专门用于描述和传输地理要素（如点、线、面、地标、模型等）及其样式信息，
 * 广泛应用于 GIS（地理信息系统）和虚拟地球类应用中
 * 
 * gx命名空间: Google对标准KML的扩展
 * 
 * 标准 KML 2.2 标签：所有 GIS 工具均支持（Cesium、QGIS、ArcGIS、Google Earth）。
 * gx 扩展标签：仅 Google Earth 完全支持，Cesium 支持轨迹相关标签（<gx:Track>/<gx:MultiTrack>），其他工具可能不识别。
 * 坐标格式区别
 *    标准几何标签：<coordinates> 用 逗号分隔（lon,lat,alt）。
 *    gx轨迹标签：<gx:coord> 用 空格分隔（lon lat alt）。
 * 性能建议
 * 单KML文件避免超过 10 万条要素，否则加载卡顿；大数据量建议用 NetworkLink 分块加载。
 * gx轨迹建议控制点数，过多会导致动画播放不流畅
 */

/**
<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2" <!-- 必须包含 OGC 命名空间 -->
    xmlns:gx="http://www.google.com/kml/ext/2.2" <!-- 必须声明gx命名空间，否则无效 -->
>
  <!-- 唯一的根Document -->
  <Document>
    <name>多段GPS轨迹示例</name>
    <!-- 第一组：城市地标 -->
    <Folder>
      <name>城市地标</name>
      <!-- 地理要素容器，是 KML 的核心，可包含点、线、面等几何形状 -->
      <Placemark>
        <name>天安门</name>
        <Point><coordinates>116.4038,39.9151,0</coordinates></Point>
      </Placemark>
    </Folder>

    <!-- 第二组：骑行轨迹 -->
    <Folder>
      <name>骑行轨迹</name>
      <Placemark>
        <gx:MultiTrack>
          <gx:Track>
            <when>2026-01-23T08:00:00Z</when>
            <gx:coord>116.4038 39.9151 0</gx:coord>
          </gx:Track>
        </gx:MultiTrack>
      </Placemark>
    </Folder>

    <!-- 第三组：共享样式 -->
    <Folder>
      <name>共享样式库</name>
      <Style id="redLine">
        <LineStyle><color>ff0000ff</color><width>3</width></LineStyle>
      </Style>
    </Folder>

    <!-- 加载子文件1：地标数据 -->
    <NetworkLink>
      <name>地标数据</name>
      <Link><href>landmarks.kml</href></Link>
    </NetworkLink>
    <!-- 加载子文件2：轨迹数据 -->
    <NetworkLink>
      <name>轨迹数据</name>
      <Link><href>tracks.kml</href></Link>
    </NetworkLink>
  </Document>
</kml>
 */