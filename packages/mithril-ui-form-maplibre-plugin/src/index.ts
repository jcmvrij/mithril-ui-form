import m from 'mithril';
import { PluginType } from 'mithril-ui-form-plugin';
import { MaplibreMap, MapLibreSource } from './component';
import { FeatureCollection } from 'geojson';

export const maplibrePlugin: PluginType = () => {
  return {
    view: ({ attrs: { iv, props, field, onchange } }) => {
      const id = props.id || '';
      console.log('test = ');
      console.log(iv);
      console.log(props);
      console.log(field);

      const initialSource: MapLibreSource = iv.sources;
      const initialPolygons: FeatureCollection = iv.polygons;

      const polygons = {} as Record<string, any>;
      polygons[id] = initialPolygons;

      return m(MaplibreMap, {
        id: id,
        className: 'col s12',
        sources: initialSource,
        polygons,
        mapOptions: {},
        drawnPolygonLimit: field.settings.drawnPolygonLimit,
        onPolygonEdit: (f: FeatureCollection) => {
          console.log('t');
          console.log(f);
          onchange && onchange(f as any);
          m.redraw();
        },
      });
    },
  };
};
