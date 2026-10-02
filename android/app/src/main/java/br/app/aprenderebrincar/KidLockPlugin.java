package br.app.aprenderebrincar;

import android.app.Activity;
import android.app.ActivityManager;
import android.content.Context;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

// Trava do Modo criança no Android: fixa o app na tela (Início e Recentes deixam
// de funcionar) até um adulto liberar pela Área da Família ou segurar Voltar + Recentes.
@CapacitorPlugin(name = "KidLock")
public class KidLockPlugin extends Plugin {

    // Lido pela MainActivity para engolir o botão Voltar enquanto a trava está ligada.
    static volatile boolean active = false;

    @PluginMethod
    public void lock(PluginCall call) {
        Activity activity = getActivity();
        active = true;
        activity.runOnUiThread(() -> {
            try {
                if (!isPinned(activity)) activity.startLockTask();
                call.resolve(status(activity));
            } catch (Exception error) {
                call.reject("Não foi possível fixar o app", error);
            }
        });
    }

    @PluginMethod
    public void unlock(PluginCall call) {
        Activity activity = getActivity();
        active = false;
        activity.runOnUiThread(() -> {
            try {
                if (isPinned(activity)) activity.stopLockTask();
            } catch (Exception ignored) {
                // O sistema pode já ter liberado (Voltar + Recentes).
            }
            call.resolve(status(activity));
        });
    }

    @PluginMethod
    public void getStatus(PluginCall call) {
        call.resolve(status(getActivity()));
    }

    private static boolean isPinned(Activity activity) {
        ActivityManager manager = (ActivityManager) activity.getSystemService(Context.ACTIVITY_SERVICE);
        return manager != null && manager.getLockTaskModeState() != ActivityManager.LOCK_TASK_MODE_NONE;
    }

    private static JSObject status(Activity activity) {
        JSObject result = new JSObject();
        result.put("active", active);
        result.put("pinned", isPinned(activity));
        return result;
    }
}
