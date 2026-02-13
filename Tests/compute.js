import { Cesium, getViewer } from "./index.js";
const viewer = await getViewer();
let handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

handler.setInputAction(e => {
    
    const point = e.position;
    let position = viewer.scene.pickPosition(point);
    const lnglat = viewer.scene.globe.ellipsoid.cartesianToCartographic(position);
    console.log(lnglat)
}, Cesium.ScreenSpaceEventType.LEFT_CLICK);

const rectangle = Cesium.Rectangle.fromRadians(-2.0752100647518974, 0.6565051911508932, -2.073, 0.657);



const scratchCorners = [
  new Cesium.Cartographic(),
  new Cesium.Cartographic(),
  new Cesium.Cartographic(),
  new Cesium.Cartographic(),
];
const scratchCartesian2 = new Cesium.Cartesian2()

const retangleToTileXY = (rectangle, tilingScheme, level) => {
    // 右上角
    Cesium.Cartographic.fromRadians(
        rectangle.east,
        rectangle.north,
        0.0,
        scratchCorners[0],
    );
    // 左上角
    Cesium.Cartographic.fromRadians(
        rectangle.west,
        rectangle.north,
        0.0,
        scratchCorners[1],
    );
    // 右下角
    Cesium.Cartographic.fromRadians(
        rectangle.east,
        rectangle.south,
        0.0,
        scratchCorners[2],
    );
    // 左下角
    Cesium.Cartographic.fromRadians(
        rectangle.west,
        rectangle.south,
        0.0,
        scratchCorners[3],
    );

    const bbox = [Infinity, Infinity, -Infinity, -Infinity];
    for (let j = 0; j < 4; ++j) {
        const corner = scratchCorners[j];
        tilingScheme.positionToTileXY(corner, level, scratchCartesian2);
        bbox[0] = Math.min(scratchCartesian2.x, bbox[0]);
        bbox[1] = Math.min(scratchCartesian2.y, bbox[1]);
        bbox[2] = Math.min(scratchCartesian2.x, bbox[2]);
        bbox[3] = Math.min(scratchCartesian2.y, bbox[3]);
    }

    const tiles = [];
    for (let x = bbox[0]; x < bbox[2]; x++) {
        for (y = bbox[1]; y < bbox[3]; y++) {
            tiles.push(new Cartesian2(x, y));
        }
    }

    return tiles;
};

const computeVolum = (polygon, terrainProvider) => {
    const tilingScheme = terrainProvider.tilingScheme;
    const availability = terrainProvider.availability;
};

function getLowesetTiles(terrainProvider, rectangles) {
    const tilingScheme = tileAvailability._tilingScheme;
    const tileAvailability = terrainProvider.availability;
    const maxPossibleLevel = tileAvailability._maximumLevel;
    const levels = [];

    for (let i = 0; i < rectangles.length; i++) {
        
        const tileRange = getTileRangeForRectangle(tilingScheme, rect, 0);
        if (!tileRange) continue; // 无覆盖的瓦片，跳过

        for (let x = tileRange.startX; x <= tileRange.endX; x++) {
            for (let y = tileRange.startY; y <= tileRange.endY; y++) {
                const rect = tilingScheme.tileXYToRectangle(x, y, 0);
                if (Cesium.Rectangle.simpleIntersection(rectangles[0], rect)) {
                    levels[0] = { x, y, level: 0 };
                }
            }
        }
    }
}

function getHighestLevelTilesInRectangle1(terrainProvider, rectangle) {
    const tileAvailability = terrainProvider.availability;
    
    // 结果集合：存储最高级瓦片
    const highestLevelTiles = [];
    // 已覆盖的矩形：避免重复收集瓦片（可选优化）
    const coveredRectangles = [];

    // 步骤1：处理跨国际日期变更线（IDL）的矩形（拆分）
    const rectanglesToProcess = [];
    if (rectangle.east < rectangle.west) {
        // 拆分为两个不跨IDL的矩形
        rectanglesToProcess.push(
            Cesium.Rectangle.fromRadians(-Math.PI, rectangle.south, rectangle.east, rectangle.north),
            Cesium.Rectangle.fromRadians(rectangle.west, rectangle.south, Math.PI, rectangle.north)
        );
    } else {
        rectanglesToProcess.push(rectangle);
    }

    // 步骤2：获取遍历的最高级别上限（矩形内单点的最大可用级别）
    const tilingScheme = tileAvailability._tilingScheme;
    const maxPossibleLevel = tileAvailability._maximumLevel;

    // 步骤3：从最高级别往低遍历（保证先拿到最细粒度的瓦片）
    for (let level = 0; level <= maxPossibleLevel; level++) {
        // 遍历所有待处理的矩形（含拆分后的）
        for (const rect of rectanglesToProcess) {
            // 步骤4：计算当前级别下，覆盖该矩形的瓦片XY范围
            const tileRange = getTileRangeForRectangle(tilingScheme, rect, level);
            if (!tileRange) continue; // 无覆盖的瓦片，跳过

            // 步骤5：遍历该级别下的所有瓦片
            for (let x = tileRange.startX; x <= tileRange.endX; x++) {
                for (let y = tileRange.startY; y <= tileRange.endY; y++) {
                
                }
            }
        }
    }

  return highestLevelTiles;
}

