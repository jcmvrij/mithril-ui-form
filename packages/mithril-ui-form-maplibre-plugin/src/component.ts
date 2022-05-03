import MapboxDraw from '@mapbox/mapbox-gl-draw';
import 'maplibre-gl/dist/maplibre-gl.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import { FeatureCollection } from 'geojson';
import maplibregl, {
  GeoJSONFeature,
  LayerSpecification,
  Listener,
  LngLatLike,
  MapEvent,
  MapEventType,
  MapLayerEventType,
  StyleSpecification,
} from 'maplibre-gl';
import m, { Attributes, FactoryComponent } from 'mithril';

// const appIcons = [
//   [require('./assets/red.png'), 'RED'],
//   [require('./assets/blue.png'), 'BLUE'],
//   [require('./assets/white.png'), 'WHITE'],
// ] as Array<[img: any, name: string]>;
import red from './assets/red.png';
import blue from './assets/blue.png';
import white from './assets/white.png';
const appIcons = [
  [red, 'RED'],
  [blue, 'BLUE'],
  [white, 'WHITE'],
] as Array<[img: any, name: string]>;

export interface MapLibreSource {
  id: string;
  source: FeatureCollection;
  sourceName?: string;
  layers: {
    layerName: string;
    showLayer: boolean;
    type: LayerSpecification;
    layout?: LayerSpecification['layout'];
    paint?: LayerSpecification['paint'];
    filter?: any[];
  };
  onPolygonEdit?: (f: FeatureCollection) => void;
}

export interface IMaplibreMap extends Attributes {
  id?: string;
  source?: MapLibreSource;
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

  return {
    oninit: ({ attrs: { id } }) => {
      componentid = id || uniqueId();
    },
    onupdate: () => {
      // console.log(map.getStyle());
    },
    view: ({ attrs: { style = 'height: 400px', className } }) => {
      return m(`div[id=${componentid}]`, { style, className });
    },
    oncreate: ({
      attrs: { id, style, center, zoom, maxZoom, sources, polygons, drawnPolygonLimit, onPolygonEdit },
    }) => {
      map = new maplibregl.Map({
        container: componentid,
        style: style || 'https://geodata.nationaalgeoregister.nl/beta/topotiles-viewer/styles/achtergrond.json',
        center: center || [4.327, 52.11],
        zoom: zoom || 15.99,
        maxZoom: maxZoom || 15.99,
      });
      map.loadImage('https://upload.wikimedia.org/wikipedia/commons/7/7c/201408_cat.png', (error, image) => {
        if (error) throw error;
        map.addImage('cat', image as ImageBitmap);
      });
      appIcons.forEach(([image, name]) => {
        map.loadImage(image, (error, img) => {
          if (error) throw error;
          if (!map.hasImage(name)) map.addImage(name, img as ImageBitmap);
        });
      });
      const draw = new MapboxDraw({
        displayControlsDefault: false,
        controls: {
          polygon: true,
          trash: true,
        },
      });
      // @ts-ignore
      map.addControl(draw as IControl, 'top-left');

      map.once('load', () => {
        if (polygons && id) draw.set(polygons[id]);
        map.on('draw.create', () => {
          const allPolygons = draw.getAll();
          if (drawnPolygonLimit && allPolygons.features.length > drawnPolygonLimit) {
            const oldestPolygonId = allPolygons.features[0].id?.toString();
            if (oldestPolygonId) draw.delete(oldestPolygonId);
            allPolygons.features.shift();
          }
          polygons = allPolygons;
          onPolygonEdit(polygons);
        });
        map.on('draw.update', () => {
          polygons = draw.getAll();
        });
        map.on('draw.delete', () => (polygons = draw.getAll()));

        sources.forEach((source: MapLibreSource) => {
          map.addSource(source.id, {
            type: 'geojson',
            data: source.source,
          });
          map.addLayer({
            id: source.id + 'Layer',
            type: 'symbol',
            source: source.id,
            layout: source.layers.layout,
            paint: {},
            filter: source.layers.filter,
          });
        });

        // map.on('sourcedata', (e) => {
        //   console.log('A sourcedata event occurred.');
        //   console.log(e);
        // });

        // console.log(map.getStyle());
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
