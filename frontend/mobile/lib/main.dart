import 'package:flutter/material.dart';
import 'package:mapbox_maps_flutter/mapbox_maps_flutter.dart';
import './views/home_page.dart';

void main() {
  runApp(const App());
}

class App extends StatefulWidget {
  const App({super.key});

  @override
  State<App> createState() => _AppState();
}

class _AppState extends State<App> {

  @override
  void initState() {
    super.initState();
    MapboxOptions.setAccessToken(const String.fromEnvironment("PUBLIC_ACCESS_TOKEN"));
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'WalkAware Trento',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.lightGreen),
        useMaterial3: true,
      ),
      home: const HomePage(),
    );
  }
}
