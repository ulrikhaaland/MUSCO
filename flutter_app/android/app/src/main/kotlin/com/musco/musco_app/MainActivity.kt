package com.musco.musco_app

import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel
import com.biodigital.humansdk.HKServices
import com.biodigital.humansdk.HKServicesInterface

class MainActivity : FlutterActivity(), HKServicesInterface {

    private val channelName = "com.musco.muscoapp/human_viewer"

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
        // Dashboard models loaded — unused
    }
}
