import m from 'mithril';
import { FeatureCollection } from 'geojson';
import { PluginType } from 'mithril-ui-form-plugin';
import { mapLibreMap, pluginState } from './component';
import { IMapLibreSource } from './component-utils';

export interface MapLibrePluginOptions {
  icons?: Array<[img: string, name: string]>;
  fallbackIcon?: string;
  mapStyle?: string;
}

// type MapLibrePluginType = PluginType & {
//   drawingPolygons: boolean;
//   drawnPolygonLimit: number;
// };

let options: MapLibrePluginOptions;

export const mapLibrePlugin = (mapLibrePluginOptions?: MapLibrePluginOptions) => {
  if (mapLibrePluginOptions) options = mapLibrePluginOptions;
  return mapLibrePluginFactory;
};

const mapLibrePluginFactory: PluginType = () => {
  return {
    oninit: () => {
      // type checks
      // hier iconen toevoegen
    },
    view: ({ attrs: { iv, props, field, onchange } }) => {
      const id = props.id || '';
      const {
        sources = [] as IMapLibreSource[],
        polygons = {
          type: 'FeatureCollection',
          features: [],
        } as FeatureCollection,
      } = iv;
      const { className = 'col s12', drawingPolygons = false, drawnPolygonLimit = 0, style = 'height: 400px' } = field;

      return m(mapLibreMap, {
        id,
        className,
        style,
        sources,
        drawingPolygons,
        drawnPolygonLimit,
        polygons,
        options,
        onStateChange: (state: pluginState) => {
          onchange && onchange(state as unknown as string);
          m.redraw();
        },
      });
    },
  };
};
