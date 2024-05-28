import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../widgets/segnalazione_tile.dart';
import '../models/segnalazione_model.dart';
import '../pages/new_report_page.dart';
import '../providers/user_provider.dart';
import '../requests/backend_requests.dart';

class ReportsPage extends StatefulWidget {
  const ReportsPage({super.key});

  @override
  State<ReportsPage> createState() => _ReportsPageState();
}

class _ReportsPageState extends State<ReportsPage> {
  List<SegnalazioneModel> segnalazioni = [];
  bool loading = true;

  Future<void> _refreshReports() async {
    final provider = Provider.of<UserProvider>(context, listen: false);

    Response response = await backendRequestGetUserReports(provider.getUserId(), provider.getUserToken());
    if (response.statusCode != 200 && response.data['status'] != 'success') {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Failed to refresh'),
        ),
      );
    }

    setState(() {
      segnalazioni = (response.data['segnalazioni'] as List).map((json) => SegnalazioneModel.fromJson(json)).toList();
      loading = false;
    });
  }

  @override
  void initState() {
    super.initState();
    _refreshReports();
  }

  Widget _newSegnalazioneButton() {
    return ElevatedButton.icon(
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
        );
  }

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
        body: loading
            ? const Center(child: CircularProgressIndicator())
            : RefreshIndicator(
                displacement: 20,
                onRefresh: _refreshReports,
                child: ListView.builder(
                  physics: const AlwaysScrollableScrollPhysics(),
                  itemCount: segnalazioni.length,
                  itemBuilder: (BuildContext context, int index) {
                    return SegnalazioneTile(segnalazioni[index]);
                  },
                ),
              ),
        floatingActionButton: _newSegnalazioneButton(),
        );
  }
}
