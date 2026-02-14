import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:device_info_plus/device_info_plus.dart';

class AssistantStreamEvent {
  const AssistantStreamEvent({
    this.type,
    this.text,
    this.followUp,
    this.assistantResponse,
    this.error,
  });

  final String? type;
  final String? text;
  final Map<String, dynamic>? followUp;
  final Map<String, dynamic>? assistantResponse;
  final String? error;
}

class AssistantApiClient {
  AssistantApiClient({
    String? baseUrl,
    Future<String?> Function()? authTokenProvider,
  })  : _baseUrlOverride = baseUrl,
        _authTokenProvider = authTokenProvider {
    _httpClient.connectionTimeout = const Duration(seconds: 12);
    _httpClient.idleTimeout = const Duration(seconds: 20);
  }

  final String? _baseUrlOverride;
  final Future<String?> Function()? _authTokenProvider;
  final HttpClient _httpClient = HttpClient();
  final DeviceInfoPlugin _deviceInfo = DeviceInfoPlugin();

  static const String _defaultPhysicalDeviceBaseUrl = String.fromEnvironment(
    'API_PHYSICAL_BASE_URL',
    defaultValue: 'https://musco-one.vercel.app',
  );

  Future<Uri> _resolveAssistantUri() async {
    final baseUrl = await _resolveBaseUrl();
    return Uri.parse('$baseUrl/api/assistant');
  }

  Future<String> _resolveBaseUrl() async {
    final override = _baseUrlOverride;
    if (override != null && override.trim().isNotEmpty) {
      return override.trim().replaceAll(RegExp(r'/$'), '');
    }

    const fromDefine = String.fromEnvironment('API_BASE_URL', defaultValue: '');
    if (fromDefine.trim().isNotEmpty) {
      return fromDefine.trim().replaceAll(RegExp(r'/$'), '');
    }

    final isPhysical = await _isPhysicalDevice();
    if (isPhysical) {
      return _defaultPhysicalDeviceBaseUrl.replaceAll(RegExp(r'/$'), '');
    }

    // Emulator/simulator defaults.
    if (Platform.isAndroid) return 'http://10.0.2.2:3000';
    return 'http://localhost:3000';
  }

  Future<bool> _isPhysicalDevice() async {
    try {
      if (Platform.isAndroid) {
        final info = await _deviceInfo.androidInfo;
        return info.isPhysicalDevice;
      }
      if (Platform.isIOS) {
        final info = await _deviceInfo.iosInfo;
        return info.isPhysicalDevice;
      }
    } catch (_) {
      // Fall back to conservative assumptions below.
    }

    // If detection fails, prefer local dev assumptions on mobile simulators.
    if (Platform.isAndroid || Platform.isIOS) return false;
    return true;
  }

  Future<String?> _resolveAuthToken() async {
    final provider = _authTokenProvider;
    if (provider == null) return null;
    try {
      final token = await provider();
      if (token == null || token.trim().isEmpty) return null;
      return token.trim();
    } catch (_) {
      return null;
    }
  }

