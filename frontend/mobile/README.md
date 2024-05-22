# WalkAware Trento Frontend App Mobile

L'applicazione mobile è sviluppata in Flutter ed è dedicata agli abitanti della città di Trento.

L'app già compilata è scaricabile nell'[ultima release](https://github.com/aleiepure/WalkAware/releases/latest). Per eseguirla con un altro backend seguire le seguenti indicazioni.

## Requisiti
- [Flutter](https://docs.flutter.dev/get-started/install)

## Come usare
1. Clonare il repository se non è già stato fatto:
``` bash
git clone https://github.com/aleiepure/WalkAware.git
cd WalkAware/frontend/mobile
```
2. Per configurare mapbox seguire la sezione "secret token" a questo [link](https://pub.dev/packages/mapbox_maps_flutter#installation)
3. Installa le dipendenze
```bash
flutter pub get
```
4. Compila l'applicazione:
``` bash
flutter build apk --dart-define PUBLIC_ACCESS_TOKEN=<token di accesso> \
                  --dart-define BACKEND_BASE_URL=<URL BACKEND> \
                  --dart-define JWT_SECRET=<jwt secret token uguale al backend>
```

Assicurarsi di sostituire con i valori corretti. 

