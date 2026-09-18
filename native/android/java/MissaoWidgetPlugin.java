package com.cortexplus.missao3060;

import android.content.Context;
import android.content.SharedPreferences;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "MissaoWidget")
public class MissaoWidgetPlugin extends Plugin {
    @PluginMethod
    public void saveState(PluginCall call) {
        SharedPreferences prefs = getContext().getSharedPreferences("missao_widget", Context.MODE_PRIVATE);
        SharedPreferences.Editor e = prefs.edit();
        e.putInt("day", call.getInt("day", 1));
        e.putInt("streak", call.getInt("streak", 1));
        e.putInt("progress", call.getInt("progress", 0));
        e.putString("weight", call.getString("weight", "--"));
        e.putInt("water", call.getInt("water", 0));
        e.putInt("steps", call.getInt("steps", 0));
        e.putInt("reading", call.getInt("reading", 0));
        e.putInt("cortex", call.getInt("cortex", 0));
        e.putInt("family", call.getInt("family", 0));
        e.putString("mission", call.getString("mission", "Missão em andamento"));
        e.apply();
        MissaoWidgetProvider.updateAll(getContext());
        call.resolve();
    }
}
