// Naver Maps JavaScript SDK v3 TypeScript Declarations
declare namespace naver {
  namespace maps {
    type MapTypeIdType = string;

    const MapTypeId: {
      NORMAL: MapTypeIdType;
      TERRAIN: MapTypeIdType;
      SATELLITE: MapTypeIdType;
      HYBRID: MapTypeIdType;
    };

    const Position: {
      CENTER: number;
      TOP_LEFT: number;
      TOP_CENTER: number;
      TOP_RIGHT: number;
      LEFT_CENTER: number;
      RIGHT_CENTER: number;
      BOTTOM_LEFT: number;
      BOTTOM_CENTER: number;
      BOTTOM_RIGHT: number;
    };

    class LatLng {
      constructor(lat: number, lng: number);
      lat(): number;
      lng(): number;
      equals(other: LatLng): boolean;
      toString(): string;
    }

    class LatLngBounds {
      getSW(): LatLng;
      getNE(): LatLng;
      getCenter(): LatLng;
      hasLatLng(latlng: LatLng): boolean;
      extend(latlng: LatLng): LatLngBounds;
    }

    class Size {
      constructor(width: number, height: number);
    }

    class Point {
      constructor(x: number, y: number);
    }

    interface MarkerIconOptions {
      content?: string | HTMLElement;
      size?: Size;
      anchor?: Point;
      origin?: Point;
      url?: string;
    }

    interface MarkerOptions {
      position: LatLng;
      map?: Map;
      icon?: MarkerIconOptions | string;
      title?: string;
      zIndex?: number;
      clickable?: boolean;
      draggable?: boolean;
      visible?: boolean;
    }

    class Marker {
      constructor(options: MarkerOptions);
      setMap(map: Map | null): void;
      getMap(): Map | null;
      setPosition(position: LatLng): void;
      getPosition(): LatLng;
      setIcon(icon: MarkerIconOptions | string): void;
      setZIndex(zIndex: number): void;
      addListener(eventName: string, listener: () => void): MapEventListener;
    }

    interface PolylineOptions {
      map?: Map;
      path: LatLng[];
      strokeColor?: string;
      strokeWeight?: number;
      strokeOpacity?: number;
      strokeStyle?: string;
      clickable?: boolean;
      zIndex?: number;
    }

    class Polyline {
      constructor(options: PolylineOptions);
      setMap(map: Map | null): void;
    }

    interface InfoWindowOptions {
      content?: string | HTMLElement;
      disableAnchor?: boolean;
      backgroundColor?: string;
      borderColor?: string;
      borderWidth?: number;
      pixelOffset?: Point;
      anchorSize?: Size;
      anchorColor?: string;
      zIndex?: number;
    }

    class InfoWindow {
      constructor(options?: InfoWindowOptions);
      open(map: Map, anchor?: Marker | LatLng): void;
      close(): void;
      isOpen(): boolean;
      setContent(content: string | HTMLElement): void;
    }

    interface ZoomControlOptions {
      position?: number;
      style?: number;
    }

    interface MapOptions {
      center: LatLng;
      zoom: number;
      mapTypeId?: MapTypeIdType;
      minZoom?: number;
      maxZoom?: number;
      zoomControl?: boolean;
      zoomControlOptions?: ZoomControlOptions;
      mapDataControl?: boolean;
      scaleControl?: boolean;
      logoControl?: boolean;
      mapTypeControl?: boolean;
    }

    class Map {
      constructor(element: HTMLElement | string, options: MapOptions);
      getZoom(): number;
      setZoom(zoom: number, animate?: boolean): void;
      getBounds(): LatLngBounds;
      getCenter(): LatLng;
      setCenter(latlng: LatLng): void;
      panTo(latlng: LatLng): void;
      morph(latlng: LatLng, zoom?: number): void;
      destroy(): void;
    }

    interface MapEventListener {
      eventName: string;
      target: object;
    }

    namespace Event {
      function addListener(target: object, eventName: string, listener: () => void): MapEventListener;
      function removeListener(listener: MapEventListener): void;
      function clearListeners(target: object, eventName?: string): void;
    }

    type Coord = LatLng | { x: number; y: number };

    namespace Service {
      enum Status {
        OK = 200,
        ERROR = 500,
      }
      enum OrderType {
        ADDR = 'addr',
        ROAD_ADDR = 'roadaddr',
        LATLNG = 'latlng',
      }
      interface ReverseGeocodeOptions {
        coords: Coord;
        orders?: string;
      }
      interface RegionArea {
        name: string;
        coords?: { center: { crs: string; x: number; y: number } };
      }
      interface ReverseGeocodeResult {
        region: {
          area0: RegionArea;
          area1: RegionArea;
          area2: RegionArea;
          area3: RegionArea;
          area4: RegionArea;
        };
      }
      interface ReverseGeocodeResponse {
        v2: {
          status: { code: number; message: string; name: string };
          results: ReverseGeocodeResult[];
        };
      }
      function reverseGeocode(
        options: ReverseGeocodeOptions,
        callback: (status: Status, response: ReverseGeocodeResponse) => void,
      ): void;
    }
  }
}
