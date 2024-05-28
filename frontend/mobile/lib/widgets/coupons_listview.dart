import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

import '../models/coupon_model.dart';
import '../pages/coupon_details_page.dart';
import '../providers/user_provider.dart';
import '../requests/backend_requests.dart';

class CouponsListView extends StatefulWidget {
  const CouponsListView({super.key});

  @override
  State<CouponsListView> createState() => _CouponsListViewState();
}

class _CouponsListViewState extends State<CouponsListView> {
  List<CouponModel> coupons = [];

  Future<void> _refreshCoupons() async {
    final provider = Provider.of<UserProvider>(context, listen: false);

    Response response = await backendRequestGetUserCoupons(provider.getUserId(), provider.getUserToken());
    if (response.statusCode != 200 && response.data['status'] != 'success') {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Failed to refresh'),
        ),
      );
    }

    setState(() {
      coupons = (response.data['buoni'] as List).map((json) => CouponModel.fromJson(json)).toList();
    });
  }

  @override
  void initState() {
    super.initState();
    _refreshCoupons();
  }

  IconData _getIconFromType(CouponType type) {
    switch (type) {
      case CouponType.percentage:
        return Icons.percent;
      case CouponType.cashback:
        return Icons.money_rounded;
      case CouponType.freebie:
        return Icons.card_giftcard;
      case CouponType.quantity:
        return Icons.shopping_cart;
    }
  }

  bool _isCouponTappable(CouponModel coupon) {
    if (coupon.isExpired()) {
      return false;
    }

    if (coupon.isUsed()) {
      return false;
    }

    return true;
  }

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: _refreshCoupons,
      child: ListView.builder(
        physics: const AlwaysScrollableScrollPhysics(),
        itemCount: coupons.length,
        itemBuilder: (BuildContext context, int index) {
          return Card(
            child: InkWell(
              onTap: _isCouponTappable(coupons[index])
                  ? () => Navigator.push(
                        context,
                        MaterialPageRoute<void>(
                          builder: (BuildContext context) => CouponDetailsPage(coupon: coupons[index]),
                        ),
                      )
                  : null,
              child: ListTile(
                leading: Container(
                  decoration: BoxDecoration(
                    color: Theme.of(context).colorScheme.secondaryContainer,
                    borderRadius: const BorderRadius.all(Radius.circular(25)),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(8.0),
                    child: Icon(
                      _getIconFromType(coupons[index].type),
                    ),
                  ),
                ),
                title: Text(
                  coupons[index].name,
                  style: Theme.of(context).textTheme.titleLarge!.copyWith(
                        fontWeight: FontWeight.w400,
                      ),
                  overflow: TextOverflow.ellipsis,
                  maxLines: 1,
                ),
                subtitle: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    Text(
                      coupons[index].description,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis
                    ),
                    Text('Fornito da: ${coupons[index].issuingCompany}'),
                    if (coupons[index].isUsed())
                      const Chip(
                        label: Text('Usato'),
                        avatar: Icon(Icons.archive),
                      )
                    else if (coupons[index].isExpired())
                      const Chip(
                        label: Text('Scaduto'),
                        avatar: Icon(Icons.error),
                      )
                    else
                      Chip(
                        label: Text(DateFormat('dd/MM/yyyy').format(coupons[index].redemptionDate!.add(Duration(days: coupons[index].validity)))),
                        avatar: const Icon(Icons.calendar_today),
                      ),
                  ],
                ),
                trailing: _isCouponTappable(coupons[index]) ? const Icon(Icons.chevron_right) : const Text('Non valido'),
              ),
            ),
          );
        },
      ),
    );
  }
}
