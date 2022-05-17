import { FeatureCollection } from 'geojson';
import m, { Attributes, FactoryComponent } from 'mithril';
import {
  addMapListenersForMovingFeatures,
  DrawableMap,
  generateGradientIcon,
  handleDrawCreateEvent,
  handleDrawDeleteEvent,
  handleDrawUpdateEvent,
  IMapLibreSource,
  updatePolygons,
  updateSourcesAndLayers,
} from './component-utils';

export interface IMaplibreMap extends Attributes {
  map: DrawableMap;
  draw: MapboxDraw;
  id: string;
  sources: IMapLibreSource[];
  polygons: FeatureCollection;
  drawnPolygonLimit?: number;
}

export const MaplibreMap: FactoryComponent<IMaplibreMap> = () => {
  let canvas: HTMLElement;

  return {
    onupdate: ({ attrs: { map, draw, sources, polygons } }) => {
      updatePolygons(polygons, draw);
      updateSourcesAndLayers(sources, map, canvas);
    },
    view: ({ attrs: { id, style = 'height: 400px', className } }) => {
      return m(`div[id=${id}]`, { style, className });
    },
    oncreate: ({ attrs: { map, draw, sources, polygons, drawnPolygonLimit } }) => {
      // @ts-ignore
      map.addControl(draw as IControl, 'top-left');
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

// const uniqueId = () => {
//   return 'idxxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
//     // tslint:disable-next-line:no-bitwise
//     const r = (Math.random() * 16) | 0;
//     // tslint:disable-next-line:no-bitwise
//     const v = c === 'x' ? r : (r & 0x3) | 0x8;
//     return v.toString(16);
//   });
// };
