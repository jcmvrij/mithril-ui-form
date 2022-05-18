import m from 'mithril';
import { PluginType } from 'mithril-ui-form-plugin';
import { MaplibreMap } from './component';
import { IMapLibreSource } from './component-utils';

let appIcons: Array<[img: any, name: string]>;

export const maplibrePluginWithIcons = (icons?: Array<[img: any, name: string]>) => {
  if (icons) appIcons = icons;
  return maplibrePlugin;
};

export const maplibrePlugin: PluginType = () => {
  return {
    view: ({ attrs: { iv, props, field } }) => {
      const id = props.id || '';
      const className = field.className || 'col s12';
      const sources: IMapLibreSource[] = iv.sources;
      const drawingPolygons: boolean = field.drawingPolygons;
      const drawnPolygonLimit: number = field.drawnPolygonLimit || 0;

      if (drawingPolygons && !iv.polygons) {
        iv.polygons = {
          type: 'FeatureCollection',
          features: [],
        };
      }

      return m(MaplibreMap, {
        id,
        className,
        sources,
        drawingPolygons,
        polygons: iv.polygons,
        drawnPolygonLimit,
        appIcons,
      });
    },
  };
};
