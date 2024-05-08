// ignore_for_file: implementation_imports, depend_on_referenced_packages

import 'dart:async';
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:image_picker/image_picker.dart';
import 'package:mapbox_maps_flutter/mapbox_maps_flutter.dart';
import 'package:mapbox_search/mapbox_search.dart';
import 'package:image_picker_platform_interface/src/types/image_source.dart' as image_source;

enum TrackingMode { none, gps, compass }

class NewReportPage extends StatefulWidget {
  const NewReportPage({super.key});

  @override
  State<NewReportPage> createState() => _NewReportPageState();
}

class _NewReportPageState extends State<NewReportPage> {
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();
  final GlobalKey<FormState> _formKey = GlobalKey<FormState>();

  MapboxMap? _mapboxMap;
  Timer? _timer; // ignore: unused_field
  Position _position = Position(0, 0);
  late double _bearing; // ignore: unused_field
  TrackingMode _trackingMode = TrackingMode.gps; // ignore: unused_field
  PointAnnotation? _pointAnnotation;
  PointAnnotationManager? _pointAnnotationManager;

  final CameraOptions _initialPosition = CameraOptions(
    center: Point(
      coordinates: Position(
        11.125916,
        46.068460,
      ),
    ),
    zoom: 12.0,
  );

  final GeoCoding _reverseGeoCoding = GeoCoding(limit: 5, country: 'IT', language: 'it');
  bool _placeSelectBottomSheetDoneButtonEnabled = false;
  String _placeSelectBottomSheetAddress = '';
  late StateSetter _bottomSheetBottomSheetSetState;
  Point _placeSelectBottomSheetCoordinates = Point(coordinates: Position(0, 0));

  final TextEditingController _placeFieldController = TextEditingController();
  final TextEditingController _imageFieldController = TextEditingController();

  final ImagePicker _imagePicker = ImagePicker();

  /// Callback for when the map is created
  ///
  /// This method is called when the map is created. It enables the location
  /// component and moves the camera to the user's location.
  void _onMapCreated(MapboxMap mapboxMap) async {
    _mapboxMap = mapboxMap;

    // Enable location component
    mapboxMap.location.updateSettings(LocationComponentSettings(
      enabled: true,
      puckBearingEnabled: true,
    ));

    // Disable scale bar
    _mapboxMap?.scaleBar.updateSettings(ScaleBarSettings(
      enabled: false,
    ));

    // Move camera to user location
    _timer = Timer.periodic(const Duration(seconds: 1), (Timer t) => _updateUserPositionAndBearing());

    // Create point annotation manager
    mapboxMap.annotations.createPointAnnotationManager().then((value) async {
      _pointAnnotationManager = value;
    });
  }

  /// Update user position and bearing
  ///
  /// This method updates the user's position and bearing on the map. Also takes care of permissions and location services.
  Future<void> _updateUserPositionAndBearing() async {
    // Get user position
    await _getUserPositionAndBearing().then((userLocation) {
      var (position, bearing) = userLocation;
      _bearing = bearing;
      _position = position;
    });

    // Move camera to user position
    _updateCamera();
  }

  /// Get user position and bearing
  ///
  /// This method gets the user's position and bearing from the location indicator layer.
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
  void _updateCamera() async {
    _mapboxMap?.flyTo(
        CameraOptions(
          center: Point(coordinates: _position),
          zoom: 17.0,
        ),
        MapAnimationOptions(duration: 1000));

    // Disable further position updates
    _trackingMode = TrackingMode.none;
    _timer!.cancel();

    // Add new marker
    final ByteData bytes = await rootBundle.load('assets/marker.png');
    final Uint8List list = bytes.buffer.asUint8List();
    _pointAnnotationManager
        ?.create(PointAnnotationOptions(
          geometry: Point(coordinates: _position),
          iconSize: 0.2,
          iconOffset: [0, 0],
          symbolSortKey: 10,
          image: list,
        ))
        .then((value) => _pointAnnotation = value);

    // Map coordinates to address
    final ApiResponse<List<MapBoxPlace>> address = await _reverseGeoCoding.getAddress((lat: _position.lat as double, long: _position.lng as double));
    address.fold((success) {
      String addressString = '';
      addressString += success.first.text ?? '';
      addressString += success.first.addressNumber != null ? ', ${success.first.addressNumber}' : '';

      _bottomSheetBottomSheetSetState(() {
        _placeSelectBottomSheetAddress = '${success.first.text}, ${success.first.addressNumber}'.isEmpty
            ? 'Indirizzo non trovato, per favore seleziona un altro punto sulla mappa.'
            : addressString;
        _placeSelectBottomSheetDoneButtonEnabled =
            _placeSelectBottomSheetAddress == 'Indirizzo non trovato, per favore seleziona un altro punto sulla mappa.' ? false : true;
      });
    }, (failure) {
      _bottomSheetBottomSheetSetState(() {
        _placeSelectBottomSheetDoneButtonEnabled = false;
        _placeSelectBottomSheetAddress = 'Indirizzo non trovato, per favore seleziona un altro punto sulla mappa.';
      });
    });
  }

