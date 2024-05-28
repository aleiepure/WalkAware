enum SegnalazioneType {
  viabilita,
  illuminazione,
  segnaletica,
  sicurezza,
  barriereArchitettoniche,
  rifiuti,
  parcheggi,
  altro,
}

enum SegnalazioneUrgency {
  bassa,
  medioBassa,
  medioAlta,
  alta,
}

enum SegnalazioneStatus {
  aperta,
  presaInCarico,
  conclusa,
}

class SegnalazioneModel {
  late String place;
  late String photoKey;
  late SegnalazioneType type;
  late SegnalazioneUrgency urgency;
  late SegnalazioneStatus status;
  late String id;
  late DateTime creationDate;

  SegnalazioneModel({
    required this.place,
    required this.photoKey,
    required this.type,
    required this.urgency,
    required this.status,
    required this.id,
    required this.creationDate,
  });

  SegnalazioneModel.fromJson(Map<String, dynamic> json) {
    place = json['luogo'];
    photoKey = json['foto'];
    id = json['_id'];
    creationDate = DateTime.parse(json['data']);

    switch (json['tipo']) {
      case 'viabilita':
        type = SegnalazioneType.viabilita;
        break;
      case 'illuminazione':
        type = SegnalazioneType.illuminazione;
        break;
      case 'segnaletica':
        type = SegnalazioneType.segnaletica;
        break;
      case 'sicurezza':
        type = SegnalazioneType.sicurezza;
        break;
      case 'barriereArchitettoniche':
        type = SegnalazioneType.barriereArchitettoniche;
        break;
      case 'rifiuti':
        type = SegnalazioneType.rifiuti;
        break;
      case 'parcheggi':
        type = SegnalazioneType.parcheggi;
        break;
      case 'altro':
        type = SegnalazioneType.altro;
        break;
    }

    switch (json['urgenza']) {
      case 'bassa':
        urgency = SegnalazioneUrgency.bassa;
        break;
      case 'medio-bassa':
        urgency = SegnalazioneUrgency.medioBassa;
        break;
      case 'medio-alta':
        urgency = SegnalazioneUrgency.medioAlta;
        break;
      case 'alta':
        urgency = SegnalazioneUrgency.alta;
        break;
    }

    switch (json['status']) {
      case 'aperta':
        status = SegnalazioneStatus.aperta;
        break;
      case 'presa_in_carico':
        status = SegnalazioneStatus.presaInCarico;
        break;
      case 'conclusa':
        status = SegnalazioneStatus.conclusa;
        break;
    }
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = {};
    data['luogo'] = place;
    data['foto'] = photoKey;
    data['_id'] = id;
    data['data'] = creationDate.toIso8601String();

    switch (type) {
      case SegnalazioneType.viabilita:
        data['tipo'] = 'viabilita';
        break;
      case SegnalazioneType.illuminazione:
        data['tipo'] = 'illuminazione';
        break;
      case SegnalazioneType.segnaletica:
        data['tipo'] = 'segnaletica';
        break;
      case SegnalazioneType.sicurezza:
        data['tipo'] = 'sicurezza';
        break;
      case SegnalazioneType.barriereArchitettoniche:
        data['tipo'] = 'barriereArchitettoniche';
        break;
      case SegnalazioneType.rifiuti:
        data['tipo'] = 'rifiuti';
        break;
      case SegnalazioneType.parcheggi:
        data['tipo'] = 'parcheggi';
        break;
      case SegnalazioneType.altro:
        data['tipo'] = 'altro';
        break;
    }

    switch (urgency) {
      case SegnalazioneUrgency.bassa:
        data['urgenza'] = 'bassa';
        break;
      case SegnalazioneUrgency.medioBassa:
        data['urgenza'] = 'medio-bassa';
        break;
      case SegnalazioneUrgency.medioAlta:
        data['urgenza'] = 'medio-alta';
        break;
      case SegnalazioneUrgency.alta:
        data['urgenza'] = 'alta';
        break;
    }

    switch (status) {
      case SegnalazioneStatus.aperta:
        data['status'] = 'aperta';
        break;
      case SegnalazioneStatus.presaInCarico:
        data['status'] = 'presa_in_carico';
        break;
      case SegnalazioneStatus.conclusa:
        data['status'] = 'conclusa';
        break;
    }

    return data;
  }

  String get urgencyString {
    switch (urgency) {
      case SegnalazioneUrgency.bassa:
        return 'Bassa';
      case SegnalazioneUrgency.medioBassa:
        return 'Medio-bassa';
      case SegnalazioneUrgency.medioAlta:
        return 'Medio-alta';
      case SegnalazioneUrgency.alta:
        return 'Alta';
    }
  }

  String get statusString {
    switch (status) {
      case SegnalazioneStatus.aperta:
        return 'Aperta';
      case SegnalazioneStatus.presaInCarico:
        return 'Presa in carico';
      case SegnalazioneStatus.conclusa:
        return 'Conclusa';
    }
  }

  String get typeString {
    switch (type) {
      case SegnalazioneType.viabilita:
        return 'Viabilità';
      case SegnalazioneType.illuminazione:
        return 'Illuminazione Pubblica';
      case SegnalazioneType.segnaletica:
        return 'Segnaletica Stradale';
      case SegnalazioneType.sicurezza:
        return 'Sicurezza';
      case SegnalazioneType.barriereArchitettoniche:
        return 'Barriere Architettoniche';
      case SegnalazioneType.rifiuti:
        return 'Rifiuti';
      case SegnalazioneType.parcheggi:
        return 'Parcheggi';
      case SegnalazioneType.altro:
        return 'Altro';
    }
  }
}