  Stream<AssistantStreamEvent> streamMessage({
    required String message,
    required String language,
    required String? selectedBodyGroupName,
    required String? selectedBodyPart,
    required List<String> bodyPartsInSelectedGroup,
    required List<Map<String, String>> messages,
  }) async* {
    final assistantUri = await _resolveAssistantUri();

    // Useful while wiring environments (local emulator / simulator / prod).
    // Ignore in release logs if not needed.
    // ignore: avoid_print
    print('[AssistantApiClient] POST $assistantUri');
    final request = await _httpClient
        .postUrl(assistantUri)
        .timeout(
          const Duration(seconds: 15),
          onTimeout: () {
            throw TimeoutException(
              'Timeout connecting to $assistantUri. Check API_BASE_URL and backend availability.',
            );
          },
        );
    request.headers.contentType = ContentType.json;
    request.headers.set(HttpHeaders.acceptHeader, 'text/event-stream');
    final authToken = await _resolveAuthToken();
    if (authToken != null) {
      request.headers.set(HttpHeaders.authorizationHeader, 'Bearer $authToken');
    }

    final body = {
      'action': 'send_message_chat',
      'threadId': 'flutter-mobile',
      'stream': true,
      'payload': {
        'message': message,
        'selectedBodyGroupName': selectedBodyGroupName,
        'selectedBodyPart':
            selectedBodyPart ?? 'no body part of body group selected',
        'bodyPartsInSelectedGroup': bodyPartsInSelectedGroup,
        'language': language,
        'messages': messages,
      },
    };

    request.write(jsonEncode(body));
    final response = await request.close().timeout(
      const Duration(seconds: 45),
      onTimeout: () {
        throw TimeoutException(
          'No response from $assistantUri within 45s. Check backend logs/network.',
        );
      },
    );

    if (response.statusCode < 200 || response.statusCode >= 300) {
      final errorText = await utf8.decoder.bind(response).join();
      throw HttpException(
        'Assistant request failed: ${response.statusCode} $errorText',
        uri: assistantUri,
      );
    }

    final dataLines = <String>[];
    var buffer = '';

    void emitFromDataBlock(String raw, EventSink<AssistantStreamEvent> sink) {
      if (raw.isEmpty || raw == '[DONE]') return;
      try {
        final decoded = jsonDecode(raw);
        if (decoded is! Map<String, dynamic>) return;

        final type = decoded['type'] as String?;
        if (type == 'text') {
          sink.add(
            AssistantStreamEvent(
              type: 'text',
              text: decoded['content'] as String? ?? '',
            ),
          );
          return;
        }

        if (type == 'followup') {
          final q = decoded['question'];
          if (q is Map<String, dynamic>) {
            sink.add(AssistantStreamEvent(type: 'followup', followUp: q));
          }
          return;
        }

        if (type == 'assistant_response') {
          final payload = decoded['response'];
          if (payload is Map<String, dynamic>) {
            sink.add(
              AssistantStreamEvent(
                type: 'assistant_response',
                assistantResponse: payload,
              ),
            );
          }
          return;
        }

        if (type == 'complete') {
          sink.add(const AssistantStreamEvent(type: 'complete'));
          return;
        }

        final legacyPayload = decoded['payload'];
        if (legacyPayload is Map<String, dynamic> &&
            legacyPayload['error'] != null) {
          sink.add(
            AssistantStreamEvent(
              type: 'error',
              error: legacyPayload['error'].toString(),
            ),
          );
          return;
        }
      } catch (_) {
        // Ignore malformed chunks and continue stream parsing.
      }
    }

    final controller = StreamController<AssistantStreamEvent>();

    unawaited(() async {
      try {
        await for (final chunk in response.transform(utf8.decoder)) {
          buffer += chunk;

          while (true) {
            final newlineIdx = buffer.indexOf('\n');
            if (newlineIdx == -1) break;

            var line = buffer.substring(0, newlineIdx);
            buffer = buffer.substring(newlineIdx + 1);
            line = line.replaceAll('\r', '');

            if (line.isEmpty) {
              if (dataLines.isNotEmpty) {
                final payload = dataLines.join('\n');
                dataLines.clear();
                emitFromDataBlock(payload, controller.sink);
              }
              continue;
            }

            if (line.startsWith('data:')) {
              dataLines.add(line.substring(5).trimLeft());
            }
          }
        }

        if (dataLines.isNotEmpty) {
          emitFromDataBlock(dataLines.join('\n'), controller.sink);
        }
      } catch (e) {
        controller.add(
          AssistantStreamEvent(type: 'error', error: e.toString()),
        );
      } finally {
        await controller.close();
      }
    }());

    yield* controller.stream;
  }

  void dispose() {
    _httpClient.close(force: true);
  }
}
