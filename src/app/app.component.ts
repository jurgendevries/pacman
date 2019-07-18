import { Component, OnInit } from '@angular/core';

import { Map, View } from "ol";
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import Feature from 'ol/Feature.js';
import Geolocation from 'ol/Geolocation.js';
import { OSM, Vector as VectorSource } from 'ol/source';
import { Point } from 'ol/geom.js';
import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style.js';
import { WFS, GeoJSON } from 'ol/format.js';
import { bbox as bboxFilter } from 'ol/format/filter.js';
import proj4 from 'proj4';
import { register } from 'ol/proj/proj4';
import { get as getProjection } from 'ol/proj';
import { PacManGame, Score } from './game/pac-man-game';
import { PacMan } from './game/pac-man';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  public title = 'pacman';
  public map: Map;
  public view: View;
  public source: VectorSource;
  public positionSource: VectorSource;
  public rdNew;
  public game: PacManGame;
  public packMan: PacMan;
  public canvasRendered: boolean = false;
  public score = {};

  constructor() {
    proj4.defs("EPSG:28992",
      "+proj=sterea +lat_0=52.15616055555555 +lon_0=5.38763888888889 +k=0.9999079 " +
      "+x_0=155000 +y_0=463000 +ellps=bessel " +
      "+towgs84=565.417,50.3319,465.552,-0.398957,0.343988,-1.8774,4.0725 +units=m +no_defs");

    register(proj4);
    this.rdNew = getProjection('EPSG:28992');
  }

  ngOnInit() {
    this.initMap();
    this.initGeolocation();
  }

  initMap() {
    this.view = new View({
      center: [0, 0],
      zoom: 2,
      projection: this.rdNew
    });

    var raster = new TileLayer({
      source: new OSM()
    });

    this.map = new Map({
      target: "map",
      layers: [raster],
      view: this.view,
      controls : []
    });
  }

  initGeolocation() {
    let geolocation = new Geolocation({
      trackingOptions: {
        enableHighAccuracy: true
      },
      projection: this.rdNew
    });
    geolocation.setTracking(true);

    geolocation.on('change:position', () => {
      var coordinates = geolocation.getPosition();
      position.setGeometry(coordinates ? new Point(coordinates) : null);
      if (coordinates != null) {
        this.map.getView().fit(
          this.positionSource.getExtent(), {
            maxZoom: 18
          }
        );
        geolocation.setTracking(false);
        this.initNWBWegen(this.map.getView().calculateExtent());
      }
    });

    let position = new Feature();
    position.setStyle(new Style({
      image: new CircleStyle({
        radius: 6,
        fill: new Fill({
          color: '#3399CC'
        }),
        stroke: new Stroke({
          color: '#fff',
          width: 2
        })
      })
    }));

    this.positionSource = new VectorSource({
      features: [position]
    });

    new VectorLayer({
      map: this.map,
      source: this.positionSource
    });
  }

  initNWBWegen(extent) {
    var canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById('canvas');
    var fReq = new WFS().writeGetFeature({
      srsName: 'EPSG:28992',
      featurePrefix: 'nwbwegen',
      featureTypes: ['wegvakken'],
      outputFormat: 'application/json',
      filter: bboxFilter("geom", extent)
    });

    fetch('https://geodata.nationaalgeoregister.nl/nwbwegen/wfs', {
      method: 'POST',
      body: new XMLSerializer().serializeToString(fReq)
    }).then(response => {
      return response.json();
    }).then(json => {

      var features = new GeoJSON().readFeatures(json);
      this.initCanvas(this.convertCoordinatesToCanvas(canvas, features, this.map.getView().calculateExtent()));
    });
  }

  initCanvas(roads: Array<Array<any>>) {
    this.packMan = new PacMan(40, -1, 1, 25);
    this.game = new PacManGame(<HTMLCanvasElement>document.getElementById('canvas'), this.packMan, roads, 5, 25);
    this.game.onDotAdded.subscribe((score: Score) => {
      this.score = score;
    });
  }

  convertCoordinatesToCanvas(canvas, features, extent): Array<Array<any>> {
    var result: Array<Array<number>> = [];
    var context, coords, point, latitude, longitude, xScale, yScale;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    context = canvas.getContext('2d');
    context.strokeStyle = '#333';
    context.lineWidth = 25;

    xScale = canvas.width / Math.abs(extent[0] - extent[2]);
    yScale = canvas.height / Math.abs(extent[3] - extent[1]);
    features.forEach(f => {
      var coordArray: Array<number> = [];
      coords = f.getGeometry().getCoordinates();

      for (var j = 0; j < coords.length; j++) {
        longitude = coords[j][0];
        latitude = coords[j][1];

        point = {
          x: (longitude - extent[0]) * xScale,
          y: (extent[3] - latitude) * yScale
        };

        coordArray.push(point);
      }
      result.push(coordArray);
    });
    return result;
  }
}
