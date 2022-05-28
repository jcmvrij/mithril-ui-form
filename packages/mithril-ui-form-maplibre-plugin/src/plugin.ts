import m from 'mithril';
import { FeatureCollection } from 'geojson';
import { PluginType } from 'mithril-ui-form-plugin';
import { mapLibreMap, mapLibreState } from './component';
import { IMapLibreSource } from './component-utils';

export interface MapLibrePluginOptions {
  icons?: Array<[img: string, name: string]>;
  fallbackIcon?: string;
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
  // let typedSources;
  // let typedPolygons;
  return {
    oninit: () => {
      // type checks
      // if (instanceofIMapLibreSourceArray(iv.sources)) {
      //   typedSources = iv.sources;
      //   console.log(typedSources);
      // }
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
      const {
        className = 'col s12',
        style = 'height: 400px',
        mapstyle = 'https://geodata.nationaalgeoregister.nl/beta/topotiles-viewer/styles/achtergrond.json',
        center = [4.327, 52.11],
        zoom = 15.99,
        maxZoom = 15.99,
        polygonControlBar = true,
        drawnPolygonLimit = 0,
      } = field;

      return m(mapLibreMap, {
        id,
        className,
        style,
        mapstyle,
        center,
        zoom,
        maxZoom,
        sources,
        polygons,
        polygonControlBar,
        drawnPolygonLimit,
        options,
        onStateChange: (state: mapLibreState) => {
          onchange && onchange(state as unknown as string);
          m.redraw();
        },
      });
    },
  };
};

// const instanceofIMapLibreSourceArray = (objectArray: any[]): objectArray is IMapLibreSource[] => {
//   const nonConformingObject = objectArray.find(
//     (object) => !('id' in object && 'source' in object && 'layers' in object)
//   );
//   return nonConformingObject === undefined;
// };
