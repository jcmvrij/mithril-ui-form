import m from 'mithril';
import { PluginType } from 'mithril-ui-form-plugin';
import { mapLibreMap } from './component';
import { IMapLibreSource } from './componentUtils';
import { GeoJSONFeature } from 'maplibre-gl';

let mapIcons: Array<[img: string, name: string]>;
let mapFallbackIcon: string;

export const mapLibrePlugin = (fallbackIcon?: string, icons?: Array<[img: string, name: string]>) => {
  if (fallbackIcon) mapFallbackIcon = fallbackIcon;
  if (icons) mapIcons = icons;
  return mapLibrePluginFactory;
};

export interface MapLibrePluginState {
  sources: IMapLibreSource[];
  polygons: GeoJSONFeature[];
}

export interface MapLibrePluginBBox {
  sw: { lng: number; lat: number };
  ne: { lng: number; lat: number };
}

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
      const { sources = [], polygons = [] }: MapLibrePluginState = iv;
      const {
        className = 'col s12',
        style = 'height: 400px',
        mapstyle = 'https://geodata.nationaalgeoregister.nl/beta/topotiles-viewer/styles/achtergrond.json',
        center = [4.327, 52.11],
        maxBounds,
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
        maxBounds,
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