/**
 * 计算指定矩形范围内所有的最高级瓦片（粒度最细的可用瓦片）
 * @param {Cesium.TileAvailability} tileAvailability 瓦片可用性实例
 * @param {Cesium.Rectangle} rectangle 目标地理矩形
 * @returns {Array<{level: number, x: number, y: number, extent: Cesium.Rectangle}>} 最高级瓦片数组
 */
function getHighestLevelTilesInRectangle(terrainProvider, rectangle) {
    const tileAvailability = terrainProvider.availability;
    
    
    // 结果集合：存储最高级瓦片
    const highestLevelTiles = [];
    // 已覆盖的矩形：避免重复收集瓦片（可选优化）
    const coveredRectangles = [];

    // 步骤1：处理跨国际日期变更线（IDL）的矩形（拆分）
    const rectanglesToProcess = [];
    if (rectangle.east < rectangle.west) {
        // 拆分为两个不跨IDL的矩形
        rectanglesToProcess.push(
        Cesium.Rectangle.fromRadians(-Math.PI, rectangle.south, rectangle.east, rectangle.north),
        Cesium.Rectangle.fromRadians(rectangle.west, rectangle.south, Math.PI, rectangle.north)
        );
    } else {
        rectanglesToProcess.push(rectangle);
    }

    // 步骤2：获取遍历的最高级别上限（矩形内单点的最大可用级别）
    const tilingScheme = tileAvailability._tilingScheme;
    const maxPossibleLevel = tileAvailability._maximumLevel;

    const resultLevels = {};

    const parent = tile => {
        const rect = tilingScheme.tileXYToRectangle(tile.x, tile.y, tile.level);
        const res = Cesium.Rectangle.center(rect);
        const xy = tilingScheme.positionToTileXY(res, tile.level - 1);
        return { x: xy.x, y: xy.y, level: tile.level - 1 };
    };

    // const getChildren = (x, y, level) => {
    //     const rect = tilingScheme.tileXYToRectangle(x, y, level);
    //     const res = getTileRangeForRectangle(tilingScheme, rect, level)
    // };

    // const areChidlrenAllHighestLevelTile = (x, y, level) => {
    //     const rect = tilingScheme.tileXYToRectangle(x, y, level);
    //     const tileRange = getTileRangeForRectangle(tilingScheme, rect, level - 1);

    //     let isAllInclude = true;
    //     const children = [];
    //     for (let tx = tileRange.startX; tx <= tileRange.endX; tx++) {
    //         for (let ty = tileRange.startY; ty <= tileRange.endY; ty++) {
    //             const key = tx + '-' + ty + '-' + (level - 1);

    //             if (resultLevels[key]) {
    //                 children.push(resultLevels[key]);
    //             } else {
    //                 isAllInclude = false;
    //             }
    //         }
    //     }

    //     return { children, isAllInclude };
    // }

    const cacheChildren = {

    };

   
    let bb = {};
    
    for (const rect of rectanglesToProcess) {
        // 步骤4：计算当前级别下，覆盖该矩形的瓦片XY范围
        const tiles = getTilesForRectangle(tilingScheme, rect, maxPossibleLevel);
        if (!tiles) {
            continue;
        }
        tiles.forEach(t => {
            const key = t.x + '-' + t.y + '-' + t.level;

            bb[key] = t;
        });
    }
    
    let i = 0;
    let keys = Object.keys(bb);
    while(keys.length > 0) {
        const ck = keys.pop();
        const tile = bb[ck];
        delete bb[ck];
        keys = Object.keys(bb);
        
        const p = parent(tile);
        
        const { x, y, level } = p;
        const key = x + '-' + y + '-' + level;

        if (resultLevels[key]) {
            continue;
        }

        const isHighestLevel = isHighestLevelTile(tileAvailability, level, x, y);
        
        if (isHighestLevel) {
            resultLevels[key] = [x, y, level];
            
        } else {
            bb[key] = { x, y, level };
        }

        if (i > 1000000) {
            i++;
            console.log(keys)
            console.log('dead loop');
            break;
        }
    }

  return resultLevels;
}

