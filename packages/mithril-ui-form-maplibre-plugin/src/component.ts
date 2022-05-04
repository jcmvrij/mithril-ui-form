import MapboxDraw from '@mapbox/mapbox-gl-draw';
import 'maplibre-gl/dist/maplibre-gl.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import maplibregl, {
  GeoJSONFeature,
  Listener,
  LngLatLike,
  MapEvent,
  MapEventType,
  MapLayerEventType,
  StyleSpecification,
} from 'maplibre-gl';
import m, { Attributes, FactoryComponent } from 'mithril';
import {
  addMapListenersForMovingFeatures,
  handleDrawCreateEvent,
  handleDrawDeleteEvent,
  handleDrawUpdateEvent,
  IMapLibreSource,
  updatePolygonsOnMap,
  updateSourcesAndLayers,
} from './component-utils';

const appIcons = [
  [require('./assets/red.png'), 'RED'],
  [require('./assets/blue.png'), 'BLUE'],
  [require('./assets/white.png'), 'WHITE'],
] as Array<[img: any, name: string]>;
// import red from './assets/red.png';
// import blue from './assets/blue.png';
// import white from './assets/white.png';
// const appIcons = [
//   [red, 'RED'],
//   [blue, 'BLUE'],
//   [white, 'WHITE'],
// ] as Array<[img: any, name: string]>;

export interface IMaplibreMap extends Attributes {
  id?: string;
  source?: IMapLibreSource;
  drawnPolygonLimit?: number;
  style?: StyleSpecification | string;
  center?: LngLatLike;
  zoom?: number;
  maxZoom?: number | null;
}

declare type MapLayerEventTypeDrawExtended = MapLayerEventType & {
  'draw.create': (e: { type: string; features: GeoJSONFeature[] }) => void;
  'draw.update': (e: { type: string; features: GeoJSONFeature[] }) => void;
  'draw.delete': (e: { type: string; features: GeoJSONFeature[] }) => void;
};

declare interface DrawableMap {
  on(type: MapEvent, listener: Listener): this;
  on<T extends keyof MapEventType>(type: T, listener: (ev: MapEventType[T] & Object) => void): this;
  on<U extends keyof MapLayerEventTypeDrawExtended>(event: U, listener: MapLayerEventTypeDrawExtended[U]): this;
  on<T extends keyof MapLayerEventTypeDrawExtended>(
    type: T,
    layer: string,
    listener: (ev: MapLayerEventTypeDrawExtended[T]) => void
  ): this;
}

class DrawableMap extends maplibregl.Map {}

export const MaplibreMap: FactoryComponent<IMaplibreMap> = () => {
  let componentid: string | HTMLElement;
  let map: DrawableMap;
  let draw: MapboxDraw;
  let canvas: HTMLElement;

  return {
    oninit: ({ attrs: { id } }) => {
      componentid = id || uniqueId();
    },
    onupdate: ({ attrs: { sources, polygons } }) => {
      console.log('component update triggered');
      updatePolygonsOnMap(polygons, draw);
      updateSourcesAndLayers(sources, map, canvas);
      console.log(map.getStyle());
    },
    view: ({ attrs: { style = 'height: 400px', className } }) => {
      return m(`div[id=${componentid}]`, { style, className });
    },
    oncreate: ({ attrs: { style, center, zoom, maxZoom, sources, polygons, drawnPolygonLimit } }) => {
      map = new maplibregl.Map({
        container: componentid,
        style: style || 'https://geodata.nationaalgeoregister.nl/beta/topotiles-viewer/styles/achtergrond.json',
        center: center || [4.327, 52.11],
        zoom: zoom || 15.99,
        maxZoom: maxZoom || 15.99,
      });
      appIcons.forEach(([image, name]) => {
        map.loadImage(image, (error, img) => {
          if (error) throw error;
          if (!map.hasImage(name)) map.addImage(name, img as ImageBitmap);
        });
      });
      draw = new MapboxDraw({
        displayControlsDefault: false,
        controls: {
          polygon: true,
          trash: true,
        },
      });
      // @ts-ignore
      map.addControl(draw as IControl, 'top-left');

      map.once('load', () => {
        map.on('draw.create', ({ features }) => {
          handleDrawCreateEvent(draw, features, polygons, drawnPolygonLimit);
        });
        map.on('draw.update', ({ features }) => handleDrawUpdateEvent(features, polygons));
        map.on('draw.delete', ({ features }) => handleDrawDeleteEvent(draw, features, polygons));
        canvas = map.getCanvasContainer();
        updatePolygonsOnMap(polygons, draw);
        updateSourcesAndLayers(sources, map, canvas);
        addMapListenersForMovingFeatures(map, sources, canvas);

        // map.addSource('TEST', {
        //   type: 'geojson',
        //   data: {
        //     type: 'Feature',
        //     properties: {},
        //     geometry: {
        //       type: 'Point',
        //       coordinates: [4.327293, 52.109],
        //     },
        //   },
        // });
        // map.addLayer({
        //   id: 'TESTLAYERID',
        //   type: 'circle',
        //   source: 'TEST',
        //   layout: {},
        //   paint: {
        //     'circle-radius': 15,
        //     'circle-color': '#32a852',
        //   },
        //   filter: ['all'],
        // });
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
