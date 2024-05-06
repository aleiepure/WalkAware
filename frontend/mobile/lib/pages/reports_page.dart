import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import '../models/segnalazione_model.dart';
import '../pages/new_report_page.dart';

class ReportsPage extends StatefulWidget {
  const ReportsPage({super.key});

  @override
  State<ReportsPage> createState() => _ReportsPageState();
}

class _ReportsPageState extends State<ReportsPage> {
  List<SegnalazioneModel> segnalazioni = [
    SegnalazioneModel(luogo: "45,11", foto: 'http://via.placeholder.com/320', tipo: 'tipo1', urgenza: 'urgente', status: 'aperta', sId: '1'),
    SegnalazioneModel(luogo: "45,11", foto: 'http://via.placeholder.com/320', tipo: 'tipo2', urgenza: 'non urgente', status: 'chiusa', sId: '2'),
    SegnalazioneModel(luogo: "45,11", tipo: 'tipo3', urgenza: 'urgente', status: 'aperta', sId: '3')
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        backgroundColor: Theme.of(context).colorScheme.secondaryContainer,
        appBar: AppBar(
          backgroundColor: Theme.of(context).colorScheme.secondaryContainer,
          title: Text(
            'Le mie segnalazioni',
            style: Theme.of(context).textTheme.titleLarge!.copyWith(
                  fontSize: 24.0,
                  color: Theme.of(context).colorScheme.onSecondaryContainer,
                ),
          ),
        ),
        body: RefreshIndicator(
          displacement: 20,
          onRefresh: () async {
            // TODO: replace with refresh logic
            await Future.delayed(const Duration(seconds: 1));
          },
          child: ListView.builder(
            itemCount: segnalazioni.length,
            itemBuilder: (context, index) {
              return Card(
                margin: const EdgeInsets.all(8.0),
                child: Row(
                  children: <Widget>[
                    ClipRRect(
                      borderRadius: const BorderRadius.only(
                        topLeft: Radius.circular(8.0),
                        bottomLeft: Radius.circular(8.0),
                        topRight: Radius.zero,
                        bottomRight: Radius.zero,
                      ),
                      child: SizedBox(
                        width: 100,
                        child: CachedNetworkImage(
                          // TODO: replace url with url to map image
                          imageUrl: segnalazioni[index].foto ?? "https://placehold.co/320.png",
                          placeholder: (context, url) => const CircularProgressIndicator(),
                          errorWidget: (context, url, error) => const Icon(Icons.image_not_supported),
                          fit: BoxFit.cover,
                        ),
                      ),
                    ),
                    Padding(
                      padding: const EdgeInsets.only(left: 8.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            '${segnalazioni[index].luogo} - ${segnalazioni[index].tipo}',
                            maxLines: 2,
                            style: Theme.of(context).textTheme.titleLarge!.copyWith(
                                  color: Theme.of(context).colorScheme.onSecondaryContainer,
                                ),
                          ),
                          Text('Urgenza: ${segnalazioni[index].urgenza}'),
                          Text('Status: ${segnalazioni[index].status}'),
                        ],
                      ),
                    ),
                  ],
                ),
              );
            },
          ),
        ),
        floatingActionButton: ElevatedButton.icon(
          onPressed: () => Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => const NewReportPage(),
            ),
          ),
          icon: const Icon(Icons.add, size: 24.0),
          label: Text(
            'Nuova',
            style: Theme.of(context).textTheme.titleMedium!.copyWith(color: Theme.of(context).colorScheme.onPrimary),
          ),
          style: ElevatedButton.styleFrom(
            backgroundColor: Theme.of(context).colorScheme.primary,
            foregroundColor: Theme.of(context).colorScheme.onPrimary,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12.0),
            ),
            padding: const EdgeInsets.all(16),
          ),
        ));
  }
}
