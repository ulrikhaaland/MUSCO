package com.musco.musco_app

import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel
import com.biodigital.humansdk.HKServices
import com.biodigital.humansdk.HKServicesInterface

class MainActivity : FlutterActivity(), HKServicesInterface {

    private val channelName = "com.musco.muscoapp/human_viewer"

    companion object {
        /// Tracks whether the BioDigital SDK has been validated (survives hot restart).
        var sdkValidated = false
    }

    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)

        // Initialize BioDigital SDK validation
        HKServices.getInstance().setup(this, this)

        // Register the native platform view for the 3D viewer
        flutterEngine.platformViewsController.registry
            .registerViewFactory(
                "com.musco.muscoapp/human_viewer_view",
                HumanViewerFactory(flutterEngine.dartExecutor.binaryMessenger)
            )
    }

    // -------------------------------------------------------------------------
    // HKServicesInterface — SDK validation callbacks
    // -------------------------------------------------------------------------
    override fun onValidSDK() {
        println("[BioDigital] SDK validated successfully")
        sdkValidated = true
        // Fetch organization's model library for debugging
        HKServices.getInstance().getModels()
        flutterEngine?.dartExecutor?.binaryMessenger?.let { messenger ->
            val channel = MethodChannel(messenger, channelName)
            runOnUiThread {
                channel.invokeMethod("onSDKValid", null)
            }
        }
    }

    override fun onInvalidSDK() {
        println("[BioDigital] SDK validation FAILED — check API key and bundle ID")
        flutterEngine?.dartExecutor?.binaryMessenger?.let { messenger ->
            val channel = MethodChannel(messenger, channelName)
            runOnUiThread {
                channel.invokeMethod("onSDKInvalid", null)
            }
        }
    }

    override fun onModelsLoaded() {
        val models = HKServices.getInstance().models
        println("[BioDigital] Organization library: ${models.size} models")
        for (model in models) {
            println("[BioDigital] Model: id=${model.id}, title=${model.title}")
        }
    }
}
