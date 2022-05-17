import m from 'mithril';
import { PluginType } from 'mithril-ui-form-plugin';
import { MaplibreMap } from './component';
import { FeatureCollection } from 'geojson';
import { DrawableMap, IMapLibreSource } from './component-utils';

let mapId: string;
let map: DrawableMap;
let draw: MapboxDraw;

export const configureMaplibrePlugin = (
  id: string,
  maplibreMap: DrawableMap,
  mapboxdraw: MapboxDraw,
  icons?: Array<[img: any, name: string]>
) => {
  mapId = id;
  map = maplibreMap;
  draw = mapboxdraw;
  if (icons) {
    icons.forEach(([image, name]) => {
      map.loadImage(image, (error, img) => {
        if (error) throw error;
        if (!map.hasImage(name)) map.addImage(name, img as ImageBitmap);
      });
    });
  }
};

export const maplibrePlugin: PluginType = () => {
  return {
    view: ({ attrs: { iv, props, field } }) => {
      const id = mapId || props.id || '';
      const className = field.className || 'col s12';
      const sources: IMapLibreSource[] = iv.sources || {};
      const polygons: FeatureCollection = iv.polygons || {};
      const drawnPolygonLimit: number = field.drawnPolygonLimit || 1;

      return m(MaplibreMap, {
        map,
        draw,
        id,
        className,
        sources,
        polygons,
        drawnPolygonLimit,
      });
    },
  };
};
