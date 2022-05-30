import { GeoJSONFeature, GeoJSONSource, LayerSpecification, MapLayerMouseEvent } from 'maplibre-gl';
import { FeatureCollection, Point } from 'geojson';
import { DrawableMap, MapLibreState } from './component';
import MapboxDraw from '@mapbox/mapbox-gl-draw';

interface IMapLibreLayer {
  id: string;
  showLayer?: boolean;
  type: LayerSpecification;
  layout?: LayerSpecification['layout'];
  paint?: LayerSpecification['paint'];
  filter?: any[];
}

export interface IMapLibreSource {
  id: string;
  source: FeatureCollection;
  layers: IMapLibreLayer[];
}

export const handleDrawCreateEvent = (
  features: GeoJSONFeature[],
  state: MapLibreState,
  draw: MapboxDraw | null,
  drawnPolygonLimit: number | undefined,
  onStateChange: any
) => {
  state.polygons.features.push(features[0]);
  if (draw && drawnPolygonLimit && drawnPolygonLimit > 0 && state.polygons.features.length > drawnPolygonLimit) {
    const oldestPolygonId = state.polygons.features[0].id?.toString();
    if (oldestPolygonId) draw.delete(oldestPolygonId);
    state.polygons.features.shift();
  }
  onStateChange(state);
};

export const handleDrawUpdateEvent = (features: GeoJSONFeature[], state: MapLibreState, onStateChange: any) => {
  state.polygons.features = state.polygons.features.map((pfeature) =>
    features[0].id === pfeature.id ? features[0] : pfeature
  );
  onStateChange(state);
};

export const handleDrawDeleteEvent = (features: GeoJSONFeature[], state: MapLibreState, onStateChange: any) => {
  state.polygons.features = state.polygons.features.filter((pfeature) => pfeature.id !== features[0].id);
  onStateChange(state);
};

export const updatePolygons = (polygons: FeatureCollection | undefined, draw: MapboxDraw | null) => {
  if (polygons && draw) draw.set(polygons);
};

export const updateSourcesAndLayers = (sources: IMapLibreSource[], map: maplibregl.Map, canvas: HTMLElement) => {
  if (sources) {
    sources.forEach((source: IMapLibreSource) => {
      if (!map.getSource(source.id)) {
        map.addSource(source.id, {
          type: 'geojson',
          data: source.source,
        });
      } else {
        (map.getSource(source.id) as GeoJSONSource).setData(source.source);
      }

      source.layers.forEach((layer) => {
        const layerId = source.id + layer.id;
        if (!map.getLayer(layerId)) {
          map.addLayer({
            id: layerId,
            // @ts-ignore
            type: layer.type,
            source: source.id,
            layout: layer.layout,
            // @ts-ignore
            paint: layer.paint,
            filter: layer.filter,
          });

          if (source.source.features[0].properties && source.source.features[0].properties.movable) {
            map.on('mouseenter', layerId, () => {
              canvas.style.cursor = 'move';
            });
            map.on('mouseleave', layerId, () => {
              canvas.style.cursor = '';
            });
          }
        }
      });
    });
  }
};

export const addMovingFeaturesMapListeners = (
  state: MapLibreState,
  onStateChange: any,
  map: maplibregl.Map,
  canvas: HTMLElement
) => {
  map.on('mousedown', (e) => {
    const topFeatureAtClick = map.queryRenderedFeatures(e.point)[0];
    if (topFeatureAtClick.properties.movable) {
      e.preventDefault();
      map.moveLayer(topFeatureAtClick.layer.id);
      canvas.style.cursor = 'grab';
      const eventsWhenMouseDownAndMoving = (e: MapLayerMouseEvent) => {
        canvas.style.cursor = 'grabbing';
        // update only source of map when moving feature
        const coordinates = e.lngLat;
        (map.getSource(topFeatureAtClick.source) as GeoJSONSource).setData({
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'Point',
                coordinates: [coordinates.lng, coordinates.lat],
              },
            },
          ],
        });
      };
      map.on('mousemove', eventsWhenMouseDownAndMoving);
      map.once('mouseup', (e) => {
        canvas.style.cursor = '';
        const coordinates = e.lngLat;
        // moving feature stops, last location of the feature is saved in the source in the application
        const index = state.sources.findIndex((source) => source.id === topFeatureAtClick.source);
        (state.sources[index].source.features[0].geometry as Point).coordinates = [coordinates.lng, coordinates.lat];
        map.off('mousemove', eventsWhenMouseDownAndMoving);
        onStateChange(state);
      });
    }
  });
};

export const uniqueId = () => {
  return 'idxxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    // tslint:disable-next-line:no-bitwise
    const r = (Math.random() * 16) | 0;
    // tslint:disable-next-line:no-bitwise
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const addIcons = (map: DrawableMap, appIcons: Array<[img: string, name: string]>) => {
  appIcons.forEach(([image, name]) => {
    map.loadImage(image, (error, img) => {
      if (error) throw error;
      if (!map.hasImage(name)) map.addImage(name, img as ImageBitmap);
    });
  });
};

export const addFallbackIcon = (map: DrawableMap, fallbackIcon: string) => {
  let loadedFallbackImage: ImageBitmap;
  map.loadImage(fallbackIcon, (error, image) => {
    if (error) throw error;
    loadedFallbackImage = image as ImageBitmap;
  });
  map.on('styleimagemissing', ({ id }) => {
    map.addImage(id, loadedFallbackImage);
  });
};

export const createMapboxDrawBasedOnContext = (polygonControlBar: boolean, polygons: FeatureCollection) => {
  if (polygonControlBar) {
    return new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: true,
        trash: true,
      },
    });
  } else if (polygons) {
    return new MapboxDraw({
      displayControlsDefault: false,
      controls: {},
    });
  }
  return null;
};
