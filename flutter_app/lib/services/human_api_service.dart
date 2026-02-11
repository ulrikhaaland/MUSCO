import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:webview_flutter/webview_flutter.dart';

import '../models/anatomy.dart';

/// Callback for when an object is selected in the 3D viewer.
typedef ObjectSelectedCallback = void Function(
  String objectId,
  bool isDeselection,
);

/// Callback for when the Human API viewer is ready.
typedef ViewerReadyCallback = void Function();

/// Callback for camera updates.
typedef CameraUpdatedCallback = void Function();

/// Service wrapping the BioDigital Human API via WebView JavaScript channels.
///
/// Mirrors the web app's [useHumanAPI] hook: loads the viewer in an iframe,
/// wires up event listeners, and exposes scene/camera commands.
class HumanApiService {
  HumanApiService({
    required WebViewController controller,
  }) : _controller = controller;

  final WebViewController _controller;

  ObjectSelectedCallback? onObjectSelected;
  ViewerReadyCallback? onViewerReady;
  CameraUpdatedCallback? onCameraUpdated;

  /// BioDigital model IDs matching the web app constants.
  static const modelIds = <Gender, String>{
    Gender.male: '5tOV',
    Gender.female: '5tOR',
  };

  // ── viewer URL builder (mirrors getViewerUrl in HumanViewer.tsx) ──

  static String viewerUrl(Gender gender) {
    final id = modelIds[gender]!;
    final params = <String, String>{
      'id': id,
      'ui-anatomy-descriptions': 'false',
      'ui-anatomy-pronunciations': 'false',
      'ui-anatomy-labels': 'false',
      'ui-audio': 'false',
      'ui-chapter-list': 'false',
      'ui-fullscreen': 'false',
      'ui-help': 'false',
      'ui-info': 'false',
      'ui-label-list': 'false',
      'ui-layers': 'false',
      'ui-loader': 'circle',
      'ui-media-controls': 'false',
      'ui-menu': 'false',
      'ui-nav': 'false',
      'ui-search': 'false',
      'ui-tools': 'false',
      'ui-tutorial': 'false',
      'ui-undo': 'false',
      'ui-whiteboard': 'false',
      'ui-zoom': 'false',
      'initial.none': 'false',
      'disable-scroll': 'false',
      'uaid': 'LzCgB',
      'paid': 'o_26b5a0fa',
      'be-annotations': 'false',
      'ui-annotations': 'false',
      'ui-navigation': 'false',
      'ui-controls': 'false',
      'ui-logo': 'false',
    };

    final uri = Uri.https('human.biodigital.com', '/viewer/', params);
    return uri.toString();
  }

  // ── HTML wrapper that loads the BioDigital viewer + Human API SDK ──

  /// Returns a full HTML document that:
  /// 1. Embeds the BioDigital viewer iframe.
  /// 2. Loads the Human API SDK.
  /// 3. Bridges events to Flutter via `FlutterBridge.postMessage`.
  static String buildHtml(Gender gender) {
    final src = viewerUrl(gender);
    return '''
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
  <style>
    * { margin:0; padding:0; }
    html, body { width:100%; height:100%; overflow:hidden; background:#000; }
    #viewer { width:100%; height:100%; border:0; }
  </style>
</head>
<body>
  <iframe id="viewer" src="$src" allow="fullscreen" allowfullscreen></iframe>

  <script src="https://developer.biodigital.com/builds/api/human-api-3.0.0.min.js"></script>
  <script>
    var human = null;
    var initialCamera = null;

    function init() {
      human = new HumanAPI("viewer");

      human.on("human.ready", function() {
        human.send("scene.disableHighlight");

        human.send("camera.info", function(cam) {
          initialCamera = cam;
        });

        human.on("camera.updated", function() {
          FlutterBridge.postMessage(JSON.stringify({
            type: "camera.updated"
          }));
        });

        human.on("scene.objectsSelected", function(ev) {
          FlutterBridge.postMessage(JSON.stringify({
            type: "scene.objectsSelected",
            data: ev
          }));
        });

        human.on("scene.picked", function(ev) {
          FlutterBridge.postMessage(JSON.stringify({
            type: "scene.picked",
            data: ev
          }));
        });

        FlutterBridge.postMessage(JSON.stringify({ type: "human.ready" }));
      });
    }

    // Expose commands callable from Flutter
    function sendCommand(cmd, payload) {
      if (!human) return;
      human.send(cmd, payload ? JSON.parse(payload) : undefined);
    }

    function cameraOrbit(yaw) {
      if (!human) return;
      human.send("camera.orbit", { yaw: yaw });
    }

    function cameraSet(payload) {
      if (!human) return;
      human.send("camera.set", JSON.parse(payload));
    }

    function resetCamera() {
      if (!human || !initialCamera) return;
      human.send("camera.set", {
        position: initialCamera.position,
        target: initialCamera.target,
        up: initialCamera.up,
        animate: true
      });
    }

    function enableXray() {
      if (!human) return;
      human.send("scene.enableXray");
    }

    function disableXray() {
      if (!human) return;
      human.send("scene.disableXray");
    }

    function resetScene() {
      if (!human) return;
      human.send("scene.disableXray");
      human.send("scene.reset");
    }

    function selectObjects(selectionJson) {
      if (!human) return;
      var sel = JSON.parse(selectionJson);
      sel.replace = true;
      human.send("scene.selectObjects", sel);
    }

    // Initialize after SDK loads
    if (typeof HumanAPI !== "undefined") {
      init();
    } else {
      document.querySelector('script[src*="human-api"]')
        .addEventListener("load", init);
    }
  </script>
</body>
</html>
''';
  }