/**
 * 辅助函数：计算指定级别下覆盖矩形的瓦片XY范围
 * @param {Cesium.TilingScheme} tilingScheme 分块方案
 * @param {Cesium.Rectangle} rectangle 目标矩形
 * @param {number} level 瓦片级别
 * @returns {{startX: number, endX: number, startY: number, endY: number}|undefined} 瓦片XY范围
 */
function getTileRangeForRectangle(tilingScheme, rectangle, level) {
  // 取矩形四个角点，计算对应的瓦片XY，得到范围
  const sw = Cesium.Cartographic.fromRadians(rectangle.west, rectangle.south);
  const ne = Cesium.Cartographic.fromRadians(rectangle.east, rectangle.north);

  const swTile = tilingScheme.positionToTileXY(sw, level);
  const neTile = tilingScheme.positionToTileXY(ne, level);

  // 处理Y轴反转（不同分块方案的Y轴方向可能不同）
  const startX = Math.min(swTile.x, neTile.x);
  const endX = Math.max(swTile.x, neTile.x);
  const startY = Math.min(swTile.y, neTile.y);
  const endY = Math.max(swTile.y, neTile.y);

  // 校验瓦片XY是否有效
  if (startX > endX || startY > endY) {
    return undefined;
  }

  return { startX, endX, startY, endY };
}

function getTilesForRectangle(tilingScheme, rectangle, level) {
    const tileRange = getTileRangeForRectangle(tilingScheme, rectangle, level);

    if (!tileRange) {
        return undefined;
    }

    const ret = [];

    for (let x = tileRange.startX; x <= tileRange.endX; x++) {
        for (let y = tileRange.startY; y <= tileRange.endY; y++) {
            ret.push({ x, y, level});
        }
    }

  return ret;
}

/**
 * 辅助函数：判断瓦片是否是最高级瓦片
 * @param {TileAvailability} tileAvailability 瓦片可用性实例
 * @param {number} level 瓦片级别
 * @param {number} x 瓦片X坐标
 * @param {number} y 瓦片Y坐标
 * @returns {boolean} 是否是最高级瓦片
 */
function isHighestLevelTile(tileAvailability, level, x, y) {
  // 1. 先判断当前瓦片是否可用
  if (!tileAvailability.isTileAvailable(level, x, y)) {
    return false;
  }

  // 2. 若已是最大级别，直接返回true（无更高级别）
  if (level >= tileAvailability._maximumLevel) {
    return true;
  }

  // 3. 检查子瓦片掩码：掩码为0 → 无子瓦片可用 → 当前是最高级
  const childMask = tileAvailability.computeChildMaskForTile(level, x, y);
  return childMask === 0;
}

/**
 * 辅助函数：判断矩形是否已被覆盖（优化用，避免重复收集瓦片）
 * @param {Rectangle} rectangle 待判断矩形
 * @param {Array<Rectangle>} coveredRectangles 已覆盖的矩形集合
 * @returns {boolean} 是否完全覆盖
 */
function isRectangleFullyCovered(rectangle, coveredRectangles) {
  let coveredArea = 0;
  const totalArea = Cesium.Rectangle.computeArea(rectangle);

  for (const coveredRect of coveredRectangles) {
    const intersection = Cesium.Rectangle.intersection(rectangle, coveredRect);
    if (defined(intersection)) {
      coveredArea += Cesium.Rectangle.computeArea(intersection);
    }
  }

  // 误差容忍：覆盖面积≥99.9%即认为完全覆盖
  return coveredArea / totalArea >= 0.999;
}

setTimeout(() => {
    const terrainProvider = viewer.terrainProvider;

   const res = getHighestLevelTilesInRectangle(terrainProvider, rectangle);
    console.log(res); 
}, 10000);


// 导出函数供外部使用
export default getHighestLevelTilesInRectangle;