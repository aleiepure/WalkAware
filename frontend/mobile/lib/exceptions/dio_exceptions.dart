import 'package:dio/dio.dart';

class DioExceptions implements Exception {
  DioExceptions.fromDioException(DioException dioException) {
    switch (dioException.type) {
      case DioExceptionType.cancel:
        message = "Request to server was cancelled";
        break;
      case DioExceptionType.connectionTimeout:
        message = "Connection timeout with server";
        break;
      case DioExceptionType.unknown:
        message = "Connection to server failed due to internet connection";
        break;
      case DioExceptionType.receiveTimeout:
        message = "Receive timeout in connection with server";
        break;
      case DioExceptionType.sendTimeout:
        message = "Send timeout in connection with server";
        break;
      default:
        message = "Something went wrong";
        break;
    }
  }

  late String message;
  
  @override
  String toString() => message;
}
