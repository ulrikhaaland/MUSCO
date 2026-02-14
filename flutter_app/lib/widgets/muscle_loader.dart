import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';

/// Animated body-outline loader replicating the web MuscleLoader component.
///
/// Shows a faint stroked body outline with an indigo "streamDown" scan band
/// sweeping continuously from top to bottom.
class MuscleLoader extends StatefulWidget {
  const MuscleLoader({
    super.key,
    this.baseColor = const Color(0xFF334155),
    this.pulseColor = const Color(0xFF6366F1),
    this.message,
  });

  final Color baseColor;
  final Color pulseColor;
  final String? message;

  @override
  State<MuscleLoader> createState() => _MuscleLoaderState();
}

class _MuscleLoaderState extends State<MuscleLoader>
    with TickerProviderStateMixin {
  late final AnimationController _scanController;
  late final AnimationController _dotController;

  @override
  void initState() {
    super.initState();
    _scanController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2600),
    )..repeat();

    _dotController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    )..repeat();
  }

  @override
  void dispose() {
    _scanController.dispose();
    _dotController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      color: const Color(0xFF0F172A), // slate-900
      child: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            SizedBox(
              width: 280,
              child: AspectRatio(
                aspectRatio: 587 / 1137,
                child: Stack(
                  children: [
                    // Base outline – subtle, low opacity (strokeWidth 1 in SVG)
                    Opacity(
                      opacity: 0.4,
                      child: SvgPicture.asset(
                        'assets/images/body_outline.svg',
                        colorFilter: ColorFilter.mode(
                          widget.baseColor,
                          BlendMode.srcIn,
                        ),
                      ),
                    ),
                    // Animated pulse layer with gradient mask (strokeWidth 2 via transform)
                    AnimatedBuilder(
                      animation: _scanController,
                      builder: (context, child) {
                        return ShaderMask(
                          shaderCallback: (bounds) =>
                              _streamGradient(
                                bounds,
                                _scanController.value,
                              ).createShader(bounds),
                          blendMode: BlendMode.dstIn,
                          child: child,
                        );
                      },
                      child: Opacity(
                        opacity: 0.95,
                        child: SvgPicture.asset(
                          'assets/images/body_outline.svg',
                          colorFilter: ColorFilter.mode(
                            widget.pulseColor,
                            BlendMode.srcIn,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            if (widget.message != null) ...[
              const SizedBox(height: 24),
              AnimatedBuilder(
                animation: _dotController,
                builder: (context, _) {
                  final frame = (_dotController.value * 3).floor() % 3;
                  final dots = ['\u00b7  ', '\u00b7\u00b7  ', '\u00b7\u00b7\u00b7'][frame];
                  return Text(
                    '${widget.message}$dots',
                    style: const TextStyle(
                      color: Color(0xFFCBD5E1), // slate-300
                      fontSize: 14,
                    ),
                  );
                },
              ),
            ],
          ],
        ),
      ),
    );
  }

  /// Creates a vertical linear gradient that acts as the "streamDown" mask.
  ///
  /// Matches the web version: a 900/1137 ≈ 79% band with 30%/70% gradient
  /// stops (soft leading/trailing edges), translating from above to below.
  LinearGradient _streamGradient(Rect bounds, double progress) {
    // Web: band = 900px of 1137px ≈ 0.79, travels from -900 to +2200
    // Total travel = 2200 + 900 (start offset) normalised to viewBox
    const bandRatio = 900.0 / 1137.0; // ~0.79
    const totalTravel = (2200.0 + 900.0) / 1137.0; // ~2.73
    final bandTop = -bandRatio + progress * totalTravel;
    final bandBottom = bandTop + bandRatio;

    // Web gradient stops: 0% black, 30% white, 70% white, 100% black
    final fadeIn = bandRatio * 0.30;
    final fadeOut = bandRatio * 0.30;

    return LinearGradient(
      begin: Alignment.topCenter,
      end: Alignment.bottomCenter,
      colors: const [
        Colors.transparent,
        Colors.white,
        Colors.white,
        Colors.transparent,
      ],
      stops: [
        bandTop.clamp(0.0, 1.0),
        (bandTop + fadeIn).clamp(0.0, 1.0),
        (bandBottom - fadeOut).clamp(0.0, 1.0),
        bandBottom.clamp(0.0, 1.0),
      ],
    );
  }
}
