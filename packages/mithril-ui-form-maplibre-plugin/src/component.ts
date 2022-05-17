import MapboxDraw from '@mapbox/mapbox-gl-draw';
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
import 'maplibre-gl/dist/maplibre-gl.css';
import m, { Attributes, FactoryComponent } from 'mithril';
import {
  addMapListenersForMovingFeatures,
  generateGradientIcon,
  handleDrawCreateEvent,
  handleDrawDeleteEvent,
  handleDrawUpdateEvent,
  IMapLibreSource,
  updatePolygons,
  updateSourcesAndLayers,
} from './component-utils';

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
  let componentId: string | HTMLElement;
  let map: DrawableMap;
  let draw: MapboxDraw;
  let canvas: HTMLElement;

  return {
    oninit: ({ attrs: { id } }) => {
      componentId = id || uniqueId();
    },
    onupdate: ({ attrs: { sources, polygons } }) => {
      updatePolygons(polygons, draw);
      updateSourcesAndLayers(sources, map, canvas);
    },
    view: ({ attrs: { style = 'height: 400px', className } }) => {
      return m(`div[id=${componentId}]`, { style, className });
    },
    oncreate: ({
      attrs: { style, center, zoom, maxZoom, sources, polygons, drawnPolygonTools, drawnPolygonLimit, appIcons },
    }) => {
      map = new maplibregl.Map({
        container: componentId,
        style: style || 'https://geodata.nationaalgeoregister.nl/beta/topotiles-viewer/styles/achtergrond.json',
        center: center || [4.327, 52.11],
        zoom: zoom || 15.99,
        maxZoom: maxZoom || 15.99,
      });
      if (appIcons) {
        (appIcons as Array<[img: any, name: string]>).forEach(([image, name]) => {
          map.loadImage(image, (error, img) => {
            if (error) throw error;
            if (!map.hasImage(name)) map.addImage(name, img as ImageBitmap);
          });
        });
      }
      if (drawnPolygonTools) {
        draw = new MapboxDraw({
          displayControlsDefault: false,
          controls: {
            polygon: true,
            trash: true,
          },
        });
        // @ts-ignore
        map.addControl(draw as IControl, 'top-left');
      }
      map.on('draw.create', ({ features }) => {
        handleDrawCreateEvent(draw, features, polygons, drawnPolygonLimit);
      });
      map.on('draw.update', ({ features }) => handleDrawUpdateEvent(features, polygons));
      map.on('draw.delete', ({ features }) => handleDrawDeleteEvent(features, polygons));

      map.on('styleimagemissing', (e) => {
        map.addImage(e.id, generateGradientIcon());
      });

      canvas = map.getCanvasContainer();
      addMapListenersForMovingFeatures(map, sources, canvas);

      map.once('load', () => {
        updatePolygons(polygons, draw);
        updateSourcesAndLayers(sources, map, canvas);
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
