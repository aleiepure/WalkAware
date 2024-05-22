// ignore_for_file: use_build_context_synchronously

import 'dart:async';
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:geolocator/geolocator.dart' as geolocator;
import 'package:mapbox_maps_flutter/mapbox_maps_flutter.dart';
import 'package:mapbox_search/mapbox_search.dart';
import 'package:material_symbols_icons/symbols.dart';
import 'package:material_symbols_icons/material_symbols_icons.dart';
import 'package:provider/provider.dart';
import '../pages/new_report_page.dart';
import '../providers/user_provider.dart';
import '../requests/mapbox_requests.dart';
import '../pages/account_page.dart';
import 'package:pedometer/pedometer.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter/src/widgets/visibility.dart' as visibility; // ignore: implementation_imports

enum TrackingMode { none, gps, compass }

class HomePage extends StatefulWidget {
  final bool startAsLogged;

  const HomePage({super.key, this.startAsLogged = false});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();

  MapboxMap? _mapboxMap;
  PolylineAnnotation? _polylineAnnotation;
  PolylineAnnotationManager? _polylineAnnotationManager;
  PointAnnotation? _pointAnnotation;
  PointAnnotationManager? _pointAnnotationManager;

  Timer? _timer; // ignore: unused_field
  TrackingMode _trackingMode = TrackingMode.gps;
  Position _position = Position(0, 0);
  late double _bearing;

  bool _alertLocationServicesShown = false;

  final CameraOptions _initialPosition = CameraOptions(
    center: Point(
      coordinates: Position(
        11.125916,
        46.068460,
      ),
    ),
    zoom: 12.0,
  );

  final SearchBoxAPI _searchBoxAPI = SearchBoxAPI(limit: 8);
  final SearchController _searchController = SearchController();
  final TextEditingController _searchTextEditingController = TextEditingController();

  late bool _isUserLogged;

  late Stream<StepCount> _stepCountStream;
  bool _firstStepUpdate = true;
  int _points = 0;

  /// Track user position with GPS
  ///
  /// This method sets the tracking mode to GPS and moves the camera to the user's position.
  void _trackWithPosition() {
    setState(() {
      _trackingMode = TrackingMode.gps;
    });

    _mapboxMap?.setCamera(CameraOptions(
      zoom: 16,
      bearing: 0,
    ));

    _updateCamera();
  }

  /// Track user position with compass
  ///
  /// This method sets the tracking mode to compass and moves the camera to the user's position.
  void _trackWithCompass() {
    setState(() {
      _trackingMode = TrackingMode.compass;
    });

    _mapboxMap?.setCamera(CameraOptions(
      zoom: 16,
    ));

    _updateCamera();
  }

  /// Disable tracking
  ///
  /// This method disables tracking mode.
  void _disableTracking() {
    setState(() {
      _trackingMode = TrackingMode.none;
    });
  }

  /// Move map ornaments
  ///
  /// This method moves the compass and attribution based on the visibility of the bottom sheet.
  /// Setting both [largeBottomSheetVisible] and [shortBottomSheetVisible] to true is and error.
  void _moveMapOrnaments({bool largeBottomSheetVisible = false}) {
    if (largeBottomSheetVisible) {
      int largeHeight = 180;

      _mapboxMap?.logo.updateSettings(LogoSettings(
        marginBottom: largeHeight + 10,
        marginLeft: 20,
        marginTop: 30,
        marginRight: 30,
      ));

      _mapboxMap?.attribution.updateSettings(AttributionSettings(
        marginBottom: largeHeight + 10,
        marginLeft: 110,
        marginTop: 40,
        marginRight: 0,
      ));

      _mapboxMap?.compass.updateSettings(CompassSettings(
        enabled: true,
        position: OrnamentPosition.BOTTOM_RIGHT,
        marginBottom: largeHeight + 10,
        marginLeft: 10,
        marginTop: 10,
        marginRight: 10,
      ));

      return;
    }

    _mapboxMap?.logo.updateSettings(LogoSettings(
      position: OrnamentPosition.BOTTOM_LEFT,
      marginLeft: MediaQuery.of(context).size.width / 2 - 55,
      marginBottom: 10,
    ));

    _mapboxMap?.attribution.updateSettings(AttributionSettings(
      position: OrnamentPosition.BOTTOM_LEFT,
      marginLeft: MediaQuery.of(context).size.width / 2 + 35,
      marginBottom: 10,
    ));

    _mapboxMap?.compass.updateSettings(CompassSettings(
      enabled: true,
      position: OrnamentPosition.BOTTOM_RIGHT,
      marginRight: 25,
      marginBottom: 160,
    ));
  }

