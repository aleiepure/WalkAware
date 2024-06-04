import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:mapbox_maps_flutter/mapbox_maps_flutter.dart';
import 'package:mapbox_search/mapbox_search.dart';
import 'package:provider/provider.dart';
import './providers/user_provider.dart';
import './pages/onboarding.dart';
import 'package:shared_preferences/shared_preferences.dart';
import './pages/home_page.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
  ]);
  runApp(
    ChangeNotifierProvider(
      create: (context) => UserProvider(),
      child: const App(),
    ),
  );
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
      return const OnboardingPage();
    }

    String userId = prefs.getString('userId') ?? '';
    String userToken = prefs.getString('userToken') ?? '';
    return FutureBuilder(
      future: Provider.of<UserProvider>(context, listen: false).fetchUserFromBackend(userId: userId, authToken: userToken),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                const Icon(
                  Icons.cloud_download_outlined,
                  size: 150,
                ),
                Text(
                  'Caricamento dei tuoi dati',
                  style: Theme.of(context).textTheme.titleLarge,
                ),
                const Padding(
                  padding: EdgeInsets.all(20.0),
                  child: CircularProgressIndicator(),
                ),
              ],
            ),
          );
        } else if (snapshot.hasError) {
          return const Center(child: Text('Error loading user data'));
        } else {
          return HomePage(startAsLogged: snapshot.data!);
        }
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'WalkAware Trento',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.lightGreen),
        useMaterial3: true,
      ),
      home: Scaffold(
        body: FutureBuilder(
          future: _mainPage(),
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.done) {
              return snapshot.data!;
            }
            return const Center(
              child: CircularProgressIndicator(),
            );
          },
        ),
      ),
    );
  }
}
