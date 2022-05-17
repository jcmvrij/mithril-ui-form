import m from 'mithril';
import { PluginType } from 'mithril-ui-form-plugin';
import { MaplibreMap } from './component';
import { FeatureCollection } from 'geojson';
import { IMapLibreSource } from './component-utils';

let appIcons: Array<[img: any, name: string]>;

export const loadIcons = (icons: Array<[img: any, name: string]>) => {
  appIcons = icons;
};

export const maplibrePlugin: PluginType = () => {
  return {
    view: ({ attrs: { iv, props, field } }) => {
      const id = props.id || '';
      const className = field.className || 'col s12';
      const sources: IMapLibreSource[] = iv.sources || {};
      const polygons: FeatureCollection = iv.polygons || {};
      const drawnPolygonLimit: number = field.drawnPolygonLimit || 1;

      return m(MaplibreMap, {
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