  /// Show location service disabled dialog
  ///
  /// This method shows a dialog to the user when location services are disabled.
  void _showLocationServiceDisabledDialog() {
    if (_alertLocationServicesShown) {
      return;
    }

    showDialog(
      barrierDismissible: false,
      useRootNavigator: false,
      context: context,
      builder: (context) => PopScope(
        onPopInvoked: (didPop) => _alertLocationServicesShown = false,
        child: AlertDialog(
          icon: Icon(Icons.location_off, size: 48, color: Theme.of(context).colorScheme.secondary),
          title: const Text('Posizione disabilitata'),
          content: const Text('Per usare WalkAware Trento, abilita la posizione sul tuo dispositivo.'),
          actions: <Widget>[
            TextButton(
              child: const Text('Ops! Fammi sistemare'),
              onPressed: () {
                geolocator.Geolocator.openLocationSettings();
                Navigator.of(context).pop();
                _alertLocationServicesShown = false;
              },
            ),
          ],
        ),
      ),
    );
    _alertLocationServicesShown = true;
  }

  /// Update user position and bearing
  ///
  /// This method updates the user's position and bearing on the map. Also takes care of permissions and location services.
  Future<void> _updateUserPositionAndBearing() async {
    // Test if location services are enabled
    bool serviceEnabled = await geolocator.Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      _showLocationServiceDisabledDialog();
      return;
    }

    // Get user position
    await _getUserPositionAndBearing().then((userLocation) {
      var (position, bearing) = userLocation;
      _bearing = bearing;
      _position = position;
    });

