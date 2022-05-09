import m from 'mithril';
import { PluginType } from 'mithril-ui-form-plugin';
import { MaplibreMap } from './component';
import { FeatureCollection } from 'geojson';
import { IMapLibreSource } from './component-utils';

export const maplibrePlugin: PluginType = () => {
  return {
    view: ({ attrs: { iv, props, field } }) => {
      const id = props.id || '';
      const className = field.className || 'col s12';
      const sources: IMapLibreSource = iv.sources || {};
      const polygons: FeatureCollection = iv.polygons || {};
      const drawnPolygonLimit = field.drawnPolygonLimit || 1;

      return m(MaplibreMap, {
        id,
        className,
        sources,
        polygons,
        drawnPolygonLimit,
      });
    },
  };
};
