import m from 'mithril';
import { FeatureCollection } from 'geojson';
import { PluginType } from 'mithril-ui-form-plugin';
import { mapLibreMap } from './component';
import { IMapLibreSource } from './componentUtils';

let mapIcons: Array<[img: string, name: string]>;
let mapFallbackIcon: string;

export const mapLibrePlugin = (fallbackIcon?: string, icons?: Array<[img: string, name: string]>) => {
  if (fallbackIcon) mapFallbackIcon = fallbackIcon;
  if (icons) mapIcons = icons;
  return mapLibrePluginFactory;
};

export interface MapLibrePluginState {
  sources: IMapLibreSource[];
  polygons: FeatureCollection;
}

// export interface MapLibrePluginState {
//   sources: IMapLibreSource[];
//   polygons: Feature<Polygon>[];
// }

// type MapLibrePluginType = PluginType & {
//   options: MapLibrePluginOptions;
// };

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
      }: MapLibrePluginState = iv;
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
        mapIcons,
        mapFallbackIcon,
        onStateChange: (state: MapLibrePluginState) => {
          onchange && onchange(state as unknown as string);
          m.redraw();
        },
      });
    },
  };
};
