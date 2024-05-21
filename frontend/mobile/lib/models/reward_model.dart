enum RewardType {
  percentage,
  cashback,
  freebie,
  quantity,
}

class RewardModel {
  late String id;
  late String name;
  late int value;
  late RewardType type;
  late String description;
  late int pointsCost;
  late String issuingCompany;
  late int validity;

  RewardModel({
    required this.id,
    required this.name,
    required this.value,
    required this.type,
    required this.description,
    required this.pointsCost,
    required this.issuingCompany,
    required this.validity,
  });

  RewardModel.fromJson(Map<String, dynamic> json) {
    id = json['_id'];
    name = json['nome'];
    value = json['valore'];
    description = json['descrizione'];
    pointsCost = json['costo_punti'];
    issuingCompany = json['idAzienda'];
    validity = json['validitaBuono'];

    switch (json['tipo']) {
      case 'percentuale':
        type = RewardType.percentage;
        break;
      case 'contante':
        type = RewardType.cashback;
        break;
      case 'omaggio':
        type = RewardType.freebie;
        break;
      case 'quantita':
        type = RewardType.quantity;
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

    switch (type) {
      case RewardType.percentage:
        data['tipo'] = 'percentuale';
        break;
      case RewardType.cashback:
        data['tipo'] = 'contante';
        break;
      case RewardType.freebie:
        data['tipo'] = 'omaggio';
        break;
      case RewardType.quantity:
        data['tipo'] = 'quantita';
        break;
    }
    return data;
  }
}
