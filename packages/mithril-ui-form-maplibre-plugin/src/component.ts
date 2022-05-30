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
  addIcons,
  addFallbackIcon,
  addMovingFeaturesMapListeners,
  createMapboxDrawBasedOnContext,
  handleDrawCreateEvent,
  handleDrawDeleteEvent,
  handleDrawUpdateEvent,
  IMapLibreSource,
  uniqueId,
  updatePolygons,
  updateSourcesAndLayers,
} from './componentUtils';
import { FeatureCollection } from 'geojson';
import 'maplibre-gl/dist/maplibre-gl.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';

export interface IMapLibreMap extends Attributes {
  id: string;
  className: string;
  style: StyleSpecification | string;
  mapstyle: string;
  center: LngLatLike;
  zoom: number;
  maxZoom: number | null;
  sources: IMapLibreSource[];
  polygons: FeatureCollection;
  polygonControlBar: boolean;
  drawnPolygonLimit: number;
  mapIcons?: Array<[img: string, name: string]>;
  mapFallbackIcon?: string;
  onStateChange: (state: MapLibreState) => void;
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

export interface MapLibreState {
  polygons: FeatureCollection;
  sources: IMapLibreSource[];
}

export const mapLibreMap: FactoryComponent<IMapLibreMap> = () => {
  let componentId: string | HTMLElement;
  let map: DrawableMap;
  let draw: MapboxDraw | null;
  let canvas: HTMLElement;
  let state: MapLibreState = {
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
    },
    onupdate: () => {
      updatePolygons(state.polygons, draw);
      updateSourcesAndLayers(state.sources, map, canvas);
    },
    view: ({ attrs: { style, className } }) => {
      return m(`div[id=${componentId}]`, { style, className });
    },
    oncreate: ({
      attrs: {
        onStateChange,
        mapstyle,
        center,
        zoom,
        maxZoom,
        polygonControlBar,
        drawnPolygonLimit,
        mapIcons,
        mapFallbackIcon,
      },
    }) => {
      map = new maplibregl.Map({
        container: componentId,
        style: mapstyle,
        center: center,
        zoom: zoom,
        maxZoom: maxZoom,
      });
      if (mapIcons) addIcons(map, mapIcons);
      if (mapFallbackIcon) addFallbackIcon(map, mapFallbackIcon);

      canvas = map.getCanvasContainer();
      addMovingFeaturesMapListeners(state, onStateChange, map, canvas);

      draw = createMapboxDrawBasedOnContext(polygonControlBar, state.polygons);
      if (draw) {
        // @ts-ignore
        map.addControl(draw as IControl, 'top-left');
        map.on('draw.create', ({ features }) =>
          handleDrawCreateEvent(features, state, draw, drawnPolygonLimit, onStateChange)
        );
        map.on('draw.update', ({ features }) => handleDrawUpdateEvent(features, state, onStateChange));
        map.on('draw.delete', ({ features }) => handleDrawDeleteEvent(features, state, onStateChange));
      }

      map.once('load', () => {
        updatePolygons(state.polygons, draw);
        updateSourcesAndLayers(state.sources, map, canvas);
      });
    },
  };
};
