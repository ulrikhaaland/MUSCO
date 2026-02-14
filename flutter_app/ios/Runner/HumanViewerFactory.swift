import Flutter
import UIKit
import HumanKit

/// Factory that creates native HumanViewer platform views.
class HumanViewerFactory: NSObject, FlutterPlatformViewFactory {

    private let messenger: FlutterBinaryMessenger

    init(messenger: FlutterBinaryMessenger) {
        self.messenger = messenger
        super.init()
    }

    func create(
        withFrame frame: CGRect,
        viewIdentifier viewId: Int64,
        arguments args: Any?
    ) -> FlutterPlatformView {
        return HumanViewerNativeView(
            frame: frame,
            viewIdentifier: viewId,
            arguments: args,
            messenger: messenger
        )
    }

    func createArgsCodec() -> FlutterMessageCodec & NSObjectProtocol {
        return FlutterStandardMessageCodec.sharedInstance()
    }
}

/// Native platform view that hosts an HKHuman (BioDigital 3D canvas).
class HumanViewerNativeView: NSObject, FlutterPlatformView, HKHumanDelegate {

    private let containerView: UIView
    private var human: HKHuman?
    private let channel: FlutterMethodChannel
    private var hasNotifiedViewReady = false

    init(
        frame: CGRect,
        viewIdentifier viewId: Int64,
        arguments args: Any?,
        messenger: FlutterBinaryMessenger
    ) {
        containerView = UIView(frame: frame)
        containerView.backgroundColor = .black
        containerView.autoresizingMask = [.flexibleWidth, .flexibleHeight]

        channel = FlutterMethodChannel(
            name: "com.musco.muscoapp/human_viewer",
            binaryMessenger: messenger
        )

        super.init()

        print("[HumanViewer] Creating HKHuman with frame: \(frame)")

        // Create the BioDigital 3D view with all UI hidden (matches web config)
        let uiOptions: [HumanUIOptions: Bool] = [
            .all: false,
            .nolink: true,       // prevent click-to-info popup
            .info: false,
            .tools: false,
            .nav: false,
            .labels: false,
            .anatomyLabels: false,
            .help: false,
            .reset: false,
            .logo: false,
            .layers: false,
            .labelList: false,
            .draw: false,
            .audio: false,
            .animation: false,
            .objectTree: false,
            .tour: false,
            .tutorial: false,
        ]
        human = HKHuman(view: containerView, options: uiOptions)
        human?.delegate = self

        print("[HumanViewer] HKHuman created: \(human != nil ? "OK" : "NIL")")

        // Listen for commands from Dart
        channel.setMethodCallHandler(handleMethodCall)

        // If SDK was already validated (e.g. hot restart), notify Dart immediately.
        if AppDelegate.sdkValidated {
            DispatchQueue.main.async { [weak self] in
                self?.channel.invokeMethod("onSDKValid", arguments: nil)
            }
        }

        // Fallback: notify Dart after a delay to give the internal WebView time
        // to finish loading. initScene will fire earlier if available.
        DispatchQueue.main.asyncAfter(deadline: .now() + 3.0) { [weak self] in
            self?.notifyViewReady()
        }
    }

    func view() -> UIView {
        return containerView
    }

    /// Send onViewReady exactly once.
    private func notifyViewReady() {
        guard !hasNotifiedViewReady else { return }
        hasNotifiedViewReady = true
        print("[HumanViewer] Notifying Dart: onViewReady")
        channel.invokeMethod("onViewReady", arguments: nil)
    }

    // MARK: - MethodChannel handler (Dart → Native)

