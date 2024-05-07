import 'package:flutter/material.dart';
import 'package:flutter_activity_recognition/flutter_activity_recognition.dart';
import 'package:geolocator/geolocator.dart';
import 'package:introduction_screen/introduction_screen.dart';
import 'package:material_symbols_icons/symbols.dart';
import '../pages/home_page.dart';
import 'package:shared_preferences/shared_preferences.dart';

class OnboardingPage extends StatefulWidget {
  const OnboardingPage({super.key});

  @override
  State<OnboardingPage> createState() => _OnboardingPageState();
}

class _OnboardingPageState extends State<OnboardingPage> {
  bool _locationPermissionGranted = false;
  bool _activityPermissionGranted = false;

  bool _isNextButtonShown = true;

  final GlobalKey<IntroductionScreenState> _introScreenKey = GlobalKey<IntroductionScreenState>();

  void _onLocationPermissionPageButtonPressed() async {
    LocationPermission permission = await Geolocator.checkPermission();
    switch (permission) {
      case LocationPermission.denied:
        {
          permission = await Geolocator.requestPermission();
          if (permission == LocationPermission.whileInUse || permission == LocationPermission.always) {
            setState(() {
              _locationPermissionGranted = true;
              _isNextButtonShown = true;
            });
            return;
          } else {
            await Geolocator.openAppSettings();
            return;
          }
        }
      case LocationPermission.deniedForever:
        {
          await Geolocator.openAppSettings();
          return;
        }
      case LocationPermission.unableToDetermine:
      case LocationPermission.whileInUse:
      case LocationPermission.always:
        {
          setState(() {
            _locationPermissionGranted = true;
            _isNextButtonShown = true;
          });
          return;
        }
    }
  }

  void _onActivityPermissionPageButtonPressed() async {
    PermissionRequestResult permission = await FlutterActivityRecognition.instance.checkPermission();
    switch (permission) {
      case PermissionRequestResult.DENIED:
        {
          permission = await FlutterActivityRecognition.instance.requestPermission();
          if (permission == PermissionRequestResult.GRANTED) {
            setState(() {
              _activityPermissionGranted = true;
              _isNextButtonShown = true;
            });
            return;
          } else {
            await Geolocator.openAppSettings();
            return;
          }
        }
      case PermissionRequestResult.PERMANENTLY_DENIED:
        {
          await Geolocator.openAppSettings();
          return;
        }
      case PermissionRequestResult.GRANTED:
        {
          setState(() {
            _activityPermissionGranted = true;
            _isNextButtonShown = true;
          });
          return;
        }
    }
  }

  void _onPageChanged(int pageIndex) {
    if (pageIndex == 4 && !_locationPermissionGranted) {
      setState(() => _isNextButtonShown = false);
      return;
    }

    if (pageIndex == 5 && !_activityPermissionGranted) {
      setState(() => _isNextButtonShown = false);
      return;
    }

    setState(() => _isNextButtonShown = true);
  }

  void _onOnboardingDone() {
    SharedPreferences.getInstance().then((prefs) => prefs.setBool('firstTime', false));
    Navigator.pushReplacement(context, MaterialPageRoute<void>(builder: (BuildContext context) => const HomePage()));
  }

