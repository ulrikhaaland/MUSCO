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

        // Create the BioDigital 3D view
        human = HKHuman(view: containerView)
        human?.delegate = self

        // Listen for commands from Dart
        channel.setMethodCallHandler(handleMethodCall)
    }

    func view() -> UIView {
        return containerView
    }

    // MARK: - MethodChannel handler (Dart → Native)

    private func handleMethodCall(_ call: FlutterMethodCall, result: @escaping FlutterResult) {
        switch call.method {

        case "loadModel":
            guard let moduleId = call.arguments as? String else {
                result(FlutterError(code: "INVALID_ARG", message: "moduleId must be a String", details: nil))
                return
            }
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
        DispatchQueue.main.async { [weak self] in
            self?.channel.invokeMethod("onModelLoaded", arguments: modelLoaded)
        }
    }

    func human(_ view: HKHuman, initScene: String) {
        // Scene initialized — can be used for post-load setup
    }

    func human(_ view: HKHuman, modelLoadError: String) {
        print("[HumanViewer] Model load error: \(modelLoadError)")
    }
}