  /// Place select bottom sheet
  ///
  /// This method returns the bottom sheet for selecting a place on the map.
  Widget _placeSelectBottomSheetBuilder(BuildContext context, StateSetter setState) {
    _bottomSheetBottomSheetSetState = setState;
    return Container(
      height: 550,
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
                  child: Padding(
                    padding: const EdgeInsets.only(left: 10.0, top: 10.0),
                    child: Text(
                      style: Theme.of(context).textTheme.titleLarge,
                      'Tocca un punto sulla mappa per selezionare il luogo',
                    ),
                  ),
                ),
                _placeSelectBottomSheetCloseButton(),
              ],
            ),
          ),
          Expanded(
            child: ClipRRect(
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(20),
                topRight: Radius.circular(20),
              ),
              child: Stack(
                children: <Widget>[
                  MapWidget(
                    onMapCreated: _onMapCreated,
                    styleUri: MapboxStyles.MAPBOX_STREETS,
                    textureView: true,
                    cameraOptions: _initialPosition,
                    onTapListener: _onMapTap,
                  ),
                  _placeSelectBottomSheetAddressConfirmCard(setState),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  /// Place select bottom sheet close button
  ///
  /// This method returns the close button for the bottom sheet.
  Widget _placeSelectBottomSheetCloseButton() {
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
            Navigator.of(context).pop();
            _timer!.cancel();
          },
        ),
      ),
    );
  }

  /// Place select bottom sheet address confirm card
  ///
  /// This method returns the card for confirming the selected address.
  Widget _placeSelectBottomSheetAddressConfirmCard(StateSetter setState) {
    return Align(
      alignment: Alignment.bottomCenter,
      child: Padding(
        padding: const EdgeInsets.only(left: 8.0, right: 8.0, bottom: 20.0),
        child: Card(
          color: Theme.of(context).colorScheme.secondaryContainer,
          margin: const EdgeInsets.all(8.0),
          child: ListTile(
            title: Text(
              style: Theme.of(context).textTheme.titleMedium,
              _placeSelectBottomSheetAddress,
            ),
            trailing: ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: Theme.of(context).colorScheme.primary,
                foregroundColor: Theme.of(context).colorScheme.onPrimary,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12.0),
                ),
              ),
              onPressed: _placeSelectBottomSheetDoneButtonEnabled
                  ? () {
                      Navigator.of(context).pop();
                      _placeFieldController.text = _placeSelectBottomSheetAddress;
                      _placeSelectBottomSheetCoordinates = Point(coordinates: _position);
                    }
                  : null,
              child: const Icon(Icons.done),
            ),
          ),
        ),
      ),
    );
  }

  /// Map tap callback
  ///
  /// This method is called when the map is tapped. It adds a marker to the map.
  void _onMapTap(MapContentGestureContext context) async {
    // Remove previous marker
    if (_pointAnnotation != null) {
      _pointAnnotationManager?.delete(_pointAnnotation!);
    }

    // Add new marker
    final ByteData bytes = await rootBundle.load('assets/marker.png');
    final Uint8List list = bytes.buffer.asUint8List();
    _pointAnnotationManager
        ?.create(PointAnnotationOptions(
          geometry: context.point,
          iconSize: 0.2,
          iconOffset: [0, 0],
          symbolSortKey: 10,
          image: list,
        ))
        .then((value) => _pointAnnotation = value);

    // Map coordinates to address
    final ApiResponse<List<MapBoxPlace>> address =
        await _reverseGeoCoding.getAddress((lat: context.point.coordinates.lat as double, long: context.point.coordinates.lng as double));
    address.fold((success) {
      String addressString = '';

      if (success.isNotEmpty) {
        addressString += success.first.text ?? '';
        addressString += success.first.addressNumber != null ? ', ${success.first.addressNumber}' : '';
      }

      _bottomSheetBottomSheetSetState(() {
        _placeSelectBottomSheetAddress =
            addressString.isEmpty ? 'Indirizzo non trovato, per favore seleziona un altro punto sulla mappa.' : addressString;
        _placeSelectBottomSheetDoneButtonEnabled =
            _placeSelectBottomSheetAddress == 'Indirizzo non trovato, per favore seleziona un altro punto sulla mappa.' ? false : true;
      });
    }, (failure) {
      _bottomSheetBottomSheetSetState(() {
        _placeSelectBottomSheetDoneButtonEnabled = false;
        _placeSelectBottomSheetAddress = 'Indirizzo non trovato, per favore seleziona un altro punto sulla mappa.';
      });
    });
  }

  Widget _imageSelectionBottomSheet() {
    return Container(
      height: 150,
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
                  child: Padding(
                    padding: const EdgeInsets.only(left: 10.0, top: 10.0),
                    child: Text(
                      style: Theme.of(context).textTheme.titleLarge,
                      'Come?',
                    ),
                  ),
                ),
                Padding(
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
                      onPressed: () => Navigator.of(context).pop(),
                    ),
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            child: ClipRRect(
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(20),
                topRight: Radius.circular(20),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: <Widget>[
                  ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Theme.of(context).colorScheme.primary,
                      foregroundColor: Theme.of(context).colorScheme.onPrimary,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12.0),
                      ),
                    ),
                    onPressed: _onImageSelectionCameraButtonPressed,
                    icon: const Icon(Icons.camera_alt),
                    label: const Text('Scatta una foto'),
                  ),
                  // const Spacer(),
                  ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Theme.of(context).colorScheme.primary,
                      foregroundColor: Theme.of(context).colorScheme.onPrimary,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12.0),
                      ),
                    ),
                    onPressed: _onImageSelectionGalleryButtonPressed,
                    icon: const Icon(Icons.camera_alt),
                    label: const Text('Seleziona una foto'),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  /// Image selection camera button pressed
  ///
  /// This method is called when the camera button is pressed. It opens the camera for taking a photo.
  void _onImageSelectionCameraButtonPressed() async {
    Navigator.of(context).pop();
    final XFile? image = await _imagePicker.pickImage(source: image_source.ImageSource.camera);
    if (image != null) {
      setState(() {
        _imageFieldController.text = 'Foto aggiunta';
      });
    }
  }

  /// Image selection gallery button pressed
  ///
  /// This method is called when the gallery button is pressed. It opens the gallery for selecting a photo.
  void _onImageSelectionGalleryButtonPressed() async {
    Navigator.of(context).pop();
    final XFile? image = await _imagePicker.pickImage(source: image_source.ImageSource.gallery);
    if (image != null) {
      setState(() {
        _imageFieldController.text = 'Foto aggiunta';
      });
    }
  }

  /// Send button pressed
  ///
  /// This method is called when the send button is pressed. It sends the report to the server.
  void _onSendButtonPressed() {
    if (_formKey.currentState!.validate()) {
      // TODO: implement report sending
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          backgroundColor: Theme.of(context).colorScheme.primary,
          content: const Text('Segnalazione inviata, +1 punto!'),
        ),
      );
    }
  }

  /// Build
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      key: _scaffoldKey,
      backgroundColor: Theme.of(context).colorScheme.secondaryContainer,
      appBar: AppBar(
        backgroundColor: Theme.of(context).colorScheme.secondaryContainer,
        title: Text(
          'Nuova segnalazione',
          style: Theme.of(context).textTheme.titleLarge!.copyWith(
                fontSize: 24.0,
                color: Theme.of(context).colorScheme.onSecondaryContainer,
              ),
        ),
      ),
      body: Center(
        child: SingleChildScrollView(
          child: Form(
            key: _formKey,
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Padding(
                  padding: const EdgeInsets.only(left: 16.0, right: 16.0, top: 10.0),
                  child: Text(
                    style: Theme.of(context).textTheme.titleMedium,
                    textAlign: TextAlign.center,
                    // maxLines: 2,
                    softWrap: true,
                    'Rispondendo alle semplici domande qua sotto aiuterai il Comune di Trento a mantenere la città pulita e sicura.',
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.only(left: 16.0, right: 16, top: 16),
                  child: Text(
                    style: Theme.of(context).textTheme.titleLarge,
                    textAlign: TextAlign.left,
                    'Dove si trova il problema?',
                  ),
                ),
                ListTile(
                  title: TextFormField(
                    controller: _placeFieldController,
                    decoration: const InputDecoration(
                      labelText: 'Indirizzo',
                      suffixIcon: Icon(Icons.map),
                    ),
                    readOnly: true,
                    onTap: () => showModalBottomSheet(
                      context: context,
                      builder: (context) => StatefulBuilder(builder: _placeSelectBottomSheetBuilder),
                    ),
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Apri la mappa e seleziona un punto';
                      }
                      return null;
                    },
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.only(left: 16.0, right: 16, top: 16),
                  child: Text(
                    style: Theme.of(context).textTheme.titleLarge,
                    textAlign: TextAlign.left,
                    'Che tipo di problema?',
                  ),
                ),
                ListTile(
                  title: DropdownButtonFormField<String>(
                    decoration: const InputDecoration(
                      labelText: 'Tipo',
                    ),
                    items: <(String, IconData, String)>[
                      ('Rifiuti', Icons.recycling, 'rifiuti'),
                      ('Sicurezza', Icons.local_police, 'sicurezza'),
                      ('Parcheggi', Icons.local_parking, 'parcheggi'),
                      ('Viabilità', Icons.directions_car, 'viabilità'),
                      ('Illuminazione Pubblica', Icons.lightbulb, 'illuminazione'),
                      ('Segnaletica Stradale', Icons.signpost, 'segnaletica'),
                      ('Barriere Architettoniche', Icons.accessible, 'barriere'),
                      ('Altro', Icons.help, 'altro'),
                    ].map((option) {
                      return DropdownMenuItem<String>(
                        value: option.$3,
                        child: Row(
                          children: <Widget>[
                            Icon(option.$2),
                            Padding(
                              padding: const EdgeInsets.only(left: 8.0),
                              child: Text(option.$1),
                            ),
                          ],
                        ),
                      );
                    }).toList(),
                    onChanged: (String? value) {},
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Seleziona un tipo';
                      }
                      return null;
                    },
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.only(left: 16.0, right: 16, top: 16),
                  child: Text(
                    style: Theme.of(context).textTheme.titleLarge,
                    textAlign: TextAlign.left,
                    'Quanto pensi sia importante?',
                  ),
                ),
                ListTile(
                  title: DropdownButtonFormField<String>(
                    decoration: const InputDecoration(
                      labelText: 'Importanza',
                    ),
                    items: <(String, MaterialColor, String)>[
                      ('Basso', Colors.green, 'basso'),
                      ('Medio-Basso', Colors.lime, 'medio-bassa'),
                      ('Medio-Alto', Colors.amber, 'medio-alta'),
                      ('Alto', Colors.red, 'alta'),
                    ].map((option) {
                      return DropdownMenuItem<String>(
                        value: option.$3,
                        child: Text(
                          option.$1,
                          style: TextStyle(color: option.$2.shade700),
                        ),
                      );
                    }).toList(),
                    onChanged: (String? value) {},
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Seleziona un livello di urgenza';
                      }
                      return null;
                    
                    },
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.only(left: 16.0, right: 16, top: 16),
                  child: Text(
                    style: Theme.of(context).textTheme.titleLarge,
                    textAlign: TextAlign.left,
                    'Una foto ci aiuterebbe molto...',
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: Text(
                    style: Theme.of(context).textTheme.titleSmall,
                    textAlign: TextAlign.left,
                    'Opzionale',
                  ),
                ),
                ListTile(
                  title: TextFormField(
                    controller: _imageFieldController,
                    decoration: InputDecoration(
                      labelText: 'Immagine',
                      suffixIcon: const Icon(Icons.image_outlined),
                      prefix: _imageFieldController.text.isEmpty
                          ? null
                          : IconButton(
                              onPressed: () {
                                setState(() => _imageFieldController.clear());
                              },
                              icon: const Icon(Icons.delete),
                            ),
                    ),
                    readOnly: true,
                    onTap: () => showModalBottomSheet(
                      context: context,
                      builder: (context) => _imageSelectionBottomSheet(),
                    ),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.only(top: 16),
                  child: Align(
                    alignment: Alignment.center,
                    child: ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Theme.of(context).colorScheme.primary,
                        foregroundColor: Theme.of(context).colorScheme.onPrimary,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12.0),
                        ),
                      ),
                      onPressed: _onSendButtonPressed,
                      label: const Text('Invia'),
                      icon: const Icon(Icons.send),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}