    // Move camera to user position
    _updateCamera();
  }

  Future<(Position, double)> _getUserPositionAndBearing() async {
    Layer? layer;
    if (Platform.isAndroid) {
      layer = await _mapboxMap?.style.getLayer("mapbox-location-indicator-layer");
    } else {
      layer = await _mapboxMap?.style.getLayer("puck");
    }

    var location = (layer as LocationIndicatorLayer).location;
    return (Position(location![1]!, location[0]!), layer.bearing!);
  }

  /// Update camera
  ///
  /// This method updates the camera position based on the tracking mode.
  void _updateCamera() {
    switch (_trackingMode) {
      case TrackingMode.none:
        return;
      case TrackingMode.gps:
        _mapboxMap?.flyTo(
            CameraOptions(
              center: Point(coordinates: _position),
              zoom: 17.0,
            ),
            MapAnimationOptions(duration: 1000));
        break;
      case TrackingMode.compass:
        _mapboxMap?.flyTo(
            CameraOptions(
              center: Point(coordinates: _position),
              bearing: _bearing,
            ),
            MapAnimationOptions(duration: 1000));
        break;
    }
  }

  /// Map created callback
  ///
  /// This method is called when the map is created. It initializes the map and sets up the map's settings.
  void _onMapCreated(MapboxMap mapboxMap) async {
    _mapboxMap = mapboxMap;

    // Enable location component
    mapboxMap.location.updateSettings(LocationComponentSettings(
      enabled: true,
      puckBearingEnabled: true,
    ));
    _timer = Timer.periodic(const Duration(seconds: 1), (Timer t) => _updateUserPositionAndBearing());

    // Disable scale bar
    _mapboxMap?.scaleBar.updateSettings(ScaleBarSettings(
      enabled: false,
    ));

    // Move ornaments down
    _moveMapOrnaments();

    mapboxMap.annotations.createPolylineAnnotationManager().then((value) {
      _polylineAnnotationManager = value;
    });

    // Create point annotation manager
    mapboxMap.annotations.createPointAnnotationManager().then((value) async {
      _pointAnnotationManager = value;
    });
  }

  /// Map scroll callback
  ///
  /// This method is called when the map is scrolled. It disables tracking mode.
  void _onMapScroll(MapContentGestureContext context) {
    setState(() {
      _trackingMode = TrackingMode.none;
    });
  }

  /// Search suggestion selected callback
  ///
  /// This method is called when a search suggestion is selected. It moves the camera to the selected place and shows a bottom sheet with place details.
  void _onSearchSuggestionSelected(String name, String address, String mapboxId) async {
    // Set search text to selected suggestion
    _searchTextEditingController.text = name;

    // Retrieve place details
    ApiResponse<RetrieveResonse> searchedPlace = await _searchBoxAPI.getPlace(mapboxId);

    // Handle failures: show snackbar with error message and return
    if (searchedPlace.failure is FailureResponse) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text('${searchedPlace.failure?.error}: ${searchedPlace.failure?.message ?? 'Result retrieval failed'}'),
        backgroundColor: Theme.of(context).colorScheme.error,
        duration: const Duration(seconds: 2),
      ));
      return;
    }

    // Remove previous marker
    if (_pointAnnotation != null) {
      _pointAnnotationManager?.delete(_pointAnnotation!);
    }

    // Add marker on map
    Position position = Position(searchedPlace.success?.features.first.geometry.coordinates.long as num,
        searchedPlace.success?.features.first.geometry.coordinates.lat as num);
    final ByteData bytes = await rootBundle.load('assets/marker.png');
    final Uint8List list = bytes.buffer.asUint8List();

    _pointAnnotationManager
        ?.create(PointAnnotationOptions(
          geometry: Point(
            coordinates: position,
          ),
          iconSize: 0.2,
          iconOffset: [0, 0],
          symbolSortKey: 10,
          image: list,
        ))
        .then((value) => _pointAnnotation = value);

    // Move camera to searched place and disable tracking
    _mapboxMap?.flyTo(
      CameraOptions(
        center: Point(coordinates: position),
      ),
      MapAnimationOptions(),
    );
    _disableTracking();

    // Show bottom sheet with place details
    _scaffoldKey.currentState?.showBottomSheet(
      enableDrag: false,
      (context) => _locationInfoBottomSheet(name, address, position),
    );

    // Move compass and attribution up
    _moveMapOrnaments(largeBottomSheetVisible: true);
  }

  /// Location info bottom sheet
  ///
  /// This method returns the bottom sheet with place details.
  Widget _locationInfoBottomSheet(String name, String address, Position destination) {
    return Container(
      height: 180,
      decoration: const BoxDecoration(
        borderRadius: BorderRadius.only(
          topLeft: Radius.circular(20),
          topRight: Radius.circular(20),
        ),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          SizedBox(
            width: double.infinity,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: <Widget>[
                Expanded(
                  flex: 2,
                  child: _locationInfoBottomSheetLocationInfo(name, address),
                ),
                _locationInfoBottomSheetCloseButton(),
              ],
            ),
          ),
          const Spacer(),
          Padding(
            padding: const EdgeInsets.all(8.0),
            child: _locationInfoBottomSheetDirectionsButton(name, address, destination),
          ),
        ],
      ),
    );
  }

  /// Location info bottom sheet close button
  ///
  /// This method returns the close button for the bottom sheet.
  Widget _locationInfoBottomSheetCloseButton() {
    return Padding(
      padding: const EdgeInsets.all(8.0),
      child: Container(
        decoration: BoxDecoration(
          border: Border.all(
            color: Theme.of(context).colorScheme.secondary,
            width: 1,
          ),
          shape: BoxShape.circle,
        ),
        child: IconButton(
          icon: const Icon(Icons.close),
          onPressed: () {
            // Delete marker
            if (_pointAnnotation != null) {
              _pointAnnotationManager?.delete(_pointAnnotation!);
            }

            // Clear search text
            _searchTextEditingController.clear();

            // Move map ornaments back down
            _moveMapOrnaments();

            // Close bottom sheet
            Navigator.of(context).pop();
          },
        ),
      ),
    );
  }

  /// Location info bottom sheet location info
  ///
  /// This method returns the location info for the bottom sheet.
  Widget _locationInfoBottomSheetLocationInfo(String name, String address) {
    return Padding(
      padding: const EdgeInsets.only(top: 16.0),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20.0),
            child: Text(
              style: Theme.of(context).textTheme.titleLarge,
              overflow: TextOverflow.ellipsis,
              softWrap: true,
              maxLines: 2,
              name,
            ),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20.0),
            child: Text(
              style: Theme.of(context).textTheme.titleSmall,
              overflow: TextOverflow.ellipsis,
              softWrap: true,
              maxLines: 2,
              address,
            ),
          ),
        ],
      ),
    );
  }

  /// Location info bottom sheet directions button
  ///
  /// This method returns the directions button for the bottom sheet.
  Widget _locationInfoBottomSheetDirectionsButton(String name, String address, Position destination) {
    return Focus(
      child: FilledButton.icon(
        onPressed: () => _onLocationInfoBottomSheetDirectionsButtonPressed(name, address, destination),
        icon: const Icon(Icons.directions_walk),
        label: const Text('Come ci arrivo?'),
      ),
    );
  }

  /// Location info bottom sheet directions button tap callback
  ///
  /// This method is called when the directions button is tapped.
  void _onLocationInfoBottomSheetDirectionsButtonPressed(String name, String address, Position destination) async {
    LineString geometry = LineString(coordinates: []);
    List<Point> coordinates = [];
    double duration = 0;
    double distance = 0;

    // Obtain route information
    var (source, _) = await _getUserPositionAndBearing();
    await requestMapboxWalkRoute(source, destination).then((response) {
      duration = response['routes'][0]['duration'];
      distance = response['routes'][0]['distance'];
      geometry = LineString.fromJson(response['routes'][0]['geometry']);

      for (var coordinate in response['routes'][0]['geometry']['coordinates']) {
        coordinates.add(Point(coordinates: Position(coordinate[0], coordinate[1])));
      }
    });

    // Draw route on map
    if (_polylineAnnotation != null) {
      _polylineAnnotationManager?.delete(_polylineAnnotation!);
    }
    _polylineAnnotationManager
        ?.create(PolylineAnnotationOptions(
          geometry: geometry,
          lineColor: Colors.green.value,
          lineWidth: 5,
        ))
        .then((value) => _polylineAnnotation = value);

    // Move camera to fit route
    await _mapboxMap
        ?.cameraForCoordinatesPadding(coordinates, CameraOptions(), MbxEdgeInsets(top: 50, left: 50, bottom: 50, right: 50), null, null)
        .then((cameraOptions) => _mapboxMap?.flyTo(cameraOptions, MapAnimationOptions(duration: 1000)));

    // Close search bottom sheet
    Navigator.of(context).pop();

    // Show route details bottom sheet
    _scaffoldKey.currentState?.showBottomSheet(
      enableDrag: false,
      (context) => _routeInfoBottomSheet(name, address, duration, distance),
    );

    // Move ornaments up
    _moveMapOrnaments(largeBottomSheetVisible: true);
  }

  /// Route info bottom sheet
  ///
  /// This method returns the bottom sheet with route details.
  Widget _routeInfoBottomSheet(String name, String address, double duration, double distance) {
    return Container(
      height: 180,
      decoration: const BoxDecoration(
        borderRadius: BorderRadius.only(
          topLeft: Radius.circular(20),
          topRight: Radius.circular(20),
        ),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          SizedBox(
            width: double.infinity,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: <Widget>[
                Expanded(
                  flex: 2,
                  child: _routeInfoBottomSheetRouteInfo(duration, distance),
                ),
                _routeInfoBottomSheetCloseButton(),
              ],
            ),
          ),
          const Spacer(),
          Padding(
            padding: const EdgeInsets.all(8.0),
            child: _routeInfoBottomSheetNavigateButton(name, address),
          ),
        ],
      ),
    );
  }

  /// Route info bottom sheet close button
  ///
  /// This method returns the close button for the route details bottom sheet.
  Widget _routeInfoBottomSheetCloseButton() {
    return Padding(
      padding: const EdgeInsets.all(8.0),
      child: Container(
        decoration: BoxDecoration(
          border: Border.all(
            color: Theme.of(context).colorScheme.secondary,
            width: 1,
          ),
          shape: BoxShape.circle,
        ),
        child: IconButton(
          icon: const Icon(Icons.close),
          onPressed: () {
            // Delete route
            if (_polylineAnnotation != null) {
              _polylineAnnotationManager?.delete(_polylineAnnotation!);
            }

            // Delete marker
            if (_pointAnnotation != null) {
              _pointAnnotationManager?.delete(_pointAnnotation!);
            }

            // Move map ornaments back down
            _moveMapOrnaments();

            // Close bottom sheet
            Navigator.of(context).pop();

            // Clear search text
            _searchTextEditingController.clear();
          },
        ),
      ),
    );
  }

  /// Route info bottom sheet route info
  ///
  /// This method returns the route info for the route details bottom sheet.
  Widget _routeInfoBottomSheetRouteInfo(double duration, double distance) {
    // Format duration
    int hours = (duration / 3600).floor();
    int minutes = (duration % 3600 / 60).floor();
    String durationString = '';

    if (hours > 0) {
      durationString += '${hours}h ';
    }
    if (minutes > 0 || hours == 0) {
      durationString += '$minutes min';
    }

    // Format distance
    String distanceString = '';
    if (distance < 1000) {
      distanceString = '(${distance.toStringAsFixed(0)} m)';
    } else {
      double kilometers = distance / 1000;
      if (kilometers == kilometers.floor()) {
        distanceString = '(${kilometers.toInt()} km)';
      } else {
        distanceString = '(${kilometers.toStringAsFixed(1)} km)';
      }
    }

    return Padding(
      padding: const EdgeInsets.only(top: 16.0),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20.0),
            child: Row(
              children: [
                Text(
                  style: Theme.of(context).textTheme.titleLarge!.copyWith(color: Colors.green),
                  overflow: TextOverflow.ellipsis,
                  durationString,
                ),
                Padding(
                  padding: const EdgeInsets.only(left: 8.0),
                  child: Text(
                    style: Theme.of(context).textTheme.titleLarge,
                    overflow: TextOverflow.ellipsis,
                    distanceString,
                  ),
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20.0),
            child: Text(
              style: Theme.of(context).textTheme.titleSmall,
              overflow: TextOverflow.ellipsis,
              softWrap: true,
              maxLines: 2,
              'Ca. ${(distance / 0.75).ceil()} passi',
            ),
          ),
        ],
      ),
    );
  }

  /// Route info bottom sheet directions button
  ///
  /// This method returns the directions button for the route details bottom sheet.
  Widget _routeInfoBottomSheetNavigateButton(String name, String address) {
    return FilledButton.icon(
      onPressed: () => _onRouteInfoBottomSheetNavigateButtonPressed(name, address),
      icon: const Icon(Icons.navigation),
      label: const Text('Partiamo!'),
    );
  }

  /// Route info bottom sheet directions button tap callback
  ///
  /// This method is called when the navigate button is tapped.
  void _onRouteInfoBottomSheetNavigateButtonPressed(String name, String address) {
    // Close bottom sheet
    Navigator.of(context).pop();

    // Show navigation bottom sheet
    _scaffoldKey.currentState?.showBottomSheet(
      enableDrag: false,
      (context) => _navigationBottomSheet(name, address),
    );

    // Move map ornaments up
    _moveMapOrnaments(largeBottomSheetVisible: true);

    // Set tracking mode to compass
    _trackWithCompass();
  }

  /// Navigation bottom sheet
  ///
  /// This method returns the bottom sheet with navigation controls.
  Widget _navigationBottomSheet(String name, String address) {
    return Container(
      height: 180,
      decoration: const BoxDecoration(
        borderRadius: BorderRadius.only(
          topLeft: Radius.circular(20),
          topRight: Radius.circular(20),
        ),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          SizedBox(
            width: double.infinity,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: <Widget>[
                Expanded(
                  flex: 2,
                  child: _navigationBottomSheetInfo(name, address),
                ),
                _navigationBottomSheetCloseButton(),
              ],
            ),
          ),
          const Spacer(),
          _navigationBottomSheetNavigationControls(),
        ],
      ),
    );
  }

  /// Navigation bottom sheet close button
  ///
  /// This method returns the close button for the navigation bottom sheet.
  Widget _navigationBottomSheetCloseButton() {
    return Padding(
      padding: const EdgeInsets.all(8.0),
      child: Container(
        decoration: BoxDecoration(
          border: Border.all(
            color: Theme.of(context).colorScheme.secondary,
            width: 1,
          ),
          shape: BoxShape.circle,
        ),
        child: IconButton(
          icon: const Icon(Icons.close),
          onPressed: () {
            // Move map ornaments back down
            _moveMapOrnaments();

            // Close bottom sheet
            Navigator.of(context).pop();

            // Delete route
            if (_polylineAnnotation != null) {
              _polylineAnnotationManager?.delete(_polylineAnnotation!);
            }

            // Delete marker
            if (_pointAnnotation != null) {
              _pointAnnotationManager?.delete(_pointAnnotation!);
            }

            // Clear search text
            _searchTextEditingController.clear();
          },
        ),
      ),
    );
  }

  /// Navigation bottom sheet info
  ///
  /// This method returns the info for the navigation bottom sheet.
  Widget _navigationBottomSheetInfo(String name, String address) {
    return Padding(
      padding: const EdgeInsets.only(top: 16.0),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20.0),
            child: Text(
              style: Theme.of(context).textTheme.titleLarge,
              overflow: TextOverflow.ellipsis,
              softWrap: true,
              maxLines: 2,
              'Verso $name',
            ),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20.0),
            child: Text(
              style: Theme.of(context).textTheme.titleSmall,
              overflow: TextOverflow.ellipsis,
              softWrap: true,
              maxLines: 2,
              address,
            ),
          ),
        ],
      ),
    );
  }

  /// Navigation bottom sheet navigation controls
  ///
  /// This method returns the navigation controls for the navigation bottom sheet.
  Widget _navigationBottomSheetNavigationControls() {
    return Padding(
      padding: const EdgeInsets.all(8.0),
      child: Row(
        children: <Widget>[
          FilledButton.icon(
            onPressed: _onNavigationBottomSheetNavigationControlsArrivedPressed,
            icon: const Icon(Icons.flag),
            label: const Text('Arrivato'),
          ),
          Padding(
            padding: const EdgeInsets.only(left: 8.0),
            child: FilledButton.icon(
              onPressed: () => _trackWithCompass(),
              icon: const Icon(Icons.gps_fixed),
              label: const Text('Centra'),
            ),
          ),
        ],
      ),
    );
  }

  /// Navigation bottom sheet navigation controls arrived button tap callback
  ///
  /// This method is called when the arrived button is tapped.
  void _onNavigationBottomSheetNavigationControlsArrivedPressed() {
    // Move map ornaments back down
    _moveMapOrnaments();

    // Delete route
    if (_polylineAnnotation != null) {
      _polylineAnnotationManager?.delete(_polylineAnnotation!);
    }

    // Delete marker
    if (_pointAnnotation != null) {
      _pointAnnotationManager?.delete(_pointAnnotation!);
    }

    // Move camera to user position
    _trackWithPosition();

    // Close bottom sheet
    Navigator.of(context).pop();

    // Clear search text
    _searchTextEditingController.clear();
  }

  /// Search widget builder
  ///
  /// This method returns the search widget.
  Widget _searchWidgetBuilder(BuildContext context, SearchController controller) {
    return SearchBar(
      controller: _searchTextEditingController,
      leading: const Icon(Icons.search),
      hintText: 'Dove andiamo oggi?',
      onTap: () {
        _searchController.openView();
      },
    );
  }

  /// Search widget suggestions builder
  ///
  /// This method returns the search widget suggestions.
  FutureOr<Iterable<Widget>> _searchWidgetSuggestionsBuilder(BuildContext context, SearchController controller) async {
    final keyword = controller.value.text;

    // Empty search query
    if (keyword.isEmpty) {
      return <Widget>[
        ListTile(
          title: const Text('Stazione di Trento'),
          subtitle: const Text('via Dogana, 3, 38122 Trento, TN'),
          leading: Container(
            decoration: BoxDecoration(
              color: Theme.of(context).colorScheme.secondaryContainer,
              borderRadius: const BorderRadius.all(Radius.circular(25)),
            ),
            child: const Padding(
              padding: EdgeInsets.all(8.0),
              child: Icon(
                Icons.location_on,
              ),
            ),
          ),
          iconColor: Theme.of(context).colorScheme.secondary,
          onTap: () {
            _onSearchSuggestionSelected(
                'Stazione di Trento', 'via Dogana, 3, 38122 Trento, TN', 'dXJuOm1ieHBvaTo1ZWNhNzBhMy1kNTg2LTQ3YzItOTg1ZC1lMGU4NTM5ZjAxMmU');
            controller.closeView(null);
            FocusScope.of(context).unfocus();
          },
        ),
        ListTile(
          title: const Text('Polo Scientifico e Tecnologico Fabio Ferrari'),
          subtitle: const Text('via Sommarive, 18, 38123 Povo, TN'),
          leading: Container(
            decoration: BoxDecoration(
              color: Theme.of(context).colorScheme.secondaryContainer,
              borderRadius: const BorderRadius.all(Radius.circular(25)),
            ),
            child: const Padding(
              padding: EdgeInsets.all(8.0),
              child: Icon(
                Icons.location_on,
              ),
            ),
          ),
          iconColor: Theme.of(context).colorScheme.secondary,
          onTap: () {
            _onSearchSuggestionSelected('Polo Scientifico e Tecnologico Fabio Ferrari', 'via Sommarive, 18, 38123 Povo, TN',
                'dXJuOm1ieHBvaTozYTViNWUzNC1hMWVmLTQ1OWEtYTliZS03MzM3NzgwNmUwZDY');
            controller.closeView(null);
            FocusScope.of(context).unfocus();
          },
        ),
      ];
    }

    return await _searchBoxAPI.getSuggestions(keyword, proximity: Proximity.LocationIp()).then((result) {
      // Search API returned error
      if (result.failure is FailureResponse) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text('${result.failure?.error}: ${result.failure?.message ?? 'Search failed'}'),
          backgroundColor: Theme.of(context).colorScheme.error,
          duration: const Duration(seconds: 2),
        ));
        return <Widget>[];
      }

      // Style suggestions as ListTile
      return result.success!.suggestions
          .map((suggestion) {
            return ListTile(
                title: Text(suggestion.namePreferred ?? suggestion.name),
                subtitle: Text(suggestion.fullAddress ?? suggestion.address ?? ''),
                leading: Container(
                  decoration: BoxDecoration(
                    color: Theme.of(context).colorScheme.secondaryContainer,
                    borderRadius: const BorderRadius.all(Radius.circular(25)),
                  ),
                  child: const Padding(
                    padding: EdgeInsets.all(8.0),
                    child: Icon(
                      Icons.location_on,
                    ),
                  ),
                ),
                iconColor: Theme.of(context).colorScheme.secondary,
                onTap: () {
                  _onSearchSuggestionSelected(
                      suggestion.namePreferred ?? suggestion.name, suggestion.fullAddress ?? suggestion.address ?? '', suggestion.mapboxId);
                  controller.closeView(null);
                  FocusScope.of(context).unfocus();
                });
          })
          .where((suggestionTile) {
            Text subtitle = (suggestionTile.subtitle as Text);
            return subtitle.data!.isNotEmpty;
          })
          .cast<ListTile>()
          .toList();
    });
  }

  /// Account button
  ///
  /// This method returns the account button.
  Widget _accountButton() {
    final userProvider = Provider.of<UserProvider>(context);
    final user = userProvider.user;

    return ElevatedButton(
        style: ButtonStyle(
          shape: MaterialStateProperty.all(
            RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(18.0),
            ),
          ),
          padding: MaterialStateProperty.all(const EdgeInsets.all(18.0)),
          backgroundColor: MaterialStateProperty.all(Theme.of(context).colorScheme.primary),
          iconColor: MaterialStateProperty.all(Theme.of(context).colorScheme.onPrimary),
        ),
        child: Icon(_isUserLogged ? Icons.account_circle : Icons.person_off),
        onPressed: () async {
          if (user != null) {
            // TODO: Navigate to account info page instead of logging out
            // Navigator.push(
            //   context,
            //   MaterialPageRoute<void>(
            //     builder: (BuildContext context) => const AccountInfoPage(),
            //   ),
            // );
            SharedPreferences prefs = await SharedPreferences.getInstance();
            prefs.remove('userId');
            prefs.remove('userToken');
            Provider.of<UserProvider>(context, listen: false).clearUser();
          } else {
            Navigator.push(
              context,
              MaterialPageRoute<void>(
                builder: (BuildContext context) => const AccountPage(),
              ),
            );
          }
        });
  }

  /// Tracking button
  ///
  /// This method returns the tracking button.
  Widget _trackingButton() {
    return ElevatedButton(
      style: ButtonStyle(
        shape: MaterialStateProperty.all(
          const CircleBorder(),
        ),
        padding: MaterialStateProperty.all(const EdgeInsets.all(18.0)),
      ),
      child: Icon(
        _trackingMode == TrackingMode.none ? Icons.location_searching : (_trackingMode == TrackingMode.gps ? Icons.gps_fixed : Icons.explore),
      ),
      onPressed: () {
        switch (_trackingMode) {
          case TrackingMode.none:
            _trackWithPosition();
            break;
          case TrackingMode.gps:
            _trackWithCompass();
            break;
          case TrackingMode.compass:
            _trackWithPosition();
            break;
        }
      },
    );
  }

  /// Points button
  ///
  /// This method returns the points button.
  Widget _pointsButton() {
    final provider = Provider.of<UserProvider>(context);

    return visibility.Visibility(
      visible: _isUserLogged,
      child: ElevatedButton.icon(
        style: ButtonStyle(
          shape: MaterialStateProperty.all(
            RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(18.0),
            ),
          ),
          padding: MaterialStateProperty.all(const EdgeInsets.all(18.0)),
          backgroundColor: MaterialStateProperty.all(Theme.of(context).colorScheme.primary),
          iconColor: MaterialStateProperty.all(Theme.of(context).colorScheme.onPrimary),
          foregroundColor: MaterialStateProperty.all(Theme.of(context).colorScheme.onPrimary),
        ),
        icon: const Icon(Symbols.local_activity),
        label: Text(provider.isUserSet() ? provider.getUserPoints().toString() : ""),
        onPressed: () {},
      ),
    );
  }

  /// Issue button
  ///
  /// This method returns the issue button.
  Widget _issueButton() {
    return visibility.Visibility(
      visible: _isUserLogged,
      child: ElevatedButton(
          style: ButtonStyle(
            shape: MaterialStateProperty.all(
              RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(18.0),
              ),
            ),
            padding: MaterialStateProperty.all(const EdgeInsets.all(18.0)),
            backgroundColor: MaterialStateProperty.all(Theme.of(context).colorScheme.primary),
            iconColor: MaterialStateProperty.all(Theme.of(context).colorScheme.onPrimary),
          ),
          child: const Icon(Icons.report),
          onPressed: () => Navigator.push(
                context,
                MaterialPageRoute<void>(
                  builder: (BuildContext context) => NewReportPage(update: _updatePointsLabel),
                ),
              )),
    );
  }

  /// step count stream callback
  ///
  /// This method listens to the step count stream and updates the user points.
  void _onStepCount(StepCount event) async {
    debugPrint('Step count: ${event.steps}');
    final provider = Provider.of<UserProvider>(context, listen: false);

    // SharedPreferences prefs = await SharedPreferences.getInstance();

    // Bail if user is not logged
    if (!provider.isUserSet() || provider.getUserTokenExpired()) {
      return;
    }

    if (_firstStepUpdate) {
      _firstStepUpdate = false;
      return;
    }

    // Calculate new points and save
    int newPoints = (event.steps / 2000).floor();
    provider.setUserPoints(newPoints);
  }

  /// Init state
  @override
  void initState() {
    super.initState();

    _isUserLogged = widget.startAsLogged;

    // Connect to the pedometer
    _stepCountStream = Pedometer.stepCountStream;
    _stepCountStream.listen(_onStepCount);
  }

  @override
  void didChangeDependencies() {
    UserProvider provider = Provider.of<UserProvider>(context);
    provider.addListener(() {
      setState(() => _isUserLogged = provider.user != null);
    });
    super.didChangeDependencies();
  }

  /// Build
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      key: _scaffoldKey,
      body: Center(
        child: Stack(
          children: <Widget>[
            MapWidget(
              onMapCreated: _onMapCreated,
              styleUri: MapboxStyles.MAPBOX_STREETS,
              textureView: true,
              cameraOptions: _initialPosition,
              onScrollListener: _onMapScroll,
            ),
            SafeArea(
              child: Column(
                children: <Widget>[
                  Padding(
                    padding: const EdgeInsets.all(10.0),
                    child: SearchAnchor(
                      searchController: _searchController,
                      viewHintText: 'Dove andiamo oggi?',
                      isFullScreen: true,
                      builder: _searchWidgetBuilder,
                      suggestionsBuilder: _searchWidgetSuggestionsBuilder,
                    ),
                  ),
                  const Spacer(),
                  Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      children: <Widget>[
                        Padding(
                          padding: const EdgeInsets.only(bottom: 8.0),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: <Widget>[
                              _accountButton(),
                              _trackingButton(),
                            ],
                          ),
                        ),
                        Padding(
                          padding: const EdgeInsets.only(bottom: 8.0),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: <Widget>[
                              _pointsButton(),
                              _issueButton(),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
