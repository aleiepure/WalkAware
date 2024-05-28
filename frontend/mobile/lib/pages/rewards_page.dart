import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:walkaware/widgets/coupons_listview.dart';
import 'package:walkaware/widgets/redeem_listview.dart';

import '../providers/user_provider.dart';

class RewardsPage extends StatefulWidget {
  const RewardsPage({super.key});

  @override
  State<RewardsPage> createState() => _RewardsPageState();
}

class _RewardsPageState extends State<RewardsPage> {
  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<UserProvider>(context);
    // debugPrint(provider.user.toString());

    return DefaultTabController(
      length: 2,
      child: Scaffold(
        backgroundColor: Theme.of(context).colorScheme.secondaryContainer,
        appBar: AppBar(
          bottom: const TabBar(
            tabs: [
              Tab(text: 'I miei buoni'),
              Tab(text: 'Riscatta'),
            ],
          ),
          backgroundColor: Theme.of(context).colorScheme.secondaryContainer,
          title: Text(
            'I miei punti: ${provider.getUserPoints()}',
            style: Theme.of(context).textTheme.titleLarge!.copyWith(
                  fontSize: 24.0,
                  color: Theme.of(context).colorScheme.onSecondaryContainer,
                ),
          ),
        ),
        body: const TabBarView(
          children: [
            CouponsListView(),
            RedeemRewardsListView(),
          ],
        ),
      ),
    );
  }
}