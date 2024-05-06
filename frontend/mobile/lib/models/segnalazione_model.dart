class SegnalazioneModel {
  String? luogo;
  String? foto;
  String? tipo;
  String? urgenza;
  String? status;
  String? sId;

  SegnalazioneModel(
      {this.luogo, this.foto, this.tipo, this.urgenza, this.status, this.sId});

  SegnalazioneModel.fromJson(Map<String, dynamic> json) {
    luogo = json['luogo'];
    foto = json['foto'];
    tipo = json['tipo'];
    urgenza = json['urgenza'];
    status = json['status'];
    sId = json['_id'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = {};
    data['luogo'] = luogo;
    data['foto'] = foto;
    data['tipo'] = tipo;
    data['urgenza'] = urgenza;
    data['status'] = status;
    data['_id'] = sId;
    return data;
  }
}