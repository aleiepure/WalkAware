# WalkAware Trento - Frontend App Mobile

L'applicazione mobile è sviluppata in Flutter ed è dedicata agli abitanti della città di Trento.

L'app già compilata è scaricabile nell'[ultima release](https://github.com/aleiepure/WalkAware/releases/latest). Per eseguirla con un altro backend seguire le seguenti indicazioni.

## Requisiti

- [Flutter](https://docs.flutter.dev/get-started/install)

## Come usare

1. Dopo ever [clonato la repo](../../README.md#istruzioni) entrare nella cartella del progetto flutter

``` shell
cd frontend/mobile
```

2. Configurare Mapbox seguendo la sezione "secret token" a questo [link](https://pub.dev/packages/mapbox_maps_flutter#installation)

3. Installa le dipendenze

```shell
flutter pub get
```

4. Esegui l'applicazione su un dispositivo Android con debug abilitato

``` shell
flutter run --dart-define PUBLIC_ACCESS_TOKEN=<token di accesso> \
                  --dart-define BACKEND_BASE_URL=<URL BACKEND> \
                  --dart-define FRONTEND_BASE_URL=<URL FRONTEND> \
                  --dart-define JWT_SECRET=<jwt secret token uguale al backend>
```

Assicurarsi di sostituire i valori corretti.
