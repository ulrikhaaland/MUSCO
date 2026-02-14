package com.musco.musco_app

import android.content.Context
import android.view.View
import android.widget.RelativeLayout
import com.biodigital.humansdk.HKHuman
import com.biodigital.humansdk.HKHumanInterface
import com.biodigital.humansdk.HumanUIOptions
import io.flutter.plugin.common.BinaryMessenger
import io.flutter.plugin.common.MethodCall
import io.flutter.plugin.common.MethodChannel
import io.flutter.plugin.common.StandardMessageCodec
import io.flutter.plugin.platform.PlatformView
import io.flutter.plugin.platform.PlatformViewFactory

/// Factory that creates native HumanViewer platform views on Android.
class HumanViewerFactory(
    private val messenger: BinaryMessenger
) : PlatformViewFactory(StandardMessageCodec.INSTANCE) {

    override fun create(context: Context, viewId: Int, args: Any?): PlatformView {
        return HumanViewerNativeView(context, viewId, messenger)
    }
}

/// Native platform view that hosts an HKHuman (BioDigital 3D canvas) on Android.
class HumanViewerNativeView(
    context: Context,
    viewId: Int,
    messenger: BinaryMessenger
) : PlatformView, MethodChannel.MethodCallHandler, HKHumanInterface {

    private val container: RelativeLayout = RelativeLayout(context).apply {
        layoutParams = RelativeLayout.LayoutParams(
            RelativeLayout.LayoutParams.MATCH_PARENT,
            RelativeLayout.LayoutParams.MATCH_PARENT
        )
        setBackgroundColor(android.graphics.Color.BLACK)
    }

    private var human: HKHuman? = null
    private val channel: MethodChannel =
        MethodChannel(messenger, "com.musco.muscoapp/human_viewer")
    private var hasNotifiedViewReady = false

    init {
        channel.setMethodCallHandler(this)

        println("[HumanViewer] Creating HKHuman")

        // Create the BioDigital 3D view with all UI hidden (matches web config)
        val uiOptions = HashMap<HumanUIOptions, Boolean>()
        uiOptions[HumanUIOptions.all] = false
        uiOptions[HumanUIOptions.onDemand] = false
        uiOptions[HumanUIOptions.info] = false
        human = HKHuman(container, uiOptions)
        human?.setInterface(this)

        println("[HumanViewer] HKHuman created: ${if (human != null) "OK" else "NIL"}")

        // If SDK was already validated (e.g. hot restart), notify Dart immediately.
        if (MainActivity.sdkValidated) {
            container.post {
                channel.invokeMethod("onSDKValid", null)
            }
        }

        // Fallback: notify Dart after a delay to give the internal WebView time
        // to finish loading.
        container.postDelayed({
            notifyViewReady()
        }, 3000)
    }

    override fun getView(): View = container

    override fun dispose() {
        human?.unload()
        channel.setMethodCallHandler(null)
    }

    /// Send onViewReady exactly once.
    private fun notifyViewReady() {
        if (hasNotifiedViewReady) return
        hasNotifiedViewReady = true
        println("[HumanViewer] Notifying Dart: onViewReady")
        container.post {
            channel.invokeMethod("onViewReady", null)
        }
    }

    // -------------------------------------------------------------------------
    // MethodChannel handler (Dart -> Native)
    // -------------------------------------------------------------------------
    override fun onMethodCall(call: MethodCall, result: MethodChannel.Result) {
        when (call.method) {
            "querySDKStatus" -> {
                val valid = MainActivity.sdkValidated
                println("[HumanViewer] querySDKStatus → $valid")
                if (valid) {
                    channel.invokeMethod("onSDKValid", null)
                }
                result.success(valid)
            }

            "loadModel" -> {
                val moduleId = call.arguments as? String
                if (moduleId == null) {
                    result.error("INVALID_ARG", "moduleId must be a String", null)
                    return
                }
                println("[HumanViewer] loadModel called with: $moduleId, human is ${if (human != null) "OK" else "NIL"}")
                human?.load(moduleId)
                result.success(null)
            }

            "selectObjects" -> {
                val args = call.arguments as? Map<*, *>
                @Suppress("UNCHECKED_CAST")
                val selections = args?.get("selections") as? Map<String, Boolean>
                if (selections == null) {
                    result.error("INVALID_ARG", "Expected selections map", null)
                    return
                }
                val toSelect = ArrayList(selections.filter { it.value }.map { it.key })
                if (toSelect.isNotEmpty()) {
                    human?.scene?.select(toSelect)
                }
                val toDeselect = ArrayList(selections.filter { !it.value }.map { it.key })
                if (toDeselect.isNotEmpty()) {
                    human?.scene?.hide(toDeselect)
                }
                result.success(null)
            }

            "enableXray" -> {
                human?.scene?.xray(true)
                result.success(null)
            }

            "disableXray" -> {
                human?.scene?.xray(false)
                result.success(null)
            }

            "setCamera" -> {
                val args = call.arguments as? Map<*, *>
                if (args == null) {
                    result.error("INVALID_ARG", "Expected camera args", null)
                    return
                }
                val objectId = args["objectId"] as? String
                if (objectId != null) {
                    human?.camera?.animateTo(objectId)
                } else {
                    // Manual positioning – reset for now
                    human?.camera?.reset()
                }
                result.success(null)
            }

            "resetScene" -> {
                human?.scene?.reset()
                human?.camera?.reset()
                result.success(null)
            }

            "disableHighlight" -> {
                human?.scene?.disableHighlight()
                result.success(null)
            }

            "enableHighlight" -> {
                human?.scene?.enableHighlight()
                result.success(null)
            }

            else -> result.notImplemented()
        }
    }

    // -------------------------------------------------------------------------
    // HKHumanInterface callbacks (Native -> Dart)
    // -------------------------------------------------------------------------
    override fun onObjectSelected(objectId: String) {
        // Re-suppress info popup on every selection
        human?.ui?.setOption(HumanUIOptions.info, false)
        human?.annotations?.hide()
        container.post {
            channel.invokeMethod("onObjectSelected", objectId)
        }
    }

    override fun onModelLoaded(modelId: String?) {
        // Re-apply UI suppression after model load
        disableAllUI()
        container.post {
            channel.invokeMethod("onModelLoaded", modelId ?: "")
        }
    }

    override fun onModelLoadError(error: String?) {
        println("[HumanViewer] Model load error: $error")
        container.post {
            channel.invokeMethod("onModelLoadError", error ?: "unknown error")
        }
    }

    override fun onChapterTransition(chapterId: String?) {
        // Chapter transitions — unused for now
    }

    /// Force-disable every BioDigital UI element and hide annotations/labels.
    private fun disableAllUI() {
        human?.ui?.setOption(HumanUIOptions.all, false)
        human?.ui?.setOption(HumanUIOptions.info, false)
        human?.ui?.setOption(HumanUIOptions.tools, false)
        human?.ui?.setOption(HumanUIOptions.nav, false)
        human?.ui?.setOption(HumanUIOptions.anatomyLabels, false)
        human?.ui?.setOption(HumanUIOptions.help, false)
        human?.ui?.setOption(HumanUIOptions.reset, false)
        human?.ui?.setOption(HumanUIOptions.layers, false)
        human?.ui?.setOption(HumanUIOptions.labelList, false)
        human?.ui?.setOption(HumanUIOptions.draw, false)
        human?.ui?.setOption(HumanUIOptions.audio, false)
        human?.ui?.setOption(HumanUIOptions.animation, false)
        human?.ui?.setOption(HumanUIOptions.objects, false)
        human?.ui?.setOption(HumanUIOptions.tour, false)
        human?.ui?.setOption(HumanUIOptions.tutorial, false)
        // Hide 3D annotations/labels overlay (separate from UI panel controls)
        human?.annotations?.hide()
    }

}
