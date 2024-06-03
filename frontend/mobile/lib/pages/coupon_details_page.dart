import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:qr_flutter/qr_flutter.dart';

import '../models/coupon_model.dart';

class CouponDetailsPage extends StatelessWidget {
  final CouponModel coupon;
  final _frontendBaseUrl = const String.fromEnvironment('FRONTEND_BASE_URL');

  const CouponDetailsPage({super.key, required this.coupon});

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

  String _couponBrief(CouponModel coupon) {
    switch (coupon.type) {
      case CouponType.percentage:
        return '${coupon.value}% di sconto';
      case CouponType.cashback:
        return '€${coupon.value}';
      case CouponType.freebie:
        return 'Omaggio';
      case CouponType.quantity:
        return 'Quantità: ${coupon.value}x1';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Theme.of(context).colorScheme.secondaryContainer,
      appBar: AppBar(
        backgroundColor: Theme.of(context).colorScheme.secondaryContainer,
        title: Text(
          'Dettagli buono',
          style: Theme.of(context).textTheme.titleLarge!.copyWith(
                fontSize: 24.0,
                color: Theme.of(context).colorScheme.onSecondaryContainer,
              ),
        ),
      ),
      body: Column(
        mainAxisAlignment: MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                decoration: BoxDecoration(
                  color: Theme.of(context).colorScheme.primaryContainer,
                  borderRadius: const BorderRadius.all(Radius.circular(50)),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: Icon(
                    _getIconFromType(coupon.type),
                    size: 32.0,
                  ),
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(8.0),
                child: Text(
                  coupon.name,
                  style: Theme.of(context).textTheme.titleLarge!.copyWith(
                        fontSize: 24.0,
                        color: Theme.of(context).colorScheme.onSecondaryContainer,
                      ),
                ),
              ),
            ],
          ),
          Center(
            child: Padding(
              padding: const EdgeInsets.only(top: 16.0),
              child: Card(
                clipBehavior: Clip.antiAlias,
                child: Column(
                  children: [
                    Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: QrImageView(
                        data: '$_frontendBaseUrl/valida?premioId=${coupon.id}',
                        version: QrVersions.auto,
                        size: 192,
                      ),
                    ),
                    SizedBox(
                      width: 224,
                      child: LinearProgressIndicator(
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.only(top: 20.0, left: 8.0, right: 8.0),
            child: Text(
              'Valore',
              style: Theme.of(context).textTheme.titleMedium,
            ),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 8.0),
            child: Text(
              _couponBrief(coupon),
              style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                    fontSize: 16.0,
                  ),
            ),
          ),          
          Padding(
            padding: const EdgeInsets.only(top: 20.0, left: 8.0, right: 8.0),
            child: Text(
              'Descrizione',
              style: Theme.of(context).textTheme.titleMedium,
            ),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 8.0),
            child: Text(
              coupon.description,
              style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                    fontSize: 16.0,
                  ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.only(top: 8.0, left: 8.0, right: 8.0),
            child: Text(
              'Fornito da: ${coupon.issuingCompany}',
              style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                    fontSize: 16.0,
                  ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 8.0),
            child: Text(
              'Valido fino al: ${DateFormat('dd/MM/yyyy').format(coupon.redemptionDate!.add(Duration(days: coupon.validity)))}',
              style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                    fontSize: 16.0,
                  ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.only(top: 20.0, left: 8.0, right: 8.0),
            child: Text(
              'Come usare il buono',
              style: Theme.of(context).textTheme.titleMedium,
            ),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 8.0),
            child: Text(
              'Mostra questa schermata presso l\'esercente per riscattare il tuo buono. Si applicano termini e condizioni del commerciante.',
              style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                    fontSize: 16.0,
                  ),
            ),
          ),
        ],
      ),
    );
  }
}
