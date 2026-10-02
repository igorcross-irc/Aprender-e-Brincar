package br.app.aprenderebrincar;

import android.content.pm.PackageInfo;
import android.os.Build;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

// Versão do APK instalado e a impressão digital da parte nativa (public/native.json
// gravado no build, dentro do APK). Uma atualização de conteúdo só é aplicada se a
// impressão digital bater; senão, o app oferece o APK novo (src/core/app-update.js).
@CapacitorPlugin(name = "AppInfo")
public class AppInfoPlugin extends Plugin {

    @PluginMethod
    public void getNative(PluginCall call) {
        JSObject result = new JSObject();
        try {
            PackageInfo info = getContext().getPackageManager().getPackageInfo(getContext().getPackageName(), 0);
            long code = Build.VERSION.SDK_INT >= 28 ? info.getLongVersionCode() : info.versionCode;
            result.put("versionCode", code);
            result.put("versionName", info.versionName);
        } catch (Exception ignored) {
            result.put("versionCode", 0);
        }
        try (InputStream in = getContext().getAssets().open("public/native.json")) {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            byte[] buffer = new byte[1024];
            int read;
            while ((read = in.read(buffer)) != -1) out.write(buffer, 0, read);
            JSONObject json = new JSONObject(new String(out.toByteArray(), StandardCharsets.UTF_8));
            result.put("fingerprint", json.optString("fingerprint", ""));
            result.put("builtinVersion", json.optString("version", ""));
        } catch (Exception ignored) {
            result.put("fingerprint", "");
        }
        call.resolve(result);
    }
}
