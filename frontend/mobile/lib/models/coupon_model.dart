enum CouponType {
  percentage,
  cashback,
  freebie,
  quantity,
}

class CouponModel {
  late String id;
  late String name;
  late int value;
  late CouponType type;
  late String description;
  late int pointsCost;
  late String issuingCompany;
  late int validity;
  late DateTime? redemptionDate;
  late bool used;

  CouponModel({
    required this.id,
    required this.name,
    required this.value,
    required this.type,
    required this.description,
    required this.pointsCost,
    required this.issuingCompany,
    required this.validity,
    required this.redemptionDate,
    required this.used
  });

  CouponModel.fromJson(Map<String, dynamic> json) {
    id = json['_id'];
    name = json['nome'];
    value = json['valore'];
    description = json['descrizione'];
    pointsCost = json['costo_punti'];
    issuingCompany = json['idAzienda'];
    validity = json['validitaBuono'];
    redemptionDate = DateTime.parse(json['dataRiscatto']);
    used = json['usato'];

    switch (json['tipo']) {
      case 'percentuale':
        type = CouponType.percentage;
        break;
      case 'contante':
        type = CouponType.cashback;
        break;
      case 'omaggio':
        type = CouponType.freebie;
        break;
      case 'quantita':
        type = CouponType.quantity;
        break;
    }
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data['_id'] = id;
    data['nome'] = name;
    data['valore'] = value;
    data['descrizione'] = description;
    data['costo_punti'] = pointsCost;
    data['idAzienda'] = issuingCompany;
    data['validitaBuono'] = validity;
    data['dataRiscatto'] = redemptionDate.toString();
    data['usato'] = used;

    switch (type) {
      case CouponType.percentage:
        data['tipo'] = 'percentuale';
        break;
      case CouponType.cashback:
        data['tipo'] = 'contante';
        break;
      case CouponType.freebie:
        data['tipo'] = 'omaggio';
        break;
      case CouponType.quantity:
        data['tipo'] = 'quantita';
        break;
    }
    return data;
  }

  bool isUsed() {
    return used;
  }

  bool isExpired() {
    return DateTime.now().difference(redemptionDate!).inDays > validity;
  }
}
