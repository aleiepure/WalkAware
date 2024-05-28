import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:mapbox_search/mapbox_search.dart';
import '../models/segnalazione_model.dart';
import '../pages/segnalazione_details_page.dart';

class SegnalazioneTile extends StatelessWidget {
  final SegnalazioneModel segnalazione;

  static final _reverseGeoCoding = GeoCoding(limit: 5);

  const SegnalazioneTile(this.segnalazione, {super.key});

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
    final ApiResponse<List<MapBoxPlace>> address = await _reverseGeoCoding.getAddress((lat: lat, long: lon));
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
    return Card(
      child: InkWell(
        onTap: () => Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => SegnalazioneDetailsPage(segnalazione),
          ),
        ),
        child: ListTile(
          leading: Container(
            decoration: BoxDecoration(
              color: Theme.of(context).colorScheme.secondaryContainer,
              borderRadius: const BorderRadius.all(Radius.circular(25)),
            ),
            child: Padding(
              padding: const EdgeInsets.all(8.0),
              child: Icon(
                _iconFromType(segnalazione.type),
              ),
            ),
          ),
          title: FutureBuilder(
            future: _addressFromCoordinates(segnalazione.place),
            builder: (context, snapshot) {
              if (snapshot.connectionState == ConnectionState.waiting) {
                return const LinearProgressIndicator();
              }
              return Text(
                snapshot.data as String,
                style: Theme.of(context).textTheme.titleLarge!.copyWith(
                      fontWeight: FontWeight.w400,
                    ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              );
            },
          ),
          subtitle: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                segnalazione.typeString,
                style: Theme.of(context).textTheme.titleMedium!.copyWith(
                      fontWeight: FontWeight.w400,
                    ),
              ),
              Row(
                children: [
                  Text(
                    'Urgenza: ',
                    style: Theme.of(context).textTheme.titleMedium!.copyWith(
                          fontWeight: FontWeight.w400,
                        ),
                  ),
                  Text(
                    segnalazione.urgencyString,
                    style: Theme.of(context).textTheme.titleMedium!.copyWith(
                          fontWeight: FontWeight.w400,
                          color: _colorFromUrgency(segnalazione.urgency).shade700,
                        ),
                  ),
                ],
              ),
              Row(
                children: [
                  Text(
                    'Status: ',
                    style: Theme.of(context).textTheme.titleMedium!.copyWith(
                          fontWeight: FontWeight.w400,
                        ),
                  ),
                  Text(
                    segnalazione.statusString,
                    style: Theme.of(context).textTheme.titleMedium!.copyWith(
                          fontWeight: FontWeight.bold,
                          color: _colorFromStatus(segnalazione.status).shade700,
                        ),
                  ),
                ],
              ),
            ],
          ),
          trailing: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(DateFormat('dd/MM/yyyy').format(segnalazione.creationDate)),
              const Icon(Icons.chevron_right),
            ],
          ),
        ),
      ),
    );
  }
}
