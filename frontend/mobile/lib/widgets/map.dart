import 'dart:async';
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:mapbox_maps_flutter/mapbox_maps_flutter.dart';

enum TrackingMode {
  gps,
  compass,
  none,
}

class MapBoxWidget extends StatefulWidget {
  const MapBoxWidget({super.key});

  @override
  State<MapBoxWidget> createState() => _MapBoxWidgetState();
}

class _MapBoxWidgetState extends State<MapBoxWidget> {
  MapboxMap? _mapboxMap;

  Timer? _timer;
  TrackingMode _trackingMode = TrackingMode.gps;
  Position _position = Position(0, 0);
  late double _bearing;

  final CameraOptions _initialPosition = CameraOptions(
    center: Point(
      coordinates: Position(
        11.125916,
        46.068460,
      ),
    ).toJson(),
    zoom: 12.0,
  );

  void _trackWithPosition() {
    _trackingMode = TrackingMode.gps;

    _mapboxMap?.setCamera(CameraOptions(
      zoom: 16,
    ));

    _updateCamera();
  }

  void _trackWithCompass() {
    _trackingMode = TrackingMode.compass;

    _mapboxMap?.setCamera(CameraOptions(
      zoom: 16,
    ));

    _updateCamera();
  }

  Future<void> _updateUserPositionAndBearing() async {
    Layer? layer;
    if (Platform.isAndroid) {
      layer =
          await _mapboxMap?.style.getLayer("mapbox-location-indicator-layer");
    } else {
      layer = await _mapboxMap?.style.getLayer("puck");
    }

    var location = (layer as LocationIndicatorLayer).location;
    _bearing = layer.bearing!;
    _position = Position(location![1]!, location[0]!);

    _updateCamera();
  }

  _updateCamera() {
    if (_trackingMode == TrackingMode.gps) {
      _mapboxMap?.easeTo(
          CameraOptions(
            center: Point(coordinates: _position).toJson(),
            zoom: 17.0,
          ),
          MapAnimationOptions(duration: 1000));
    }

    if (_trackingMode == TrackingMode.compass) {
      _mapboxMap?.easeTo(
          CameraOptions(
            center: Point(coordinates: _position).toJson(),
            bearing: _bearing,
          ),
          MapAnimationOptions(duration: 1000));
    }
  }

  _onMapCreated(MapboxMap mapboxMap) async {
    _mapboxMap = mapboxMap;

    mapboxMap.location.updateSettings(
        LocationComponentSettings(enabled: true, puckBearingEnabled: true));

    _timer = Timer.periodic(const Duration(seconds: 1),
        (Timer t) => _updateUserPositionAndBearing());

    _mapboxMap?.scaleBar.updateSettings(ScaleBarSettings(
      enabled: false,
    ));

    _mapboxMap?.logo.updateSettings(LogoSettings(
      marginBottom: 10,
      marginLeft: 20,
      marginTop: 30,
      marginRight: 30,
    ));

    _mapboxMap?.attribution.updateSettings(AttributionSettings(
      marginBottom: 10,
      marginLeft: 110,
      marginTop: 40,
      marginRight: 0,
    ));

    _mapboxMap?.compass.updateSettings(CompassSettings(
      enabled: true,
      position: OrnamentPosition.BOTTOM_RIGHT,
      marginBottom: 10,
      marginLeft: 10,
      marginTop: 10,
      marginRight: 10,
    ));
  }

  _onScroll(ScreenCoordinate screenCoordinate) {
    _trackingMode = TrackingMode.none;
  }

  @override
  Widget build(BuildContext context) {
    return MapWidget(
      onMapCreated: _onMapCreated,
      styleUri: MapboxStyles.MAPBOX_STREETS,
      textureView: true,
      cameraOptions: _initialPosition,
      onScrollListener: _onScroll,
    );
  }
}
