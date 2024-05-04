import "package:crypt/crypt.dart";
import "package:dio/dio.dart";
import "package:flutter/foundation.dart";
import "package:flutter/material.dart";
import "package:mobile/exceptions/dio_exceptions.dart";
import "package:shared_preferences/shared_preferences.dart";

String baseUrl = const String.fromEnvironment('BACKEND_BASE_URL');

/// Sends a request to the backend to register a new user.
///
/// Sends a POST request to the backend (URL from the BACKEND_BASE_URL environment 
/// variable) to register a new user with the given [name], [email], [passwordHash] 
/// and [age].
/// Returns the response from the backend. If an error occurs, logs the error and 
/// returns a response with status code 418 (I'm a teapot) to indicate that its 
/// not a backend issue.
Future backendRequestUserRegistration(String name, String email, Crypt passwordHash, int age) async {
  try {
    final response = await Dio().post(
      '$baseUrl/api/v1/utente/mobile',
      data: {
        'nome': name,
        'email': email,
        'password': passwordHash.toString(),
        'eta': age,
      },
    );
    return response;
  } on DioException catch (e) {
    
    if (e.type == DioExceptionType.badResponse) {
      return e.response;
    }
    
    final errorMessage = DioExceptions.fromDioException(e).toString();
    debugPrint(errorMessage);
    
    return Response(requestOptions: RequestOptions(), statusCode: 418, statusMessage: errorMessage);
  }
}

/// Sends a request to the backend to login a user.
/// 
/// Sends a POST request to the backend (URL from the BACKEND_BASE_URL environment
/// variable) to login a user with the given [email] and [passwordHash].
/// Returns the response from the backend containing the user's JWT token. If an 
/// error occurs, logs the error and returns a response with status code 418 (I'm 
/// a teapot) to indicate that its not a backend issue.
Future backendRequestUserLogin(String email, Crypt passwordHash) async {
  try {
    final response = await Dio().post(
      '$baseUrl/api/v1/utente/mobile/login',
      data: {
        'email': email,
        'password': passwordHash.toString(),
      },
    );
    return response;
  } on DioException catch (e) {
    
    if (e.type == DioExceptionType.badResponse) {
      return e.response;
    }
    
    final errorMessage = DioExceptions.fromDioException(e).toString();
    debugPrint(errorMessage);
    
    return Response(requestOptions: RequestOptions(), statusCode: 418, statusMessage: errorMessage);
  }
}

/// Sends a request to the backend to update a user's points.
/// 
/// Sends a PUT request to the backend (URL from the BACKEND_BASE_URL environment
/// variable) to update a user's points with the given [id].
/// Returns the response from the backend. If an error occurs, logs the error and
/// returns a response with status code 418 (I'm a teapot) to indicate that its not
/// a backend issue.
Future backendRequestUpdateUserPoints(String id, String authToken, int points) async {
  try {
    final response = await Dio().put(
      '$baseUrl/api/v1/utente/mobile/$id/punti',
      data: {
        'punti': points,
      },
      options: Options(headers: {'token': authToken}),
    );
    return response;
  } on DioException catch (e) {
    
    if (e.type == DioExceptionType.badResponse) {
      return e.response;
    }
    
    final errorMessage = DioExceptions.fromDioException(e).toString();
    debugPrint(errorMessage);
    
    return Response(requestOptions: RequestOptions(), statusCode: 418, statusMessage: errorMessage);
  }
}