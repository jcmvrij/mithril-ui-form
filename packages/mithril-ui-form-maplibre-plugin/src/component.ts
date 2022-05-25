import m, { Attributes, FactoryComponent } from 'mithril';
import maplibregl, {
  GeoJSONFeature,
  Listener,
  LngLatLike,
  MapEvent,
  MapEventType,
  MapLayerEventType,
  StyleSpecification,
} from 'maplibre-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import {
  addMapListenersForMovingFeatures,
  handleDrawCreateEvent,
  handleDrawDeleteEvent,
  handleDrawUpdateEvent,
  IMapLibreSource,
  updatePolygons,
  updateSourcesAndLayers,
} from './component-utils';
import { FeatureCollection } from 'geojson';
import 'maplibre-gl/dist/maplibre-gl.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';

export interface IMapLibreMap extends Attributes {
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

export declare interface DrawableMap {
  on(type: MapEvent, listener: Listener): this;
  on<T extends keyof MapEventType>(type: T, listener: (ev: MapEventType[T] & Object) => void): this;
  on<U extends keyof MapLayerEventTypeDrawExtended>(event: U, listener: MapLayerEventTypeDrawExtended[U]): this;
  on<T extends keyof MapLayerEventTypeDrawExtended>(
    type: T,
    layer: string,
    listener: (ev: MapLayerEventTypeDrawExtended[T]) => void
  ): this;
}

export class DrawableMap extends maplibregl.Map {}

export interface pluginState {
  polygons: FeatureCollection;
  sources: IMapLibreSource[];
}

export const mapLibreMap: FactoryComponent<IMapLibreMap> = () => {
  let componentId: string | HTMLElement;
  let map: DrawableMap;
  let draw: MapboxDraw;
  let canvas: HTMLElement;
  let state: pluginState = {
    polygons: {
      type: 'FeatureCollection',
      features: [],
    },
    sources: [],
  };

  return {
    oninit: ({ attrs: { id, polygons, sources } }) => {
      componentId = id || uniqueId();
      state.polygons = polygons;
      state.sources = sources;
      console.log(state);
    },
    onupdate: () => {
      console.log('component update <>');
      if (state.polygons) updatePolygons(state.polygons, draw);
      updateSourcesAndLayers(state, map, canvas);
    },
    view: ({ attrs: { style, className } }) => {
      return m(`div[id=${componentId}]`, { style, className });
    },
    oncreate: ({
      attrs: { onStateChange, mapstyle, center, zoom, maxZoom, drawingPolygons, drawnPolygonLimit, options },
    }) => {
      map = new maplibregl.Map({
        container: componentId,
        style: mapstyle || 'https://geodata.nationaalgeoregister.nl/beta/topotiles-viewer/styles/achtergrond.json',
        center: center || [4.327, 52.11],
        zoom: zoom || 15.99,
        maxZoom: maxZoom || 15.99,
      });
      console.log('map object created');
      if (options.appIcons) {
        (options.appIcons as Array<[img: string, name: string]>).forEach(([image, name]) => {
          map.loadImage(image, (error, img) => {
            console.log('image loaded');
            if (error) throw error;
            if (!map.hasImage(name)) map.addImage(name, img as ImageBitmap);
          });
        });
      }
      if (state.polygons || drawingPolygons) {
        draw = new MapboxDraw({
          displayControlsDefault: false,
          controls: {
            polygon: true,
            trash: true,
          },
        });
        // @ts-ignore
        map.addControl(draw as IControl, 'top-left');

        map.on('draw.create', ({ features }) =>
          handleDrawCreateEvent(draw, map, features, state, drawnPolygonLimit, onStateChange)
        );
        map.on('draw.update', ({ features }) => handleDrawUpdateEvent(map, features, state, onStateChange));
        map.on('draw.delete', ({ features }) => handleDrawDeleteEvent(map, features, state, onStateChange));

        map.once('load', () => {
          updatePolygons(state.polygons, draw);
        });
      }

      map.on('styleimagemissing', (e) => {
        map.loadImage(options.fallbackIcon, (error, image) => {
          if (error) throw error;
          map.addImage(e.id, image as ImageBitmap);
          console.log('fallback image for ' + e.id + ' loaded');
        });
      });

      canvas = map.getCanvasContainer();
      addMapListenersForMovingFeatures(state, onStateChange, map, canvas);

      map.once('load', () => {
        updateSourcesAndLayers(state, map, canvas);
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
