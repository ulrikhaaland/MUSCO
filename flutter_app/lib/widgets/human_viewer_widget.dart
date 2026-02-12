import 'package:flutter/foundation.dart';
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
    if (defaultTargetPlatform == TargetPlatform.iOS) {
      return UiKitView(
        viewType: _viewType,
        creationParamsCodec: const StandardMessageCodec(),
      );
    }
    if (defaultTargetPlatform == TargetPlatform.android) {
      return AndroidView(
        viewType: _viewType,
        creationParamsCodec: const StandardMessageCodec(),
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
