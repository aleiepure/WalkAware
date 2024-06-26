import "dart:io";

import "package:crypt/crypt.dart";
import "package:dio/dio.dart";
import "package:flutter/foundation.dart";
import "package:flutter/material.dart";
import "../exceptions/dio_exceptions.dart";
import 'package:http_parser/http_parser.dart'; // ignore: depend_on_referenced_packages

String baseUrl = const String.fromEnvironment('BACKEND_BASE_URL');

/// Sends a request to the backend to register a new user.
///
/// Sends a POST request to the backend (URL from the BACKEND_BASE_URL environment
/// variable) to register a new user with the given [name], [email], [passwordHash]
/// and [age].
/// Returns the response from the backend. If an error occurs, logs the error and
/// returns a response with status code 418 (I'm a teapot) to indicate that its
/// not a backend issue.
Future backendRequestUserRegistration(
  String name,
  String email,
  Crypt passwordHash,
  int age,
) async {
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
Future backendRequestUserLogin(
  String email,
  Crypt passwordHash,
) async {
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
Future backendRequestUpdateUserPoints(
  String id,
  String authToken,
  int points,
) async {
  try {
    final response = await Dio().put(
      '$baseUrl/api/v1/utente/mobile/$id/punti',
      data: {
        'punti': points,
      },
      options: Options(headers: {'x-access-token': authToken}),
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

/// Sends a request to the backend to upload an image.
///
/// Sends a POST request to the backend (URL from the BACKEND_BASE_URL environment
/// variable) to upload an image with the given [image] and [authToken].
/// Returns the response from the backend. If an error occurs, logs the error and
/// returns a response with status code 418 (I'm a teapot) to indicate that its not
/// a backend issue.
Future backendRequestUploadImage(
  File image,
  String authToken,
) async {
  try {
    final response = await Dio().post(
      '$baseUrl/api/v1/segnalazioni/immagini',
      data: FormData.fromMap({'image': await MultipartFile.fromFile(image.path, contentType: MediaType('image', image.path.split('.').last))}),
      options: Options(headers: {'x-access-token': authToken}),
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

/// Sends a request to the backend to report a new issue.
///
/// Sends a POST request to the backend (URL from the BACKEND_BASE_URL environment
/// variable) to report a new issue with the given [userId], [latitude], [longitude],
/// [imageKey], [category], [importance] and [authToken].
/// Returns the response from the backend. If an error occurs, logs the error and
/// returns a response with status code 418 (I'm a teapot) to indicate that its not
/// a backend issue.
Future backendRequestReportIssue({
  required String userId,
  required double latitude,
  required double longitude,
  String imageKey = '',
  required String category,
  required String importance,
  required String authToken,
}) async {
  try {
    final response = await Dio().post(
      '$baseUrl/api/v1/utente/mobile/$userId/segnalazioni',
      data: {
        'luogo': "$latitude,$longitude",
        'foto': imageKey,
        'tipo': category,
        'urgenza': importance,
        'status': 'aperta',
      },
      options: Options(headers: {'x-access-token': authToken}),
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

/// Sends a request to the backend to get the users points.
///
/// Sends a GET request to the backend (URL from the BACKEND_BASE_URL environment
/// variable) to get the points of the user with the given [userId] and [authToken].
/// Returns the response from the backend. If an error occurs, logs the error and
/// returns a response with status code 418 (I'm a teapot) to indicate that its not
/// a backend issue.
Future backendRequestGetUserPoints(
  String userId,
  String authToken,
) async {
  try {
    final response = await Dio().get(
      '$baseUrl/api/v1/utente/mobile/$userId/punti',
      options: Options(headers: {'x-access-token': authToken}),
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

/// Sends a request to the backend to get the user.
///
/// Sends a GET request to the backend (URL from the BACKEND_BASE_URL environment
/// variable) to get the user with the given [userId] and [authToken].
/// Returns the response from the backend. If an error occurs, logs the error and
/// returns a response with status code 418 (I'm a teapot) to indicate that its not
/// a backend issue.
Future backendRequestGetUser(
  String userId,
  String authToken,
) async {
  try {
    final response = await Dio().get(
      '$baseUrl/api/v1/utente/mobile/$userId',
      options: Options(headers: {'x-access-token': authToken}),
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

/// Sends a request to the backend to get all available rewards.
///
/// Sends a GET request to the backend (URL from the BACKEND_BASE_URL environment
/// variable) to get all available rewards.
/// Returns the response from the backend. If an error occurs, logs the error and
/// returns a response with status code 418 (I'm a teapot) to indicate that its not
/// a backend issue.
Future backendRequestGetRewards(String authToken) async {
  try {
    final response = await Dio().get(
      '$baseUrl/api/v1/premi',
      options: Options(headers: {'x-access-token': authToken}),
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

/// Sends a request to the backend to redeem a reward.
///
/// Sends a POST request to the backend (URL from the BACKEND_BASE_URL environment
/// variable) to redeem a reward with the given [userId], [rewardId] and [authToken].
/// Returns the response from the backend. If an error occurs, logs the error and
/// returns a response with status code 418 (I'm a teapot) to indicate that its not
/// a backend issue.
Future backendRequestRedeemReward({
  required String userId,
  required String rewardId,
  required String authToken,
}) async {
  try {
    final response = await Dio().post(
      '$baseUrl/api/v1/utente/mobile/$userId/riscattaBuono?premioId=$rewardId',
      options: Options(headers: {'x-access-token': authToken}),
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

/// Sends a request to the backend to get all available coupons for a user
/// 
/// Sends a GET request to the backend (URL from the BACKEND_BASE_URL environment
/// variable) to get all available coupons for a user with the given [userId] and [authToken].
/// Returns the response from the backend. If an error occurs, logs the error and
/// returns a response with status code 418 (I'm a teapot) to indicate that its not
/// a backend issue.
Future backendRequestGetUserCoupons(String userId, String authToken) async {
  try {
    final response = await Dio().get(
      '$baseUrl/api/v1/utente/mobile/$userId/buoni',
      options: Options(headers: {'x-access-token': authToken}),
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

/// Sends a request to the backend to get the user's reports.
/// 
/// Sends a GET request to the backend (URL from the BACKEND_BASE_URL environment
/// variable) to get the user's reports with the given [authToken].
/// Returns the response from the backend. If an error occurs, logs the error and
/// returns a response with status code 418 (I'm a teapot) to indicate that its not
/// a backend issue.
Future backendRequestGetUserReports(String userId, String authToken) async {
  try {
    final response = await Dio().get(
      '$baseUrl/api/v1/utente/mobile/$userId/segnalazioni',
      options: Options(headers: {'x-access-token': authToken}),
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

/// Sends a request to the backend to get the image URL.
/// 
/// Sends a GET request to the backend (URL from the BACKEND_BASE_URL environment
/// variable) to get the image URL with the given [imageKey] and [authToken].
/// Returns the response from the backend. If an error occurs, logs the error and
/// returns a response with status code 418 (I'm a teapot) to indicate that its not
/// a backend issue.
Future backendRequestGetReportImageURL(String imageKey, String authToken) async {
  try {
    final response = await Dio().get(
      '$baseUrl/api/v1/segnalazioni/immagini/$imageKey',
      options: Options(headers: {'x-access-token': authToken}),
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

/// Sends a request to the backend to edit a user.
///
/// Sends a PUT request to the backend (URL from the BACKEND_BASE_URL environment
/// variable) to edit a user with the given [userId], [name], [email], [passwordHash]
/// Returns the response from the backend. If an error occurs, logs the error and
/// returns a response with status code 418 (I'm a teapot) to indicate that its not
/// a backend issue.
Future backendRequestEditUser({
  required String userId,
  String name = '',
  String email = '',
  String newPassword = '',
  String oldPassword = '',
  required String authToken,
}) async {
  try {
    final response = await Dio().put(
      '$baseUrl/api/v1/utente/mobile/$userId',
      data: {
        'nome': name,
        'email': email,
        'password': newPassword,
        'old_password': oldPassword,
      },
      options: Options(headers: {'x-access-token': authToken}),
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