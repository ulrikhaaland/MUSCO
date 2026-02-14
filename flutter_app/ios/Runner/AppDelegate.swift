import Flutter
import UIKit
import HumanKit

@main
@objc class AppDelegate: FlutterAppDelegate, HKServicesDelegate {

    /// Tracks whether the BioDigital SDK has been validated (survives hot restart).
    static var sdkValidated = false

    override func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
    ) -> Bool {
        // Initialize BioDigital SDK validation with key + secret from Info.plist
        let key = Bundle.main.object(forInfoDictionaryKey: "BioDigitalSDKKey") as? String ?? ""
        let secret = Bundle.main.object(forInfoDictionaryKey: "BioDigitalSDKSecret") as? String ?? ""
        if !key.isEmpty && !secret.isEmpty {
            HKServices.shared.setup(key: key, secret: secret, delegate: self)
        } else {
            HKServices.shared.setup(delegate: self)
        }

        // Register the native platform view for the 3D viewer
        let registrar = self.registrar(forPlugin: "HumanViewerPlugin")!
        let factory = HumanViewerFactory(messenger: registrar.messenger())
        registrar.register(factory, withId: "com.musco.muscoapp/human_viewer_view")

        GeneratedPluginRegistrant.register(with: self)
        return super.application(application, didFinishLaunchingWithOptions: launchOptions)
    }

    // MARK: - HKServicesDelegate

    func onValidSDK() {
        print("[BioDigital] SDK validated successfully")
        AppDelegate.sdkValidated = true
        // Fetch organization's model library
        HKServices.shared.getModels()
        // Notify Flutter via the method channel
        guard let controller = window?.rootViewController as? FlutterViewController else { return }
        let channel = FlutterMethodChannel(
            name: "com.musco.muscoapp/human_viewer",
            binaryMessenger: controller.binaryMessenger
        )
        channel.invokeMethod("onSDKValid", arguments: nil)
    }

    func onInvalidSDK() {
        print("[BioDigital] SDK validation FAILED — check API key and bundle ID")
        guard let controller = window?.rootViewController as? FlutterViewController else { return }
        let channel = FlutterMethodChannel(
            name: "com.musco.muscoapp/human_viewer",
            binaryMessenger: controller.binaryMessenger
        )
        channel.invokeMethod("onSDKInvalid", arguments: nil)
    }

    func modelsLoaded() {
        let models = HKServices.shared.models
        print("[BioDigital] Library models loaded: \(models.count) models")
        for model in models {
            print("[BioDigital]   modelId=\(model.modelId)  title=\(model.title)")
        }
    }
}
