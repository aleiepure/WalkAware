import 'package:dio/dio.dart' as dio;
import 'package:flutter/material.dart';
import 'package:mapbox_maps_flutter/mapbox_maps_flutter.dart';
import '../exceptions/dio_exceptions.dart';

String directionsBaseUrl = 'https://api.mapbox.com/directions/v5/mapbox';
String accessToken = const String.fromEnvironment("PUBLIC_ACCESS_TOKEN");

dio.Dio _dio = dio.Dio();

Future requestMapboxWalkRoute(Position source, Position destination) async {
  String url =
      '$directionsBaseUrl/walking/${source.lng},${source.lat};${destination.lng},${destination.lat}?alternatives=false&continue_straight=true&geometries=geojson&overview=simplified&language=it&steps=false&access_token=$accessToken';
  try {
    _dio.options.contentType = dio.Headers.jsonContentType;
    final responseData = await _dio.get(url);
    return responseData.data;
  } on dio.DioException catch (e) {
    
    if (e.type == dio.DioExceptionType.badResponse) {
      return e.response;
    }
    
    final errorMessage = DioExceptions.fromDioException(e).toString();
    debugPrint(errorMessage);
    
    return dio.Response(requestOptions: dio.RequestOptions(), statusCode: 418, statusMessage: errorMessage);
  }
}
