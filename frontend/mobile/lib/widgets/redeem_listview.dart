import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:walkaware/models/reward_model.dart';

import '../requests/backend_requests.dart';
import '../providers/user_provider.dart';

class RedeemRewardsListView extends StatefulWidget {
  const RedeemRewardsListView({super.key});

  @override
  State<RedeemRewardsListView> createState() => _RedeemRewardsListViewState();
}

class _RedeemRewardsListViewState extends State<RedeemRewardsListView> {
  List<RewardModel> rewards = [];

  Future<void> _refreshRewards() async {
    final provider = Provider.of<UserProvider>(context, listen: false);

    Response response = await backendRequestGetRewards(provider.getUserToken());
    if (response.statusCode != 200 && response.data['status'] != 'success') {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Failed to refresh'),
        ),
      );
    }

    setState(() {
      rewards = (response.data['premi'] as List).map((json) => RewardModel.fromJson(json)).toList();
    });
  }

  @override
  void initState() {
    super.initState();
    _refreshRewards();
  }

  IconData _getIconFromType(RewardType type) {
    switch (type) {
      case RewardType.percentage:
        return Icons.percent;
      case RewardType.cashback:
        return Icons.money_rounded;
      case RewardType.freebie:
        return Icons.card_giftcard;
      case RewardType.quantity:
        return Icons.shopping_cart;
    }
  }

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: _refreshRewards,
      child: ListView.builder(
        physics: const AlwaysScrollableScrollPhysics(),
        itemCount: rewards.length,
        itemBuilder: (BuildContext context, int index) {
          return Card(
            child: InkWell(
              onTap: () => print('Tapped $index'),
              child: ListTile(
                leading: Container(
                  decoration: BoxDecoration(
                    color: Theme.of(context).colorScheme.secondaryContainer,
                    borderRadius: const BorderRadius.all(Radius.circular(25)),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(8.0),
                    child: Icon(
                      _getIconFromType(rewards[index].type),
                    ),
                  ),
                ),
                title: Text(
                  rewards[index].name,
                  style: Theme.of(context).textTheme.titleLarge!.copyWith(
                        fontWeight: FontWeight.w400,
                      ),
                ),
                subtitle: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    Text(rewards[index].description),
                    Text('Fornito da: ${rewards[index].issuingCompany}'),
                  ],
                ),
                trailing: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text('${rewards[index].pointsCost} pt'),
                    const Icon(Icons.chevron_right),
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}