    private func handleMethodCall(_ call: FlutterMethodCall, result: @escaping FlutterResult) {
        switch call.method {

        case "querySDKStatus":
            let valid = AppDelegate.sdkValidated
            print("[HumanViewer] querySDKStatus → \(valid)")
            if valid {
                channel.invokeMethod("onSDKValid", arguments: nil)
            }
            result(valid)

        case "loadModel":
            guard let moduleId = call.arguments as? String else {
                result(FlutterError(code: "INVALID_ARG", message: "moduleId must be a String", details: nil))
                return
            }
            print("[HumanViewer] loadModel called with: \(moduleId), human is \(human != nil ? "OK" : "NIL")")
            human?.load(model: moduleId)
            result(nil)

        case "selectObjects":
            guard let args = call.arguments as? [String: Any],
                  let selections = args["selections"] as? [String: Bool] else {
                result(FlutterError(code: "INVALID_ARG", message: "Expected selections map", details: nil))
                return
            }
            let toSelect = selections.filter { $0.value }.map { $0.key }
            if !toSelect.isEmpty {
                human?.scene.select(objectIds: toSelect)
            }
            // For deselection, use undoSelections or hide
            let toDeselect = selections.filter { !$0.value }.map { $0.key }
            if !toDeselect.isEmpty {
                human?.scene.hide(objectIds: toDeselect)
            }
            result(nil)

        case "enableXray":
            human?.scene.xray(true)
            result(nil)

        case "disableXray":
            human?.scene.xray(false)
            result(nil)

        case "setCamera":
            guard let args = call.arguments as? [String: Any] else {
                result(FlutterError(code: "INVALID_ARG", message: "Expected camera args", details: nil))
                return
            }
            // If objectId provided, animate camera to that object
            if let objectId = args["objectId"] as? String {
                human?.camera.animateTo(objectId: objectId)
            } else {
                // Manual camera positioning
                let eye = (args["position"] as? [String: Double]).map { [$0["x"] ?? 0, $0["y"] ?? 0, $0["z"] ?? 0] }
                let look = (args["target"] as? [String: Double]).map { [$0["x"] ?? 0, $0["y"] ?? 0, $0["z"] ?? 0] }
                let up = (args["up"] as? [String: Double]).map { [$0["x"] ?? 0, $0["y"] ?? 0, $0["z"] ?? 0] }
                let animated = args["animate"] as? Bool ?? true
                human?.camera.set(eyeIn: eye, lookIn: look, upIn: up, animated: animated)
            }
            result(nil)

        case "resetScene":
            human?.scene.reset()
            human?.camera.reset()
            result(nil)

        case "disableHighlight":
            human?.scene.disableHighlight()
            result(nil)

        case "enableHighlight":
            human?.scene.enableHighlight()
            result(nil)

        default:
            result(FlutterMethodNotImplemented)
        }
    }

    // MARK: - HKHumanDelegate (Native → Dart)

    func human(_ view: HKHuman, objectSelected: String) {
        // Re-suppress info popup on every selection
        human?.setupUI(option: .info, value: false)
        human?.setupUI(option: .nolink, value: true)
        human?.labels.hide()
        DispatchQueue.main.async { [weak self] in
            self?.channel.invokeMethod("onObjectSelected", arguments: objectSelected)
        }
    }

    func human(_ view: HKHuman, objectDeselected: String) {
        DispatchQueue.main.async { [weak self] in
            self?.channel.invokeMethod("onObjectDeselected", arguments: objectDeselected)
        }
    }

    func human(_ view: HKHuman, modelLoaded: String) {
        // Re-apply UI suppression after model load
        disableAllUI()
        DispatchQueue.main.async { [weak self] in
            self?.channel.invokeMethod("onModelLoaded", arguments: modelLoaded)
        }
    }

    func human(_ view: HKHuman, initScene: String) {
        print("[HumanViewer] initScene fired: \(initScene)")
        // Suppress UI once scene is ready
        disableAllUI()
        DispatchQueue.main.async { [weak self] in
            self?.notifyViewReady()
        }
    }

    /// Force-disable every BioDigital UI element, info popup, and 3D labels.
    private func disableAllUI() {
        human?.setupUI(option: .all, value: false)
        human?.setupUI(option: .nolink, value: true)  // prevent click-to-info
        human?.setupUI(option: .info, value: false)
        human?.setupUI(option: .tools, value: false)
        human?.setupUI(option: .nav, value: false)
        human?.setupUI(option: .labels, value: false)
        human?.setupUI(option: .anatomyLabels, value: false)
        human?.setupUI(option: .help, value: false)
        human?.setupUI(option: .reset, value: false)
        human?.setupUI(option: .logo, value: false)
        human?.setupUI(option: .layers, value: false)
        human?.setupUI(option: .labelList, value: false)
        human?.setupUI(option: .draw, value: false)
        human?.setupUI(option: .audio, value: false)
        human?.setupUI(option: .animation, value: false)
        human?.setupUI(option: .objectTree, value: false)
        human?.setupUI(option: .tour, value: false)
        human?.setupUI(option: .tutorial, value: false)
        // Hide the actual 3D labels/annotations overlay
        human?.labels.hide()
    }

    func human(_ view: HKHuman, modelLoadError: String) {
        print("[HumanViewer] Model load error: \(modelLoadError)")
        DispatchQueue.main.async { [weak self] in
            self?.channel.invokeMethod("onModelLoadError", arguments: modelLoadError)
        }
    }
}
