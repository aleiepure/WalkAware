import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:mapbox_search/mapbox_search.dart';
import '../widgets/map_photo_view.dart';
import '../models/segnalazione_model.dart';

class SegnalazioneDetailsPage extends StatefulWidget {
  final SegnalazioneModel segnalazione;

  static final _reverseGeoCoding = GeoCoding(limit: 5);

  const SegnalazioneDetailsPage(this.segnalazione, {super.key});

  @override
  State<SegnalazioneDetailsPage> createState() => _SegnalazioneDetailsPageState();
}

class _SegnalazioneDetailsPageState extends State<SegnalazioneDetailsPage> {
  IconData _iconFromType(SegnalazioneType type) {
    switch (type) {
      case SegnalazioneType.viabilita:
        return Icons.directions_car;
      case SegnalazioneType.illuminazione:
        return Icons.lightbulb;
      case SegnalazioneType.segnaletica:
        return Icons.signpost;
      case SegnalazioneType.sicurezza:
        return Icons.local_police;
      case SegnalazioneType.barriereArchitettoniche:
        return Icons.accessible;
      case SegnalazioneType.rifiuti:
        return Icons.recycling;
      case SegnalazioneType.parcheggi:
        return Icons.local_parking;
      case SegnalazioneType.altro:
        return Icons.help;
    }
  }

  MaterialColor _colorFromUrgency(SegnalazioneUrgency urgency) {
    switch (urgency) {
      case SegnalazioneUrgency.bassa:
        return Colors.green;
      case SegnalazioneUrgency.medioBassa:
        return Colors.lime;
      case SegnalazioneUrgency.medioAlta:
        return Colors.amber;
      case SegnalazioneUrgency.alta:
        return Colors.red;
    }
  }

  MaterialColor _colorFromStatus(SegnalazioneStatus status) {
    switch (status) {
      case SegnalazioneStatus.conclusa:
        return Colors.green;
      case SegnalazioneStatus.presaInCarico:
        return Colors.amber;
      case SegnalazioneStatus.aperta:
        return Colors.red;
    }
  }

  Future<String> _addressFromCoordinates(String latlon) async {
    // Convert lat,lon formatted string
    final lat = double.parse(latlon.split(',')[0]);
    final lon = double.parse(latlon.split(',')[1]);

    // Get address from coordinates
    String addressString = '';
    final ApiResponse<List<MapBoxPlace>> address = await SegnalazioneDetailsPage._reverseGeoCoding.getAddress((lat: lat, long: lon));
    address.fold((success) {
      if (success.isNotEmpty) {
        addressString += success.first.text ?? '';
        addressString += success.first.addressNumber != null ? ', ${success.first.addressNumber}' : '';
      }

      return addressString;
    }, (failure) {
      return latlon;
    });
    return addressString;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Theme.of(context).colorScheme.secondaryContainer,
      appBar: AppBar(
        backgroundColor: Theme.of(context).colorScheme.secondaryContainer,
        title: Text(
          'Dettagli segnalazione',
          style: Theme.of(context).textTheme.titleLarge!.copyWith(
                fontSize: 24.0,
                color: Theme.of(context).colorScheme.onSecondaryContainer,
              ),
        ),
      ),
      body: Column(
        mainAxisAlignment: MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          MapPhotoView(latlon: widget.segnalazione.place, photoUrl: widget.segnalazione.photoKey),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                decoration: BoxDecoration(
                  color: Theme.of(context).colorScheme.primaryContainer,
                  borderRadius: const BorderRadius.all(Radius.circular(50)),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: Icon(
                    _iconFromType(widget.segnalazione.type),
                    size: 32.0,
                  ),
                ),
              ),
              Column(
                children: [
                  Padding(
                    padding: const EdgeInsets.fromLTRB(8.0, 8.0, 8.0, 0),
                    child: FutureBuilder(
                      future: _addressFromCoordinates(widget.segnalazione.place),
                      builder: (context, snapshot) {
                        if (snapshot.connectionState == ConnectionState.waiting) {
                          return const LinearProgressIndicator();
                        }
                        return Text(
                          snapshot.data as String,
                          style: Theme.of(context).textTheme.titleLarge!.copyWith(
                                fontSize: 24.0,
                                color: Theme.of(context).colorScheme.onSecondaryContainer,
                              ),
                        );
                      },
                    ),
                  ),
                  Text(
                    widget.segnalazione.typeString,
                    style: Theme.of(context).textTheme.bodyMedium!.copyWith(
                          fontSize: 20.0,
                          color: Theme.of(context).colorScheme.onSecondaryContainer,
                        ),
                  ),
                ],
              ),
            ],
          ),
          Padding(
            padding: const EdgeInsets.all(8.0),
            child: Row(
              children: [
                Text(
                  'Urgenza: ',
                  style: Theme.of(context).textTheme.titleMedium!.copyWith(
                        fontWeight: FontWeight.w400,
                      ),
                ),
                Text(
                  widget.segnalazione.urgencyString,
                  style: Theme.of(context).textTheme.titleMedium!.copyWith(
                        fontWeight: FontWeight.w400,
                        color: _colorFromUrgency(widget.segnalazione.urgency).shade700,
                      ),
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(8.0, 0, 8.0, 8.0),
            child: Row(
              children: [
                Text(
                  'Status: ',
                  style: Theme.of(context).textTheme.titleMedium!.copyWith(
                        fontWeight: FontWeight.w400,
                      ),
                ),
                Text(
                  widget.segnalazione.statusString,
                  style: Theme.of(context).textTheme.titleMedium!.copyWith(
                        fontWeight: FontWeight.bold,
                        color: _colorFromStatus(widget.segnalazione.status).shade700,
                      ),
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(8.0, 0, 8.0, 8.0),
            child: Row(
              children: [
                Text(
                  'Inviata il: ',
                  style: Theme.of(context).textTheme.titleMedium!.copyWith(
                        fontWeight: FontWeight.w400,
                      ),
                ),
                Text(
                  DateFormat('dd/MM/yyyy').format(widget.segnalazione.creationDate),
                  style: Theme.of(context).textTheme.titleMedium!.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                ),
              ],
            ),
          ),
          const Spacer(),
          Center(
            child: Text(widget.segnalazione.id),
          )
        ],
      ),
    );
  }
}
