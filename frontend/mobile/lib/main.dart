import 'package:flutter/material.dart';
import 'package:mapbox_maps_flutter/mapbox_maps_flutter.dart';
import 'package:mapbox_search/mapbox_search.dart';
import 'package:mobile/pages/onboarding.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'pages/home_page.dart';

void main() {
  runApp(const App());
}

class App extends StatefulWidget {
  const App({super.key});

  @override
  State<App> createState() => _AppState();
}

class _AppState extends State<App> {
  final Future<SharedPreferences> _prefs = SharedPreferences.getInstance();

  @override
  void initState() {
    super.initState();

    MapboxOptions.setAccessToken(const String.fromEnvironment("PUBLIC_ACCESS_TOKEN"));
    MapBoxSearch.init(const String.fromEnvironment("PUBLIC_ACCESS_TOKEN"));

    _prefs.then((prefs) {
      if (prefs.getBool('firstTime') == null) {
        prefs.setBool('firstTime', true);
      }
    });
  }

  Future<Widget> _mainPage() async {
    SharedPreferences prefs = await _prefs;

    if (prefs.getBool('firstTime')!) {
      print('first time');
      return const OnboardingPage();
    }

    print('not first time');
    return const HomePage();

    // _prefs.then((prefs) {

    // });
    // print('outside then');
    // return const Placeholder();
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'WalkAware Trento',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.lightGreen),
        useMaterial3: true,
      ),
      home: FutureBuilder(
        future: _mainPage(),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.done) {
            return snapshot.data!;
          }
          return const Scaffold(
            body: Center(
              child: CircularProgressIndicator(),
            ),
          );
        },
      ),
    );
  }
}
