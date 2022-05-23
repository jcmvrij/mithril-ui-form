import m from 'mithril';
import { PluginType } from 'mithril-ui-form-plugin';
import { MaplibreMap } from './component';
import { IMapLibreSource } from './component-utils';

let appIcons: Array<[img: any, name: string]>;

export const maplibrePlugin = (icons?: Array<[img: any, name: string]>) => {
  if (icons) appIcons = icons;
  return maplibrePluginFactory;
};

const maplibrePluginFactory: PluginType = () => {
  return {
    view: ({ attrs: { iv, props, field } }) => {
      const id = props.id || '';
      const className = field.className || 'col s12';
      const style = field.style || 'height: 400px';
      const sources: IMapLibreSource[] = iv.sources;
      const drawingPolygons: boolean = field.drawingPolygons;
      const drawnPolygonLimit: number = field.drawnPolygonLimit || 0;
      const polygons = iv.polygons;

      if (drawingPolygons && !polygons) {
        iv.polygons = {
          type: 'FeatureCollection',
          features: [],
        };
      }

      if (!sources) {
        iv.sources = [];
      }

      return m(MaplibreMap, {
        id,
        className,
        style,
        sources,
        drawingPolygons,
        drawnPolygonLimit,
        polygons,
        appIcons,
      });
    },
  };
};