  // ── Commands sent to the WebView ──

  /// Orbit camera by [yaw] degrees.
  Future<void> cameraOrbit(double yaw) async {
    await _controller.runJavaScript('cameraOrbit($yaw)');
  }

  /// Set camera to a specific configuration.
  Future<void> cameraSet(Map<String, dynamic> payload) async {
    final json = jsonEncode(payload);
    await _controller.runJavaScript("cameraSet('$json')");
  }

  /// Reset camera to initial position.
  Future<void> resetCamera() async {
    await _controller.runJavaScript('resetCamera()');
  }

  /// Enable x-ray mode.
  Future<void> enableXray() async {
    await _controller.runJavaScript('enableXray()');
  }

  /// Disable x-ray mode.
  Future<void> disableXray() async {
    await _controller.runJavaScript('disableXray()');
  }

  /// Reset entire scene (camera + selections + xray).
  Future<void> resetScene() async {
    await _controller.runJavaScript('resetScene()');
  }

  /// Select objects in the scene by ID map.
  Future<void> selectObjects(Map<String, bool> selection) async {
    final json = jsonEncode(selection);
    await _controller.runJavaScript("selectObjects('$json')");
  }

  /// Send an arbitrary command to the Human API.
  Future<void> sendCommand(String command, [Map<String, dynamic>? payload]) async {
    if (payload != null) {
      final json = jsonEncode(payload);
      await _controller.runJavaScript("sendCommand('$command', '$json')");
    } else {
      await _controller.runJavaScript("sendCommand('$command')");
    }
  }

  // ── Message handler (called from WebView JS channel) ──

  /// Process a message from the JavaScript bridge.
  void handleMessage(String messageJson) {
    try {
      final msg = jsonDecode(messageJson) as Map<String, dynamic>;
      final type = msg['type'] as String?;

      switch (type) {
        case 'human.ready':
          debugPrint('[HumanAPI] Viewer ready');
          onViewerReady?.call();
        case 'camera.updated':
          onCameraUpdated?.call();
        case 'scene.objectsSelected':
          _handleObjectsSelected(msg['data'] as Map<String, dynamic>?);
        case 'scene.picked':
          // Picked events provide 3D intersection position; useful for
          // lower-back detection. For now we log and let objectsSelected handle state.
          debugPrint('[HumanAPI] scene.picked: ${msg['data']}');
      }
    } catch (e) {
      debugPrint('[HumanAPI] Error parsing message: $e');
    }
  }

  void _handleObjectsSelected(Map<String, dynamic>? data) {
    if (data == null) return;

    // Remove non-ID keys that the API sends.
    final filtered = Map<String, dynamic>.from(data)
      ..remove('mode')
      ..remove('replace');

    if (filtered.isEmpty) return;

    final objectId = filtered.keys.first;
    final isDeselection = filtered.values.every((v) => v == false);

    debugPrint('[HumanAPI] objectsSelected: $objectId deselect=$isDeselection');
    onObjectSelected?.call(objectId, isDeselection);
  }
}
