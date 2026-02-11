import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';

import '../models/anatomy.dart';
import '../services/human_api_service.dart';

/// Widget that renders the BioDigital Human 3D anatomy model inside a WebView.
///
/// Mirrors the web app's `<HumanViewer>` component. It loads the BioDigital
/// iframe, initialises the Human API via JS bridge, and exposes callbacks for
/// selection events and readiness.
class HumanViewerWidget extends StatefulWidget {
  const HumanViewerWidget({
    super.key,
    required this.gender,
    this.onReady,
    this.onObjectSelected,
    this.onCameraUpdated,
  });

  final Gender gender;
  final VoidCallback? onReady;
  final ObjectSelectedCallback? onObjectSelected;
  final VoidCallback? onCameraUpdated;

  @override
  State<HumanViewerWidget> createState() => HumanViewerWidgetState();
}

class HumanViewerWidgetState extends State<HumanViewerWidget> {
  late final WebViewController _controller;
  late final HumanApiService _api;
  bool _isReady = false;
  bool _isLoading = true;

  HumanApiService get api => _api;
  bool get isReady => _isReady;

  @override
  void initState() {
    super.initState();
    _initWebView();
  }

  void _initWebView() {
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(Colors.black)
      ..addJavaScriptChannel(
        'FlutterBridge',
        onMessageReceived: (message) {
          _api.handleMessage(message.message);
        },
      )
      ..setNavigationDelegate(NavigationDelegate(
        onPageFinished: (_) {
          setState(() => _isLoading = false);
        },
      ));

    _api = HumanApiService(controller: _controller);
    _api.onViewerReady = () {
      setState(() => _isReady = true);
      widget.onReady?.call();
    };
    _api.onObjectSelected = widget.onObjectSelected;
    _api.onCameraUpdated = widget.onCameraUpdated;

    _loadViewer(widget.gender);
  }

  void _loadViewer(Gender gender) {
    setState(() {
      _isReady = false;
      _isLoading = true;
    });
    final html = HumanApiService.buildHtml(gender);
    _controller.loadHtmlString(html);
  }

  /// Reload the viewer with a different gender model.
  void switchGender(Gender gender) {
    _loadViewer(gender);
  }

  @override
  void didUpdateWidget(HumanViewerWidget oldWidget) {
    super.didUpdateWidget(oldWidget);
    // Rewire callbacks.
    _api.onObjectSelected = widget.onObjectSelected;
    _api.onCameraUpdated = widget.onCameraUpdated;
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        WebViewWidget(controller: _controller),
        if (_isLoading || !_isReady)
          const Positioned.fill(
            child: ColoredBox(
              color: Colors.black,
              child: Center(
                child: CircularProgressIndicator(
                  color: Colors.white70,
                  strokeWidth: 2,
                ),
              ),
            ),
          ),
      ],
    );
  }
}
