import { TileLayer } from 'leaflet';

class TransofrmLayer extends TileLayer {

    _setZoomTransform(level, center, zoom) {
        // 坐标转换，84转02或者02转84
        const transformed = this.transformCoord(center);

        super._setZoomTransform(level, transformed, zoom);
    }

    _getTiledPixelBounds(center) {
        const transformed = this.transformCoord(center);
        super._getTiledPixelBounds(transformed);
    }

    _onMoveEnd() {
        const zoom = this._clampZoom(this._map.getZoom())
        this._setZoomTransform(this._level, this._map.getCenter(), zoom);
        super._onMoveEnd();
    }

    /**
     * 
     * @param {object} point 
     * @param {number} point.lng 
     * @param {number} point.lat
     * @returns 
     */
    transformCoord(point) {
        if (!point) return;

        //** */
    }
}
