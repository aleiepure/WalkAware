import 'package:dart_jsonwebtoken/dart_jsonwebtoken.dart';
import 'package:flutter/foundation.dart';

class UserModel {
  late String id;
  late String name;
  late String email;
  late String token;
  late int points;

  late bool tokenExpired;
  late DateTime tokenExpiration;

  /// Constructor for a new user
  UserModel({required this.id, required this.name, required this.email, required this.token, this.points = 0}) {
    // Check if token is expired
    try {
      JWT.verify(token, SecretKey(const String.fromEnvironment('JWT_SECRET')));
      tokenExpired = false;
      tokenExpiration = DateTime.fromMillisecondsSinceEpoch(JWT.decode(token).payload["exp"] * 1000);
    } on JWTExpiredException {
      tokenExpired = true;
    } on JWTException catch (ex) {
      debugPrint(ex.message);
    }
  }

  /// Constructor for a user from a JSON object.
  UserModel.fromJson(Map<String, dynamic> json, this.token) {
    id = json['id'];
    name = json['nome'];
    email = json['email'];
    points = json['punti'];

    try {
      JWT.verify(token, SecretKey(const String.fromEnvironment('JWT_SECRET')));
      tokenExpired = false;
      tokenExpiration = DateTime.fromMillisecondsSinceEpoch(JWT.decode(token).payload['exp'] * 1000);
    } on JWTExpiredException {
      tokenExpired = true;
    } on JWTException catch (ex) {
      debugPrint(ex.message);
    }
  }

  /// To JSON converter.
  // Map<String, dynamic> toJson() {
  //   final Map<String, dynamic> data = <String, dynamic>{};
  //   data['id'] = id;
  //   data['name'] = name;
  //   data['email'] = email;
  //   data['token'] = token;
  //   data['points'] = points;
  //   data['tokenExpired'] = tokenExpired;
  //   data['tokenExpiration'] = JWT.decode(token).payload["exp"];
  //   return data;
  // }

  /// To string converter.
  @override
  String toString() {
    return 'User(id: $id, name: $name, email: $email, token: $token, points: $points, tokenExpired: $tokenExpired, tokenExpiration: $tokenExpiration)';
  }

  /// Setters, do not update backend
  // set pointsWithUpdate(int value) {
  //   if (value != _points) {
  //     _updatePointsBackend(value).then((result) {
  //       if (result) {
  //         _points = value;
  //       }
  //       notifyListeners();
  //     });
  //   }
  // }

  // Future<bool> _updatePointsBackend(int value) async {
  //   Response pointsResponse = await backendRequestUpdateUserPoints(_id, _token, value);

  //   if (pointsResponse.statusCode != 200) {
  //     debugPrint('Error updating points: ${pointsResponse.data}');
  //     return false;
  //   } else {
  //     debugPrint('Points updated: ${pointsResponse.data}');
  //     return true;
  //   }
  // }
}
