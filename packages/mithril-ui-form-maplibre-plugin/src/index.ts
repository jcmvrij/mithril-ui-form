import { LngLatLike, Map as maplibreMap, StyleSpecification } from 'maplibre-gl';
import m, { Attributes, FactoryComponent } from 'mithril';
import { PluginType } from 'mithril-ui-form-plugin';

export interface IMaplibreMap extends Attributes {
  id?: string;
  mapOptions: {
    style?: StyleSpecification | string;
    center?: LngLatLike;
    zoom?: number;
    maxZoom?: number | null;
  };
}

export const MaplibreMap: FactoryComponent<IMaplibreMap> = () => {
  let componentid: string | HTMLElement;
  let libreMap: maplibreMap;

  return {
    oninit: ({ attrs: { id } }) => {
      componentid = id || uniqueId();
    },
    view: ({ attrs: { style = 'height: 400px', className } }) => {
      return m(`div[id=${componentid}]`, { style, className });
    },
    oncreate: ({ attrs: { mapOptions } }) => {
      libreMap = new maplibreMap({
        container: componentid,
        style:
          mapOptions.style || 'https://geodata.nationaalgeoregister.nl/beta/topotiles-viewer/styles/achtergrond.json',
        center: mapOptions.center || [4.27, 52.05],
        zoom: mapOptions.zoom || 14,
        maxZoom: mapOptions.maxZoom || 15.99,
      });
      libreMap.doubleClickZoom.disable();
      libreMap.on('dragend', () => console.log(libreMap.getBounds()));
      libreMap.on('zoomend', () => console.log(libreMap.getBounds()));
    },
  };
};

export const maplibrePlugin: PluginType = () => {
  return {
    view: () => {
      return m(MaplibreMap, {
        className: 'col s12',
        mapOptions: {},
      });
    },
  };
};

const uniqueId = () => {
  return 'idxxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    // tslint:disable-next-line:no-bitwise
    const r = (Math.random() * 16) | 0;
    // tslint:disable-next-line:no-bitwise
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};
