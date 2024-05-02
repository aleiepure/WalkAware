import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:mapbox_maps_flutter/mapbox_maps_flutter.dart';
import '../exceptions/dio_exceptions.dart';

String directionsBaseUrl = 'https://api.mapbox.com/directions/v5/mapbox';
String accessToken = const String.fromEnvironment("PUBLIC_ACCESS_TOKEN");

Dio _dio = Dio();

Future requestMapboxWalkRoute(Position source, Position destination) async {
  String url =
      '$directionsBaseUrl/walking/${source.lng},${source.lat};${destination.lng},${destination.lat}?alternatives=false&continue_straight=true&geometries=geojson&overview=simplified&language=it&steps=false&access_token=$accessToken';
  try {
    _dio.options.contentType = Headers.jsonContentType;
    final responseData = await _dio.get(url);
    return responseData.data;
  } catch (e) {
    final errorMessage = DioExceptions.fromDioError(e as DioException).toString();
    debugPrint(errorMessage);
  }
}
