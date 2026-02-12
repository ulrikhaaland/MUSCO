package com.musco.musco_app

import android.content.Context
import android.view.View
import android.widget.RelativeLayout
import com.biodigital.humansdk.HKHuman
import com.biodigital.humansdk.HKHumanInterface
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

    init {
        channel.setMethodCallHandler(this)

        // Create the BioDigital 3D view inside the container
        human = HKHuman(container)
        human?.setInterface(this)
    }

    override fun getView(): View = container

    override fun dispose() {
        human?.unload()
        channel.setMethodCallHandler(null)
    }

    // -------------------------------------------------------------------------
    // MethodChannel handler (Dart -> Native)
    // -------------------------------------------------------------------------
    override fun onMethodCall(call: MethodCall, result: MethodChannel.Result) {
        when (call.method) {
            "loadModel" -> {
                val moduleId = call.arguments as? String
                if (moduleId == null) {
                    result.error("INVALID_ARG", "moduleId must be a String", null)
                    return
                }
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
        container.post {
            channel.invokeMethod("onObjectSelected", objectId)
        }
    }

    override fun onModelLoaded(modelId: String?) {
        container.post {
            channel.invokeMethod("onModelLoaded", modelId ?: "")
        }
    }

    override fun onModelLoadError(error: String?) {
        container.post {
            println("[HumanViewer] Model load error: $error")
        }
    }

    override fun onChapterTransition(chapterId: String?) {
        // Chapter transitions — unused for now
    }

}
