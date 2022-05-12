import m from 'mithril';
import { PluginType } from 'mithril-ui-form-plugin';
import { MaplibreMap } from './component';
import { FeatureCollection } from 'geojson';
import { IMapLibreSource } from './component-utils';

let maplibregl: any;
let mapboxdraw: any;
let appIcons: Array<[img: any, name: string]>;

export const configureMaplibrePlugin = (
  dependencies: { maplibregl: any; mapboxdraw: any },
  icons?: Array<[img: any, name: string]>
) => {
  maplibregl = dependencies.maplibregl;
  mapboxdraw = dependencies.mapboxdraw;
  if (icons) appIcons = icons;
};

export const maplibrePlugin: PluginType = () => {
  return {
    view: ({ attrs: { iv, props, field } }) => {
      const id = props.id || '';
      const className = field.className || 'col s12';
      const sources: IMapLibreSource = iv.sources || {};
      const polygons: FeatureCollection = iv.polygons || {};
      const drawnPolygonLimit: number = field.drawnPolygonLimit || 1;

      return m(MaplibreMap, {
        maplibregl,
        mapboxdraw,
        id,
        className,
        sources,
        polygons,
        drawnPolygonLimit,
        appIcons,
      });
    },
  };
};
