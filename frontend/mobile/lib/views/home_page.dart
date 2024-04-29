import 'package:flutter/material.dart';

import 'package:mobile/widgets/map.dart';
// import 'package:permission_handler/permission_handler.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {

  @override
  void initState() {
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(
        child: Stack(
          children: <Widget>[
            MapBoxWidget(),
          ],
        ),
      ),
    );
  }
}
