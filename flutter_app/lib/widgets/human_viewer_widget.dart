import 'package:flutter/foundation.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

/// Embeds the native BioDigital 3D viewer as a platform view.
///
/// On iOS this uses `UiKitView`, on Android it will use `AndroidView`
/// (both registered under the same view type identifier).
class HumanViewerWidget extends StatelessWidget {
  const HumanViewerWidget({super.key});

  static const String _viewType = 'com.musco.muscoapp/human_viewer_view';

  @override
  Widget build(BuildContext context) {
    // EagerGestureRecognizer ensures the platform view always reclaims touch
    // focus after Flutter overlay buttons (reset, rotate, etc.) are tapped.
    // Without this, tapping a Flutter button on top of the UiKitView causes
    // the platform view to stop receiving subsequent touch events on real
    // iOS devices (gesture arena bug).
    final gestureRecognizers = <Factory<OneSequenceGestureRecognizer>>{
      Factory<EagerGestureRecognizer>(() => EagerGestureRecognizer()),
    };

    if (defaultTargetPlatform == TargetPlatform.iOS) {
      return UiKitView(
        viewType: _viewType,
        creationParamsCodec: const StandardMessageCodec(),
        gestureRecognizers: gestureRecognizers,
      );
    }
    if (defaultTargetPlatform == TargetPlatform.android) {
      return AndroidView(
        viewType: _viewType,
        creationParamsCodec: const StandardMessageCodec(),
        gestureRecognizers: gestureRecognizers,
      );
    }
    return const Center(
      child: Text(
        'Platform not supported',
        style: TextStyle(color: Colors.white),
      ),
    );
  }
}
