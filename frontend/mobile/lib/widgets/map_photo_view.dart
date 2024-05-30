import 'package:cached_network_image/cached_network_image.dart';
import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../providers/user_provider.dart';
import '../requests/backend_requests.dart';

class MapPhotoView extends StatefulWidget {
  final String? photoUrl;
  final String latlon;

  const MapPhotoView({super.key, this.photoUrl, required this.latlon});

  @override
  State<MapPhotoView> createState() => _MapPhotoViewState();
}

class _MapPhotoViewState extends State<MapPhotoView> {
  Set<String> _selectedTopView = {'map'};

  String? _photoUrl;

  void updateTopViewSelection(Set<String> selected) {
    setState(() {
      _selectedTopView = selected;
    });
  }

  String _buildMapURL() {
    // Convert lat,lon formatted string
    final lat = double.parse(widget.latlon.split(',')[0]);
    final lon = double.parse(widget.latlon.split(',')[1]);
    const api = String.fromEnvironment('PUBLIC_ACCESS_TOKEN');
    int height = (MediaQuery.of(context).size.height * 0.4).toInt();
    int width = MediaQuery.of(context).size.width.toInt();

    return "https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/pin-l+ff2600($lon,$lat)/auto/${width}x$height@2x?access_token=$api";
  }

  Future<String> _getImageURL() async {
    if (_photoUrl != null) {
      return _photoUrl!;
    }

    final provider = Provider.of<UserProvider>(context, listen: false);
    Response response = await backendRequestGetReportImageURL(widget.photoUrl!, provider.getUserToken());
    if (response.statusCode != 200 && response.data['status'] != 'success') {
      _photoUrl = null;
      return '';
    }

    _photoUrl = response.data['imageUrl'];
    return response.data['imageUrl'];
  }

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: MediaQuery.of(context).size.height * 0.5,
      width: MediaQuery.of(context).size.width,
      child: Column(
        children: [
          Expanded(
            child: _selectedTopView.contains('map')
                ? CachedNetworkImage(
                    imageUrl: _buildMapURL(),
                    placeholder: (context, _) {
                      return const Center(child: CircularProgressIndicator());
                    },
                  )
                : FutureBuilder(
                    future: _getImageURL(),
                    builder: (context, snapshot) => snapshot.connectionState == ConnectionState.waiting
                        ? const Center(child: CircularProgressIndicator())
                        : snapshot.hasError
                            ? const Center(child: Text('Error'))
                            : CachedNetworkImage(
                                imageUrl: snapshot.data as String,
                                placeholder: (context, _) {
                                  return const Center(child: CircularProgressIndicator());
                                },
                              ),
                  ),
          ),
          Visibility(
            visible: widget.photoUrl != '',
            child: Padding(
              padding: const EdgeInsets.all(8.0),
              child: SegmentedButton(
                  segments: const [
                    ButtonSegment<String>(value: 'map', label: Text('Mappa'), icon: Icon(Icons.map)),
                    ButtonSegment<String>(value: 'photo', label: Text('Foto'), icon: Icon(Icons.image_outlined)),
                  ],
                  selected: _selectedTopView,
                  onSelectionChanged: updateTopViewSelection,
                  style: SegmentedButton.styleFrom(
                    backgroundColor: Theme.of(context).colorScheme.secondaryContainer,
                    selectedBackgroundColor: Theme.of(context).colorScheme.primary,
                    selectedForegroundColor: Theme.of(context).colorScheme.onPrimary,
                    side: BorderSide(color: Theme.of(context).colorScheme.primary, width: 2.0),
                  )),
            ),
          ),
        ],
      ),
    );
  }
}
