import 'package:crypt/crypt.dart';
import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import '../models/user_model.dart';
import '../requests/backend_requests.dart';

class UserProvider with ChangeNotifier {
  UserModel? _user;

  UserModel? get user => _user;

  Future<bool> fetchUserFromBackend({required String userId, required String authToken}) async {
    Response response = await backendRequestGetUser(userId, authToken);
    debugPrint(response.data.toString());

    if (response.statusCode == 200 && response.data['success'] == true) {
      _user = UserModel.fromJson(response.data, authToken);
      notifyListeners();
      return true;
    } else {
      _user = null;
      return false;
    }
  }

  void setUser(UserModel user) {
    _user = user;
    notifyListeners();
  }

  void clearUser() {
    _user = null;
    notifyListeners();
  }

  int getUserPoints() {
    return _user!.points;
  }

  int getUserPointsFromBackend() {
    backendRequestGetUserPoints(_user!.id, _user!.token).then((value) {
      Response response = value;
      if (response.statusCode != 200 || response.data['success'] != true) {
        return 0;
      }

      _user!.points = response.data['punti'];
      notifyListeners();
      return _user!.points;
    }).catchError((error) {
      debugPrint(error.toString());
      return _user!.points;
    });
    return _user!.points;
  }

  String getUserToken() {
    return _user!.token;
  }

  String getUserId() {
    return _user!.id;
  }

  bool isUserSet() {
    return _user != null;
  }

  bool getUserTokenExpired() {
    return _user!.tokenExpired;
  }

  void setUserPoints(int points, {bool updateBackend = true}) async {
    if (updateBackend) {
      backendRequestUpdateUserPoints(_user!.id, _user!.token, points).then((value) {
        Response response = value;
        if (response.statusCode != 200 || response.data['success'] != true) {
          return;
        } else {
          _user!.points = points;
          notifyListeners();
          return;
        }
      });
    }

    _user!.points = points;
    notifyListeners();
    return;
  }

  void setUserName(String name, {bool updateBackend = true}) async {
    if (updateBackend) {
      backendRequestEditUser(userId: _user!.id, authToken: _user!.token, name: name).then((value) {
        Response response = value;
        if (response.statusCode != 200 || response.data['success'] != true) {
          return;
        } else {
          _user!.name = name;
          notifyListeners();
          return;
        }
      });
    }

    _user!.name = name;
    notifyListeners();
    return;
  }

  void setUserEmail(String email, {bool updateBackend = true}) async {
    if (updateBackend) {
      backendRequestEditUser(userId: _user!.id, authToken: _user!.token, email: email).then((value) {
        Response response = value;
        if (response.statusCode != 200 || response.data['success'] != true) {
          return;
        } else {
          _user!.email = email;
          notifyListeners();
          return;
        }
      });
    }

    _user!.email = email;
    notifyListeners();
    return;
  }

  Future<(bool, String)> setUserPassword(String newPassword, String oldPassword) async {
    Crypt newHashedPassword = Crypt.sha512(newPassword, salt: '');
    Crypt oldHashedPassword = Crypt.sha512(oldPassword, salt: '');
    
    Response response = await backendRequestEditUser(
      userId: _user!.id,
      authToken: _user!.token,
      newPassword: newHashedPassword.toString(),
      oldPassword: oldHashedPassword.toString(),
    );

    if (response.statusCode != 200 || response.data['success'] != true) {
      return (false, response.data['error'] as String);
    } else {
      return (true, "");
    }
  }

  String getUserName() {
    return _user!.name;
  }

  String getUserEmail() {
    return _user!.email;
  }
}
