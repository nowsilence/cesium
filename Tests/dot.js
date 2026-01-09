import { Cesium, getViewer } from "./index.js";

const viewer = await getViewer();

class DotMaterialProperty {

    constructor(options) {
        options = Cesium.defaultValue(options, Cesium.defaultValue.EMPTY_OBJECT)

        this._definitionChanged = new Cesium.Event()
        this._lightColor = undefined
        this._darkColor = undefined
        this._repeat = undefined;

        Object.defineProperties(this, {
            lightColor: Cesium.createPropertyDescriptor('lightColor'),
            darkColor: Cesium.createPropertyDescriptor('darkColor'),
            repeat: Cesium.createPropertyDescriptor('repeat'),
        });

        this.lightColor = options.lightColor
        this.darkColor = options.darkColor
        this.repeat = options.repeat
    }

    get isConstant() {
        return true;
    }

    get definitionChanged() {
        return this._definitionChanged;
    }

    getType() {
        return 'Dot'
    }

    getValue(time, result) {
        if (!Cesium.defined(result)) {
            result = {}
        }

        result.lightColor = Cesium.Property.getValueOrClonedDefault(
            this._lightColor,
            time,
            Cesium.Color.RED,
            result.lightColor
        )

        result.darkColor = Cesium.Property.getValueOrClonedDefault(
            this._darkColor,
            time,
            Cesium.Color.WHITE,
            result.darkColor
        )

        result.repeat = Cesium.Property.getValueOrClonedDefault(
            this._repeat,
            time,
            new Cesium.Cartesian2(5, 5),
            result.repeat
        )

        return result
    }
}

const positions = Cesium.Cartesian3.fromDegreesArray([-115.0, 37.0, -60.0, 10.0, -55.0, 60.0]);
const rectangle = Cesium.Rectangle.fromDegrees(-120.0, 20.0, -60.0, 40.0)

viewer.entities.add({
    name: '基础点状折线',
    // rectangle: {
    //     coordinates: rectangle,
    //     material: new DotMaterialProperty({
    //         lightColor: new Cesium.Color(1.0, 1.0, 0.0, 0.75),
    //         darkColor: new Cesium.Color(0.0, 1.0, 1.0, 0.75),
    //         repeat: new Cesium.Cartesian2(5.0, 5.0),
    //     })
    // },
    polyline: {
        positions: positions,
        width: 20, // 线宽（决定点的显示尺寸上限）
        // material: new Cesium.PolylineDashMaterialProperty({
        //     color: Cesium.Color.RED, // 默认白色
        //         gapColor: Cesium.Color.GREEN, // 默认tranparent
        //         dashPattern: 255, //: 1, // 模式，16位 0表示gap部分 1 表示color部分
        //         dashLength: 16,//: 100, // 表示一个虚线循环的长度
        // })
        material: new DotMaterialProperty({
            lightColor: new Cesium.Color(1.0, 1.0, 0.0, 0.75),
            darkColor: new Cesium.Color(0.0, 1.0, 1.0, 0.75),
            repeat: new Cesium.Cartesian2(25.0, 1.0),
        }),
    }
});
