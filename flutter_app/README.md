# Flutter App

## Chat Backend Setup

The mobile app calls the same backend as web: `POST /api/assistant`.

Set backend URL with Dart define:

```bash
flutter run --dart-define=API_BASE_URL=https://your-vercel-domain.vercel.app
```

### Local Development

- Android emulator: `http://10.0.2.2:3000`
- iOS simulator: `http://localhost:3000`

Example:

```bash
flutter run --dart-define=API_BASE_URL=http://10.0.2.2:3000
```

## VS Code Launch Targets

`/.vscode/launch.json` includes:

- `Flutter App (Local API Auto)`
- `Flutter App (Local API Android Emulator)`
- `Flutter App (Local API iOS Simulator)`
- `Flutter App (Prod API)`

Update the prod placeholder domain before use.

## Runtime routing (no define set)

If `API_BASE_URL` is not set:

- physical device -> `https://musco-one.vercel.app`
- Android emulator -> `http://10.0.2.2:3000`
- iOS simulator -> `http://localhost:3000`

You can override physical default with:

```bash
flutter run --dart-define=API_PHYSICAL_BASE_URL=https://your-vercel-domain.vercel.app
```
