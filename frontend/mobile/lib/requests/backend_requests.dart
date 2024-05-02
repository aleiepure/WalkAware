import "package:crypt/crypt.dart";
import "package:dio/dio.dart";
import "package:flutter/material.dart";
import "package:mobile/exceptions/dio_exceptions.dart";

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
  } catch (e) {
    final errorMessage = DioExceptions.fromDioError(e as DioException).toString();
    debugPrint(errorMessage);
    return Response(requestOptions: RequestOptions(), statusCode: 418);
  }
}