  @override
  Widget build(BuildContext context) {
    PageDecoration pageDecoration = PageDecoration(
      titleTextStyle: TextStyle(fontSize: 28.0, fontWeight: FontWeight.w700, color: Theme.of(context).colorScheme.onPrimaryContainer),
      bodyTextStyle: Theme.of(context).textTheme.titleLarge!.copyWith(fontSize: 19.0),
      bodyPadding: const EdgeInsets.fromLTRB(16.0, 0.0, 16.0, 16.0),
      imagePadding: EdgeInsets.zero,
    );

    return IntroductionScreen(
      key: _introScreenKey,
      globalBackgroundColor: Theme.of(context).colorScheme.secondaryContainer,
      allowImplicitScrolling: true,
      onDone: _onOnboardingDone,
      skipOrBackFlex: 0,
      nextFlex: 0,
      showBackButton: true,
      showNextButton: _isNextButtonShown,
      back: const Icon(Icons.arrow_back),
      next: const Icon(Icons.arrow_forward),
      onChange: _onPageChanged,
      done: const Text('Via!', style: TextStyle(fontWeight: FontWeight.w600)),
      curve: Curves.fastLinearToSlowEaseIn,
      dotsDecorator: DotsDecorator(
        size: const Size(10.0, 10.0),
        color: Theme.of(context).colorScheme.onPrimaryContainer,
        activeColor: Theme.of(context).colorScheme.primary,
        activeSize: const Size(22.0, 10.0),
        activeShape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.all(Radius.circular(25.0)),
        ),
      ),
      pages: [
        PageViewModel(
          title: "Ciao!",
          body: "Benvenuto in WalkAware Trento, l'app che ti premia quando sei in giro per la città di Trento.",
          decoration: pageDecoration,
          image: const Icon(Icons.waving_hand, size: 200),
        ),
        PageViewModel(
          title: "Indicazioni stradali",
          body:
              "WalkAware Trento ti aiuta a trovare la strada migliore per raggiungere a piedi la tua destinazione, consigliandoti i percorsi più sicuri e veloci.",
          decoration: pageDecoration,
          image: const Icon(Symbols.directions, size: 200),
        ),
        PageViewModel(
          title: "Cammina e guadagna",
          body:
              "WalkAware conta i tuoi passi. Ogni 2000 passi guadagni 1 punto che puoi convertire in buoni sconto e premi da usufruire presso i negozi e le attrazioni locali del Comune di Trento.",
          decoration: pageDecoration,
          image: const Icon(Icons.directions_walk, size: 200),
        ),
        PageViewModel(
          title: "Tieni gli occhi aperti",
          body:
              "Se noti qualcosa malfunzionante o pericoloso lungo il tuo percorso, segnalalo. Aiuterai il Comune di Trento a sistemarlo più in fretta e guadagnerai 1 punto extra!",
          decoration: pageDecoration,
          image: const Icon(Icons.report, size: 200),
        ),
        PageViewModel(
          title: "Permessi necessari",
          body:
              "Per funzionare correttamente, WalkAware Trento necessita di accedere alla tua posizione. Non preoccuparti, non condividiamo i tuoi dati con terzi.",
          footer: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 18.0),
            child: ElevatedButton(
              onPressed: _locationPermissionGranted ? null : _onLocationPermissionPageButtonPressed,
              style: ElevatedButton.styleFrom(
                backgroundColor: Theme.of(context).colorScheme.primary,
                foregroundColor: Theme.of(context).colorScheme.onPrimary,
              ),
              child: _locationPermissionGranted ? const Text('Apposto!') : const Text('Concedi permesso'),
            ),
          ),
          decoration: pageDecoration.copyWith(
            bodyFlex: 6,
            imageFlex: 6,
            safeArea: 80,
          ),
          image: const Icon(Icons.location_on, size: 200),
        ),
        PageViewModel(
          title: "Ancora permessi",
          body:
              "Per monitorare i tuoi passi, WalkAware Trento necessita di accedere ai dati dell'attività fisica. Non preoccuparti, non condividiamo i tuoi dati con terzi.",
          footer: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 18.0),
            child: ElevatedButton(
              onPressed: _activityPermissionGranted ? null : _onActivityPermissionPageButtonPressed,
              style: ElevatedButton.styleFrom(
                backgroundColor: Theme.of(context).colorScheme.primary,
                foregroundColor: Theme.of(context).colorScheme.onPrimary,
              ),
              child: _activityPermissionGranted ? const Text('Apposto!') : const Text('Concedi permesso'),
            ),
          ),
          decoration: pageDecoration.copyWith(
            bodyFlex: 6,
            imageFlex: 6,
            safeArea: 80,
          ),
          image: const Icon(Symbols.steps, size: 200),
        ),
        PageViewModel(
          title: "Pronto?",
          body:
              "Ricordati di camminare in sicurezza e di rispettare le norme del codice della strada. Esegui l'accesso dalla schermata principale per iniziare a guadagnare punti ed effettuare segnalazioni. Buona passeggiata!",
          decoration: pageDecoration,
          image: const Icon(Icons.done, size: 200),
        ),
      ],
    );
  }
}
